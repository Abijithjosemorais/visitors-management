import { User } from '../types'
import { db, delay } from './db'

const CURRENT_USER_KEY = 'kelvion_current_user'

export const authApi = {
  async login(username: string, password: string): Promise<User> {
    await delay()
    const users = db.getUsers()
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())

    if (!user) {
      throw new Error('Invalid username or password')
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('This account has been deactivated. Please contact an administrator.')
    }

    // Passwords check
    const valid =
      (user.username === 'admin' && password === 'Admin@123') ||
      (user.username === 'staff1' && password === 'Staff@123') ||
      (user.username === 'staff2' && password === 'Staff@123') ||
      password === 'Staff@123' || // Fallback for newly created staff users
      password === 'Admin@123'

    if (!valid) {
      throw new Error('Invalid username or password')
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    return user
  },

  async logout(): Promise<void> {
    await delay(100)
    localStorage.removeItem(CURRENT_USER_KEY)
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  async verifyStaffPin(userId: string, pinOrPass: string): Promise<boolean> {
    await delay(150)
    const users = db.getUsers()
    const user = users.find(u => u.id === userId)
    if (!user) return false

    // Accepts either their 4-digit PIN (1111, 2222, 1234) or their password
    const pinMatch = user.pin && user.pin === pinOrPass.trim()
    const passMatch =
      pinOrPass === 'Admin@123' ||
      pinOrPass === 'Staff@123' ||
      pinOrPass === '1234' ||
      pinOrPass === '1111' ||
      pinOrPass === '2222'

    return Boolean(pinMatch || passMatch)
  }
}
