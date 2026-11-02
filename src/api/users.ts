import { User } from '../types'
import { db, delay } from './db'
import { auditApi } from './audit'

export const usersApi = {
  async getUsers(): Promise<User[]> {
    await delay()
    return db.getUsers()
  },

  async createUser(data: Omit<User, 'id' | 'createdAt'>, createdByName: string): Promise<User> {
    await delay()
    const users = db.getUsers()
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      throw new Error(`Username "${data.username}" is already in use.`)
    }

    const newUser: User = {
      ...data,
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    db.setUsers(users)

    await auditApi.logAction({
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: newUser.id,
      details: `Created new ${newUser.role} user: ${newUser.name} (${newUser.username}) by ${createdByName}`
    })

    return newUser
  },

  async updateUser(id: string, data: Partial<User>, updatedByName: string): Promise<User> {
    await delay()
    const users = db.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')

    const before = { ...users[index] }
    users[index] = { ...users[index], ...data }
    db.setUsers(users)

    await auditApi.logAction({
      action: 'USER_UPDATED',
      resourceType: 'User',
      resourceId: id,
      details: `Updated user profile for ${users[index].name} (${users[index].username}) by ${updatedByName}`,
      beforeState: before,
      afterState: users[index]
    })

    return users[index]
  },

  async toggleStatus(id: string, updatedByName: string): Promise<User> {
    await delay()
    const users = db.getUsers()
    const user = users.find(u => u.id === id)
    if (!user) throw new Error('User not found')

    if (user.username === 'admin') {
      throw new Error('The primary SuperAdmin account cannot be deactivated.')
    }

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    db.setUsers(users)

    await auditApi.logAction({
      action: 'USER_STATUS_CHANGE',
      resourceType: 'User',
      resourceId: id,
      details: `Changed status for user ${user.username} to ${user.status} by ${updatedByName}`
    })

    return user
  },

  async resetPassword(id: string, _newPass: string, updatedByName: string): Promise<void> {
    await delay()
    const users = db.getUsers()
    const user = users.find(u => u.id === id)
    if (!user) throw new Error('User not found')

    await auditApi.logAction({
      action: 'USER_PASSWORD_RESET',
      resourceType: 'User',
      resourceId: id,
      details: `Reset password for user ${user.username} by ${updatedByName}`
    })
  }
}
