import React from 'react'
import { Outlet } from 'react-router-dom'
import { KelvionLogo } from '../common/KelvionLogo'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { StaffPinModal } from '../common/StaffPinModal'
import { Lock } from 'lucide-react'

export const VisitorLayout: React.FC = () => {
  const { openStaffPinModal, activeVisitor } = useVisitorMode()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Minimal Visitor Mode Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <KelvionLogo size="sm" showTagline={false} />

        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
              Visitor Induction Mode
            </span>
          </div>
          {activeVisitor && (
            <p className="text-xs text-slate-400 mt-0.5">
              Visitor: <strong className="text-white">{activeVisitor.name}</strong>
            </p>
          )}
        </div>

        {/* Discreet Staff Override button */}
        <button
          onClick={openStaffPinModal}
          id="staff-override-btn"
          className="flex items-center gap-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700/80 transition"
          title="Staff Override (PIN Required)"
        >
          <Lock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Staff Override</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Staff Override Modal */}
      <StaffPinModal />
    </div>
  )
}
