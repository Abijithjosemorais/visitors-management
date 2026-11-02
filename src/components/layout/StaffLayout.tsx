import React from 'react'
import { Outlet } from 'react-router-dom'
import { StaffHeader } from './StaffHeader'
import { DemoToolsPanel } from '../common/DemoToolsPanel'

export const StaffLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <StaffHeader />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <DemoToolsPanel />
    </div>
  )
}
