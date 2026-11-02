import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Visitor, Induction } from '../types'
import { inductionsApi } from '../api/inductions'
import { authApi } from '../api/auth'
import { useAuth } from './AuthContext'

interface VisitorModeContextType {
  isVisitorMode: boolean
  activeVisitor: Visitor | null
  activeInduction: Induction | null
  startVisitorSession: (visitor: Visitor, induction: Induction) => void
  completeVisitorSession: () => void
  cancelVisitorSession: (staffPin: string, reason?: string) => Promise<boolean>
  isStaffPinModalOpen: boolean
  openStaffPinModal: () => void
  closeStaffPinModal: () => void
  setActiveInduction: React.Dispatch<React.SetStateAction<Induction | null>>
}

const VisitorModeContext = createContext<VisitorModeContextType | undefined>(undefined)

const STORAGE_SESSION_KEY = 'kelvion_active_visitor_session'

export const VisitorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [isVisitorMode, setIsVisitorMode] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(STORAGE_SESSION_KEY))
  })
  const [activeVisitor, setActiveVisitor] = useState<Visitor | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_SESSION_KEY)
      return raw ? JSON.parse(raw).visitor : null
    } catch {
      return null
    }
  })
  const [activeInduction, setActiveInduction] = useState<Induction | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_SESSION_KEY)
      return raw ? JSON.parse(raw).induction : null
    } catch {
      return null
    }
  })
  const [isStaffPinModalOpen, setIsStaffPinModalOpen] = useState(false)

  // Sync to sessionStorage so tablet page reload doesn't kick them out of visitor mode
  useEffect(() => {
    if (isVisitorMode && activeVisitor && activeInduction) {
      sessionStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({ visitor: activeVisitor, induction: activeInduction })
      )
    } else {
      sessionStorage.removeItem(STORAGE_SESSION_KEY)
    }
  }, [isVisitorMode, activeVisitor, activeInduction])

  // Guard: if in visitor mode, disallow navigating outside /visitor/*
  useEffect(() => {
    if (isVisitorMode && !location.pathname.startsWith('/visitor/')) {
      navigate('/visitor/welcome', { replace: true })
    }
  }, [isVisitorMode, location.pathname, navigate])

  // Guard against back-button: push state
  useEffect(() => {
    if (!isVisitorMode) return

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isVisitorMode])

  const startVisitorSession = (visitor: Visitor, induction: Induction) => {
    setActiveVisitor(visitor)
    setActiveInduction(induction)
    setIsVisitorMode(true)
    navigate('/visitor/welcome')
  }

  const completeVisitorSession = () => {
    // When finished acknowledgement
    const visitorId = activeVisitor?.id
    setIsVisitorMode(false)
    setActiveVisitor(null)
    setActiveInduction(null)
    sessionStorage.removeItem(STORAGE_SESSION_KEY)
    if (visitorId) {
      navigate(`/staff/visitor/${visitorId}?cleared=true`)
    } else {
      navigate('/staff')
    }
  }

  const cancelVisitorSession = async (staffPin: string, reason?: string): Promise<boolean> => {
    if (!user) return false
    const verified = await authApi.verifyStaffPin(user.id, staffPin)
    if (!verified) {
      return false
    }

    if (activeInduction) {
      await inductionsApi.recordIncomplete(
        activeInduction.id,
        reason || 'Staff terminated session via kiosk override PIN'
      )
    }

    const visitorId = activeVisitor?.id
    setIsVisitorMode(false)
    setActiveVisitor(null)
    setActiveInduction(null)
    setIsStaffPinModalOpen(false)
    sessionStorage.removeItem(STORAGE_SESSION_KEY)

    if (visitorId) {
      navigate(`/staff/visitor/${visitorId}?cancelled=true`)
    } else {
      navigate('/staff')
    }

    return true
  }

  return (
    <VisitorModeContext.Provider
      value={{
        isVisitorMode,
        activeVisitor,
        activeInduction,
        startVisitorSession,
        completeVisitorSession,
        cancelVisitorSession,
        isStaffPinModalOpen,
        openStaffPinModal: () => setIsStaffPinModalOpen(true),
        closeStaffPinModal: () => setIsStaffPinModalOpen(false),
        setActiveInduction
      }}
    >
      {children}
    </VisitorModeContext.Provider>
  )
}

export const useVisitorMode = () => {
  const ctx = useContext(VisitorModeContext)
  if (!ctx) throw new Error('useVisitorMode must be used within a VisitorModeProvider')
  return ctx
}
