import { Visitor, VisitorIdType } from '../types'
import { db, delay, evaluateInductionStatus } from './db'
import { auditApi } from './audit'

export interface VisitorWithStatus extends Visitor {
  inductionStatus: 'VALID' | 'EXPIRED' | 'NONE'
  inductionDaysLeft?: number
  inductionExpiryDate?: string
  hasOpenVisit?: boolean
  openVisitId?: string
}

export const visitorsApi = {
  async search(query: string): Promise<VisitorWithStatus | null> {
    await delay()
    const clean = query.trim().toUpperCase()
    if (!clean) return null

    const visitors = db.getVisitors()
    const visits = db.getVisits()

    // Match QID (11 digits), Visitor ID (VIS-000123), or Passport/other ID number (exact match)
    const match = visitors.find(v => {
      const vid = v.id.toUpperCase()
      const idNum = v.idNumber.toUpperCase()
      return vid === clean || idNum === clean
    })

    if (!match) return null

    const inductionResult = evaluateInductionStatus(match.id)
    const openVisit = visits.find(v => v.visitorId === match.id && v.status === 'ON_SITE')

    return {
      ...match,
      inductionStatus: inductionResult.status,
      inductionDaysLeft: inductionResult.daysLeft,
      inductionExpiryDate: inductionResult.expiresAt,
      hasOpenVisit: Boolean(openVisit),
      openVisitId: openVisit?.id
    }
  },

  async getAll(filters?: {
    type?: string
    status?: string // 'VALID' | 'EXPIRED' | 'NONE' | 'BLOCKED'
    search?: string
  }): Promise<VisitorWithStatus[]> {
    await delay()
    let visitors = db.getVisitors()
    const visits = db.getVisits()

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase()
      visitors = visitors.filter(
        v =>
          v.name.toLowerCase().includes(q) ||
          v.company.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q) ||
          v.idNumber.toLowerCase().includes(q)
      )
    }

    if (filters?.type && filters.type !== 'ALL') {
      visitors = visitors.filter(v => v.visitorType === filters.type)
    }

    const enhanced = visitors.map(v => {
      const ind = evaluateInductionStatus(v.id)
      const openVisit = visits.find(visit => visit.visitorId === v.id && visit.status === 'ON_SITE')
      return {
        ...v,
        inductionStatus: ind.status,
        inductionDaysLeft: ind.daysLeft,
        inductionExpiryDate: ind.expiresAt,
        hasOpenVisit: Boolean(openVisit),
        openVisitId: openVisit?.id
      }
    })

    if (filters?.status && filters.status !== 'ALL') {
      if (filters.status === 'BLOCKED') {
        return enhanced.filter(v => v.isBlocked)
      }
      return enhanced.filter(v => !v.isBlocked && v.inductionStatus === filters.status)
    }

    return enhanced
  },

  async getById(id: string): Promise<VisitorWithStatus | null> {
    await delay()
    const visitors = db.getVisitors()
    const match = visitors.find(v => v.id.toUpperCase() === id.trim().toUpperCase())
    if (!match) return null

    const inductionResult = evaluateInductionStatus(match.id)
    const visits = db.getVisits()
    const openVisit = visits.find(v => v.visitorId === match.id && v.status === 'ON_SITE')

    return {
      ...match,
      inductionStatus: inductionResult.status,
      inductionDaysLeft: inductionResult.daysLeft,
      inductionExpiryDate: inductionResult.expiresAt,
      hasOpenVisit: Boolean(openVisit),
      openVisitId: openVisit?.id
    }
  },

  async checkDuplicate(idType: VisitorIdType, idNumber: string, excludeId?: string): Promise<Visitor | null> {
    await delay(100)
    const cleanNum = idNumber.trim().toUpperCase()
    const visitors = db.getVisitors()
    const dup = visitors.find(
      v =>
        v.idType === idType &&
        v.idNumber.trim().toUpperCase() === cleanNum &&
        v.id !== excludeId
    )
    return dup || null
  },

  async create(data: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt' | 'isBlocked'>): Promise<Visitor> {
    await delay()
    const visitors = db.getVisitors()

    // Check duplicate
    const dup = visitors.find(
      v => v.idType === data.idType && v.idNumber.trim().toUpperCase() === data.idNumber.trim().toUpperCase()
    )
    if (dup) {
      throw new Error(`A visitor with this ${data.idType} (${data.idNumber}) is already registered as ${dup.name} (${dup.id}).`)
    }

    // Generate VIS-000123 format
    const maxNum = visitors.reduce((max, v) => {
      const match = v.id.match(/^VIS-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        return num > max ? num : max
      }
      return max
    }, 100)

    const nextId = `VIS-${String(maxNum + 1).padStart(6, '0')}`
    const now = new Date().toISOString()

    const newVisitor: Visitor = {
      ...data,
      id: nextId,
      isBlocked: false,
      createdAt: now,
      updatedAt: now
    }

    visitors.unshift(newVisitor)
    db.setVisitors(visitors)

    await auditApi.logAction({
      action: 'VISITOR_REGISTERED',
      resourceType: 'Visitor',
      resourceId: nextId,
      details: `Registered new visitor ${newVisitor.name} (${nextId}) from ${newVisitor.company}`
    })

    return newVisitor
  },

  async update(id: string, data: Partial<Visitor>): Promise<Visitor> {
    await delay()
    const visitors = db.getVisitors()
    const index = visitors.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error('Visitor not found')
    }

    const before = { ...visitors[index] }
    const updated: Visitor = {
      ...visitors[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    visitors[index] = updated
    db.setVisitors(visitors)

    await auditApi.logAction({
      action: 'VISITOR_UPDATED',
      resourceType: 'Visitor',
      resourceId: id,
      details: `Updated details for visitor ${updated.name} (${id})`,
      beforeState: before,
      afterState: updated
    })

    return updated
  },

  async block(id: string, reason: string, staffName: string): Promise<Visitor> {
    await delay()
    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed mandatory reason is required to block a visitor.')
    }

    const visitors = db.getVisitors()
    const index = visitors.findIndex(v => v.id === id)
    if (index === -1) throw new Error('Visitor not found')

    const before = { ...visitors[index] }
    const now = new Date().toISOString()
    visitors[index].isBlocked = true
    visitors[index].blockReason = reason.trim()
    visitors[index].blockedAt = now
    visitors[index].blockedBy = staffName
    visitors[index].updatedAt = now

    db.setVisitors(visitors)

    // Add notification for SuperAdmin
    const notifications = db.getNotifications()
    notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      timestamp: now,
      title: 'Visitor Blocked Alert',
      message: `${visitors[index].name} (${id}) was blocked: "${reason.trim()}" by ${staffName}`,
      type: 'ALERT',
      read: false,
      visitorId: id
    })
    db.setNotifications(notifications)

    await auditApi.logAction({
      action: 'VISITOR_BLOCKED',
      resourceType: 'Visitor',
      resourceId: id,
      details: `Blocked visitor ${visitors[index].name} (${id}). Reason: ${reason}`,
      beforeState: before,
      afterState: visitors[index]
    })

    return visitors[index]
  },

  async unblock(id: string, reason: string, staffName: string): Promise<Visitor> {
    await delay()
    const visitors = db.getVisitors()
    const index = visitors.findIndex(v => v.id === id)
    if (index === -1) throw new Error('Visitor not found')

    const before = { ...visitors[index] }
    const now = new Date().toISOString()
    visitors[index].isBlocked = false
    visitors[index].blockReason = undefined
    visitors[index].blockedAt = undefined
    visitors[index].blockedBy = undefined
    visitors[index].updatedAt = now

    db.setVisitors(visitors)

    await auditApi.logAction({
      action: 'VISITOR_UNBLOCKED',
      resourceType: 'Visitor',
      resourceId: id,
      details: `Unblocked visitor ${visitors[index].name} (${id}). Notes: ${reason} (by ${staffName})`,
      beforeState: before,
      afterState: visitors[index]
    })

    return visitors[index]
  }
}
