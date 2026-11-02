import React, { useEffect } from 'react'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { formatQatarDate, formatQatarTime } from '../../api/db'
import confetti from 'canvas-confetti'
import { CheckCircle2, ShieldCheck, ArrowRight, User, Calendar, Clock, Building } from 'lucide-react'

export const S10ClearedConfirmed: React.FC = () => {
  const { activeVisitor, activeInduction, completeVisitorSession } = useVisitorMode()

  useEffect(() => {
    // Fire celebratory confetti on clearance
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch {
      // ignore
    }
  }, [])

  if (!activeVisitor) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-slate-400">No active visitor session found.</p>
      </div>
    )
  }

  const expiryDate = activeInduction?.expiresAt
    ? formatQatarDate(activeInduction.expiresAt)
    : '--/--/----'

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-3xl mx-auto space-y-8 animate-in zoom-in-95">
      <div className="w-full rounded-3xl bg-slate-900/90 border-2 border-emerald-500/50 p-8 md:p-12 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        {/* Big Check Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        {/* Clearance Announcement */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            Safety Induction Complete
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            You Are Cleared to Visit
          </h2>
          <p className="text-base font-semibold text-emerald-300">
            Clearance valid until <strong className="text-white font-mono">{expiryDate}</strong> (30 days)
          </p>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block">Visitor Name:</span>
              <strong className="text-white text-sm" dir="auto">{activeVisitor.name}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block">Pass ID:</span>
              <strong className="text-cyan-300 font-mono text-sm">{activeVisitor.id}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block">Company:</span>
              <span className="text-slate-200">{activeVisitor.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block">Induction Version:</span>
              <span className="text-slate-200 font-mono">{activeInduction?.videoVersion || 'v2.1'}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Return Device to Staff */}
        <div className="pt-2">
          <p className="text-xs text-slate-400 mb-4">
            Please hand the kiosk device back to the Kelvion reception staff.
          </p>
          <button
            type="button"
            id="visitor-done-return-staff-btn"
            onClick={completeVisitorSession}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 px-8 text-lg font-bold text-white shadow-xl shadow-cyan-600/30 transition transform active:scale-95 kiosk-touch-target"
          >
            <span>Done • Return Control to Staff</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
