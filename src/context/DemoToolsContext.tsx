import React, { createContext, useContext, useState, useEffect } from 'react'
import { settingsApi } from '../api/settings'
import { getSimulatedNow, formatQatarDate } from '../api/db'
import { useQueryClient } from '@tanstack/react-query'

interface DemoToolsContextType {
  offsetDays: number
  simulatedDate: string
  setOffset: (days: number) => Promise<void>
  jumpDays: (days: number) => Promise<void>
  resetDate: () => Promise<void>
  resetAllData: () => Promise<void>
}

const DemoToolsContext = createContext<DemoToolsContextType | undefined>(undefined)

export const DemoToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const [offsetDays, setOffsetDaysState] = useState<number>(0)
  const [simulatedDate, setSimulatedDate] = useState<string>('')

  const refreshDate = () => {
    const now = getSimulatedNow()
    setSimulatedDate(formatQatarDate(now))
  }

  useEffect(() => {
    settingsApi.getSettings().then(s => {
      setOffsetDaysState(s.simulatedDateOffsetDays || 0)
      refreshDate()
    })
  }, [])

  const setOffset = async (days: number) => {
    await settingsApi.setSimulatedOffset(days)
    setOffsetDaysState(days)
    refreshDate()
    queryClient.invalidateQueries()
  }

  const jumpDays = async (days: number) => {
    await setOffset(offsetDays + days)
  }

  const resetDate = async () => {
    await setOffset(0)
  }

  const resetAllData = async () => {
    await settingsApi.resetData()
    setOffsetDaysState(0)
    refreshDate()
    queryClient.invalidateQueries()
  }

  return (
    <DemoToolsContext.Provider
      value={{
        offsetDays,
        simulatedDate,
        setOffset,
        jumpDays,
        resetDate,
        resetAllData
      }}
    >
      {children}
    </DemoToolsContext.Provider>
  )
}

export const useDemoTools = () => {
  const ctx = useContext(DemoToolsContext)
  if (!ctx) throw new Error('useDemoTools must be used within a DemoToolsProvider')
  return ctx
}
