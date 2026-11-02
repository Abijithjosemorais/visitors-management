import { KioskSettings } from '../types'
import { db, delay } from './db'
import { auditApi } from './audit'

export const settingsApi = {
  async getSettings(): Promise<KioskSettings> {
    await delay(100)
    return db.getSettings()
  },

  async updateSettings(partial: Partial<KioskSettings>, updatedBy: string): Promise<KioskSettings> {
    await delay()
    const current = db.getSettings()
    const updated: KioskSettings = {
      ...current,
      ...partial
    }

    db.setSettings(updated)

    await auditApi.logAction({
      action: 'SETTINGS_UPDATE',
      resourceType: 'Settings',
      details: `Updated system settings by ${updatedBy}`,
      beforeState: current,
      afterState: updated
    })

    return updated
  },

  async setSimulatedOffset(days: number): Promise<KioskSettings> {
    const current = db.getSettings()
    current.simulatedDateOffsetDays = days
    db.setSettings(current)
    return current
  },

  async resetData(): Promise<void> {
    await delay(200)
    db.resetToInitial()
  }
}
