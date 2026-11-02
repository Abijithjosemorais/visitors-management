import { Visit } from '../types'
import { db, delay, evaluateInductionStatus, getSimulatedNow } from './db'
import { auditApi } from './audit'

export const visitsApi = {
  async getOpenVisits(): Promise<Visit[]> {
    await delay()
    const visits = db.getVisits()
    return visits.filter(v => v.status === 'ON_SITE')
  },

  async getAllVisits(filters?: {
    startDate?: string
    endDate?: string
    visitorId?: string
    department?: string
    status?: string
  }): Promise<Visit[]> {
    await delay()
    let visits = db.getVisits()

    if (filters?.visitorId) {
      visits = visits.filter(v => v.visitorId === filters.visitorId)
    }
    if (filters?.department && filters.department !== 'ALL') {
      visits = visits.filter(v => v.department === filters.department)
    }
    if (filters?.status && filters.status !== 'ALL') {
      visits = visits.filter(v => v.status === filters.status)
    }

    return visits.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
  },

  async logEntry(params: {
    visitorId: string
    purpose: string
    hostName?: string
    department?: string
    visitorType?: string
    ppeItemsLent?: string[]
    staffUserId: string
  }): Promise<Visit> {
    await delay()
    const visitors = db.getVisitors()
    const visitor = visitors.find(v => v.id === params.visitorId)
    if (!visitor) throw new Error('Visitor not found')

    if (visitor.isBlocked) {
      throw new Error(`Entry Denied: Visitor is blocked. Reason: ${visitor.blockReason || 'Security policy'}`)
    }

    // Check induction validity
    const inductionValidation = evaluateInductionStatus(visitor.id)
    if (inductionValidation.status !== 'VALID') {
      throw new Error('Entry Denied: Visitor does not possess a valid safety induction.')
    }

    // Check if already open visit
    const visits = db.getVisits()
    const existingOpen = visits.find(v => v.visitorId === visitor.id && v.status === 'ON_SITE')
    if (existingOpen) {
      throw new Error(`Visitor already has an open visit logged at ${new Date(existingOpen.checkInTime).toLocaleTimeString('en-GB')}. Please close that visit before logging a new entry.`)
    }

    const now = getSimulatedNow().toISOString()
    const newVisit: Visit = {
      id: `VST-${String(visits.length + 1).padStart(4, '0')}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorCompany: visitor.company,
      visitorType: params.visitorType || visitor.visitorType,
      purpose: params.purpose,
      hostName: params.hostName || 'Reception / General',
      department: params.department || 'General Facility',
      checkInTime: now,
      status: 'ON_SITE',
      ppeItemsLent: params.ppeItemsLent || [],
      staffCheckInId: params.staffUserId
    }

    visits.unshift(newVisit)
    db.setVisits(visits)

    await auditApi.logAction({
      action: 'VISIT_CHECK_IN',
      resourceType: 'Visit',
      resourceId: newVisit.id,
      details: `Checked in visitor ${visitor.name} (${visitor.id}) for purpose "${params.purpose}". Lent PPE: ${newVisit.ppeItemsLent.join(', ') || 'None'}`
    })

    return newVisit
  },

  async checkOut(visitId: string, staffUserId: string, notes?: string): Promise<Visit> {
    await delay()
    const visits = db.getVisits()
    const index = visits.findIndex(v => v.id === visitId)
    if (index === -1) throw new Error('Visit record not found')

    const visit = visits[index]
    if (visit.status !== 'ON_SITE') {
      throw new Error('This visit has already been checked out.')
    }

    const now = getSimulatedNow().toISOString()
    visit.checkOutTime = now
    visit.status = 'CHECKED_OUT'
    visit.staffCheckOutId = staffUserId

    db.setVisits(visits)

    await auditApi.logAction({
      action: 'VISIT_CHECK_OUT',
      resourceType: 'Visit',
      resourceId: visitId,
      details: `Checked out visitor ${visit.visitorName} (${visit.visitorId}). Returned PPE verified. ${notes || ''}`
    })

    return visit
  },

  async autoCheckOutOpen(): Promise<number> {
    const visits = db.getVisits()
    const now = getSimulatedNow().toISOString()
    let count = 0

    visits.forEach(v => {
      if (v.status === 'ON_SITE') {
        v.status = 'AUTO_CHECKED_OUT'
        v.checkOutTime = now
        count++
      }
    })

    if (count > 0) {
      db.setVisits(visits)
      await auditApi.logAction({
        action: 'VISITS_AUTO_CHECKOUT',
        resourceType: 'Visit',
        details: `System automatically checked out ${count} open visit(s) at end-of-day boundary.`
      })
    }

    return count
  }
}
