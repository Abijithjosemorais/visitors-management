import { Induction } from '../types'
import { db, delay, getSimulatedNow } from './db'
import { videosApi } from './videos'
import { auditApi } from './audit'

export const inductionsApi = {
  async getByVisitor(visitorId: string): Promise<Induction[]> {
    await delay()
    const inductions = db.getInductions()
    return inductions
      .filter(i => i.visitorId === visitorId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  },

  async getAll(): Promise<Induction[]> {
    await delay()
    const inductions = db.getInductions()
    return inductions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  },

  async startInduction(params: {
    visitorId: string
    staffUserId: string
    device?: string
  }): Promise<Induction> {
    await delay()
    const activeVideo = await videosApi.getActiveVideo()
    const inductions = db.getInductions()
    const now = getSimulatedNow().toISOString()

    const newInduction: Induction = {
      id: `IND-${String(Date.now()).slice(-6)}`,
      visitorId: params.visitorId,
      videoId: activeVideo.id,
      videoVersion: activeVideo.versionLabel,
      startedAt: now,
      watchedSeconds: 0,
      totalSeconds: activeVideo.durationSeconds || 15,
      status: 'IN_PROGRESS',
      staffUserId: params.staffUserId,
      device: params.device || 'Kiosk-Reception-01'
    }

    inductions.unshift(newInduction)
    db.setInductions(inductions)

    return newInduction
  },

  async updateProgress(id: string, watchedSec: number): Promise<void> {
    const inductions = db.getInductions()
    const ind = inductions.find(i => i.id === id)
    if (ind && ind.status === 'IN_PROGRESS') {
      ind.watchedSeconds = Math.max(ind.watchedSeconds, watchedSec)
      if (ind.watchedSeconds >= ind.totalSeconds) {
        ind.status = 'COMPLETED'
        ind.completedAt = getSimulatedNow().toISOString()
      }
      db.setInductions(inductions)
    }
  },

  async recordIncomplete(id: string, reason?: string): Promise<Induction> {
    await delay()
    const inductions = db.getInductions()
    const ind = inductions.find(i => i.id === id)
    if (!ind) throw new Error('Induction record not found')

    ind.status = 'INCOMPLETE'
    db.setInductions(inductions)

    await auditApi.logAction({
      action: 'INDUCTION_CANCELLED',
      resourceType: 'Induction',
      resourceId: id,
      details: `Induction for visitor ${ind.visitorId} cancelled/abandoned by staff. Status set to INCOMPLETE. Reason: ${reason || 'Staff override'}`
    })

    return ind
  },

  async acknowledge(id: string, signature: string): Promise<Induction> {
    await delay()
    const inductions = db.getInductions()
    const ind = inductions.find(i => i.id === id)
    if (!ind) throw new Error('Induction record not found')

    if (ind.watchedSeconds < ind.totalSeconds && ind.status !== 'COMPLETED') {
      throw new Error('Safety video must be watched in full (100%) before acknowledging.')
    }

    if (!signature || signature.trim().length === 0) {
      throw new Error('Signature is required to complete acknowledgement.')
    }

    const settings = db.getSettings()
    const now = getSimulatedNow()
    const validityMs = (settings.validityDays || 30) * 24 * 60 * 60 * 1000
    const expiresAt = new Date(now.getTime() + validityMs)

    ind.status = 'ACKNOWLEDGED'
    ind.completedAt = ind.completedAt || now.toISOString()
    ind.acknowledgedAt = now.toISOString()
    ind.expiresAt = expiresAt.toISOString()
    ind.signature = signature

    db.setInductions(inductions)
    await videosApi.incrementInductionCount(ind.videoId)

    await auditApi.logAction({
      action: 'INDUCTION_ACKNOWLEDGED',
      resourceType: 'Induction',
      resourceId: id,
      details: `Visitor ${ind.visitorId} completed safety induction (${ind.videoVersion}). Validity set until ${expiresAt.toLocaleDateString('en-GB')}`
    })

    return ind
  }
}
