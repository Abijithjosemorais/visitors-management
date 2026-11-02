import { AuditLog } from '../types'
import { db, delay } from './db'

export const auditApi = {
  async getAuditLogs(filters?: {
    action?: string
    search?: string
  }): Promise<AuditLog[]> {
    await delay()
    let logs = db.getAuditLogs()

    if (filters?.action && filters.action !== 'ALL') {
      logs = logs.filter(l => l.action === filters.action)
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      logs = logs.filter(
        l =>
          l.userName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.resourceId && l.resourceId.toLowerCase().includes(q))
      )
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  async logAction(params: {
    action: string
    resourceType: string
    resourceId?: string
    details: string
    beforeState?: any
    afterState?: any
  }): Promise<AuditLog> {
    const rawUser = localStorage.getItem('kelvion_current_user')
    const user = rawUser ? JSON.parse(rawUser) : null

    const logs = db.getAuditLogs()
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'USR-SYSTEM',
      userName: user?.name || 'System / Kiosk',
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details,
      beforeState: params.beforeState,
      afterState: params.afterState
    }

    logs.unshift(newLog)
    db.setAuditLogs(logs)
    return newLog
  }
}
