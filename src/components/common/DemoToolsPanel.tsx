import React, { useState } from 'react'
import { useDemoTools } from '../../context/DemoToolsContext'
import { useAuth } from '../../context/AuthContext'
import {
  Wrench,
  Calendar,
  FastForward,
  RotateCcw,
  Database,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'

export const DemoToolsPanel: React.FC = () => {
  const { user } = useAuth()
  const { offsetDays, simulatedDate, jumpDays, setOffset, resetDate, resetAllData } = useDemoTools()
  const [isOpen, setIsOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [customDays, setCustomDays] = useState('')

  // Show only if logged in as SuperAdmin or for demonstration purposes
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end no-print font-sans">
      {isOpen && (
        <div className="mb-2 w-80 md:w-96 rounded-3xl bg-slate-900/95 border border-cyan-500/40 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-white">Dev Demo Simulator</span>
            </div>
            <span className="rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 px-2.5 py-0.5">
              SuperAdmin Only
            </span>
          </div>

          {/* Current Date Display */}
          <div className="mt-4 rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                Active Simulated Date:
              </span>
              <strong className="text-cyan-300 font-mono text-sm">{simulatedDate}</strong>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Time offset:</span>
              <span className="font-semibold text-white">
                {offsetDays === 0 ? 'Current Real-Time (+0 days)' : `+${offsetDays} days simulated`}
              </span>
            </div>
          </div>

          {/* Time Jump Controls */}
          <div className="mt-4 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Fast Scenario Time-Jump
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setOffset(10)}
                id="demo-jump-10"
                className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-cyan-900/40 hover:border-cyan-500 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                title="Scenario 3: Return on day 10 (Valid)"
              >
                <FastForward className="h-3 w-3 text-cyan-400" />
                <span>+10 Days</span>
              </button>
              <button
                onClick={() => setOffset(31)}
                id="demo-jump-31"
                className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-amber-900/40 hover:border-amber-500 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                title="Scenario 4: Return on day 31 (Expired)"
              >
                <FastForward className="h-3 w-3 text-amber-400" />
                <span>+31 Days</span>
              </button>
              <button
                onClick={resetDate}
                id="demo-reset-date"
                className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Custom Days */}
            <div className="flex gap-2 pt-1">
              <input
                type="number"
                placeholder="Custom days..."
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  const num = parseInt(customDays, 10)
                  if (!isNaN(num)) {
                    setOffset(num)
                    setCustomDays('')
                  }
                }}
                className="rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition"
              >
                Set
              </button>
            </div>
          </div>

          {/* Quick Test Visitors */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Test QIDs (Click to Copy)
            </span>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => handleCopy('29063401234')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition"
              >
                <span>
                  <strong>Ahmed</strong> (Valid, Truck Driver)
                </span>
                <span className="font-mono text-cyan-400 flex items-center gap-1">
                  29063401234 {copiedId === '29063401234' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </span>
              </button>
              <button
                onClick={() => handleCopy('28563405678')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition"
              >
                <span>
                  <strong>Khalid</strong> (Expired Induction)
                </span>
                <span className="font-mono text-amber-400 flex items-center gap-1">
                  28563405678 {copiedId === '28563405678' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </span>
              </button>
              <button
                onClick={() => handleCopy('29263409988')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition"
              >
                <span>
                  <strong>Rashid</strong> (Blocked Visitor)
                </span>
                <span className="font-mono text-red-400 flex items-center gap-1">
                  29263409988 {copiedId === '29263409988' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </span>
              </button>
            </div>
          </div>

          {/* Reset All Database Seeds */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={async () => {
                if (confirm('Reset entire kiosk database back to initial seed data?')) {
                  await resetAllData()
                }
              }}
              id="demo-reset-db"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-semibold text-xs transition"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Reset All Mock Data to Default Seeds</span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="toggle-demo-tools-btn"
        className="flex items-center gap-2 rounded-2xl bg-cyan-600/90 hover:bg-cyan-500 text-white px-4 py-3 shadow-xl shadow-cyan-600/30 border border-cyan-400/40 font-semibold text-xs transition hover:scale-105 active:scale-95"
      >
        <Wrench className="h-4 w-4" />
        <span>Demo Tools</span>
        {offsetDays !== 0 && (
          <span className="rounded-full bg-slate-900 text-cyan-300 px-2 py-0.5 text-[10px] font-bold">
            +{offsetDays}d
          </span>
        )}
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  )
}
