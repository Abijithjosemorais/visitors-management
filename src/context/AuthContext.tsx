import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'
import { authApi } from '../api/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (u: string, p: string) => Promise<User>
  logout: () => Promise<void>
  isSuperAdmin: boolean
  isStaff: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const current = authApi.getCurrentUser()
    setUser(current)
    setIsLoading(false)
  }, [])

  const login = async (u: string, p: string) => {
    const loggedIn = await authApi.login(u, p)
    setUser(loggedIn)
    return loggedIn
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
        isStaff: user?.role === 'STAFF' || user?.role === 'SUPER_ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
