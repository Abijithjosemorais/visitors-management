import { AppNotification } from '../types'
import { db, delay } from './db'

export const notificationsApi = {
  async getNotifications(): Promise<AppNotification[]> {
    await delay(100)
    return db.getNotifications()
  },

  async markAsRead(id: string): Promise<void> {
    const list = db.getNotifications()
    const item = list.find(n => n.id === id)
    if (item) {
      item.read = true
      db.setNotifications(list)
    }
  },

  async markAllAsRead(): Promise<void> {
    const list = db.getNotifications()
    list.forEach(n => (n.read = true))
    db.setNotifications(list)
  }
}
