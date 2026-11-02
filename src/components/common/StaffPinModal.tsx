import React, { useState } from 'react'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { KeyRound, AlertOctagon, X, Check } from 'lucide-react'

export const StaffPinModal: React.FC = () => {
  const { isStaffPinModalOpen, closeStaffPinModal, cancelVisitorSession } = useVisitorMode()
  const [pin, setPin] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isStaffPinModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const success = await cancelVisitorSession(pin, reason || 'Staff cancellation via PIN override')
      if (!success) {
        setError('Invalid staff PIN or password. Session was not cancelled.')
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickKey = (num: string) => {
    if (pin.length < 8) setPin(prev => prev + num)
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl space-y-6 text-left">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Staff Override</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter staff PIN or password to exit Visitor Mode
              </p>
            </div>
          </div>
          <button
            onClick={closeStaffPinModal}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 p-3 text-xs text-amber-200">
          <AlertOctagon className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            Exiting early will mark this safety induction as <strong>INCOMPLETE</strong>. The visitor cannot be admitted.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Staff PIN or Password
            </label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="e.g. 1111, 2222, 1234 or Staff@123"
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-center text-xl font-mono tracking-widest text-white placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              autoFocus
            />
          </div>

          {/* Quick Keypad for Tablet touch */}
          <div className="grid grid-cols-3 gap-2 py-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPin('')
                  else if (k === '⌫') handleBackspace()
                  else handleQuickKey(k)
                }}
                className="h-12 rounded-xl bg-slate-800 border border-slate-700/80 text-lg font-bold text-slate-200 hover:bg-slate-700 hover:text-white active:bg-cyan-600 transition"
              >
                {k}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Reason for Cancellation (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Visitor requested to reschedule, tablet issue"
              className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/50 border border-red-500/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeStaffPinModal}
              className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Resume Induction
            </button>
            <button
              type="submit"
              disabled={loading || pin.length === 0}
              id="confirm-override-btn"
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : 'Cancel Induction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
