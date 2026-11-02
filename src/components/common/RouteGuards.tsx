import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useVisitorMode } from '../../context/VisitorModeContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const { isVisitorMode } = useVisitorMode()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    )
  }

  if (isVisitorMode && !location.pathname.startsWith('/visitor/')) {
    return <Navigate to="/visitor/welcome" replace />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSuperAdmin, isLoading } = useAuth()
  const { isVisitorMode } = useVisitorMode()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    )
  }

  if (isVisitorMode) {
    return <Navigate to="/visitor/welcome" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Acceptance Scenario 10: Staff user cannot open video library, settings, user management or reports (route-guarded)
  if (!isSuperAdmin) {
    return <Navigate to="/staff" replace />
  }

  return <>{children}</>
}
