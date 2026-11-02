import React from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { DemoToolsPanel } from '../common/DemoToolsPanel'

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-cyan-500 selection:text-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
      <DemoToolsPanel />
    </div>
  )
}
