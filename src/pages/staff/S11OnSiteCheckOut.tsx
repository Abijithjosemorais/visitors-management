import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { visitsApi } from '../../api/visits'
import { settingsApi } from '../../api/settings'
import { useAuth } from '../../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Visit } from '../../types'
import { formatQatarTime, formatQatarDate, formatQatarDateTime } from '../../api/db'
import {
  Users,
  LogOut,
  Clock,
  HardHat,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building,
  User,
  Sparkles,
  Calendar
} from 'lucide-react'

export const S11OnSiteCheckOut: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [checkoutModalVisit, setCheckoutModalVisit] = useState<Visit | null>(null)
  const [returnedPpeNotes, setReturnedPpeNotes] = useState('')
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Fetch open visits
  const { data: openVisits = [], isLoading } = useQuery({
    queryKey: ['openVisits'],
    queryFn: () => visitsApi.getOpenVisits(),
    refetchInterval: 5000
  })

  // Fetch settings for auto check out time
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings()
  })

  // Checkout mutation
  const checkOutMutation = useMutation({
    mutationFn: async ({ visitId, notes }: { visitId: string; notes?: string }) => {
      return visitsApi.checkOut(visitId, user?.id || 'USR-002', notes)
    },
    onSuccess: checkedVisit => {
      setActionSuccess(
        `Checked out ${checkedVisit.visitorName}. Check-in: ${formatQatarTime(checkedVisit.checkInTime)}, Check-out: ${formatQatarTime(checkedVisit.checkOutTime || new Date())}.`
      )
      setCheckoutModalVisit(null)
      setReturnedPpeNotes('')
      queryClient.invalidateQueries({ queryKey: ['openVisits'] })
      queryClient.invalidateQueries({ queryKey: ['visits'] })
    }
  })

  // Auto check-out demo trigger
  const autoCheckoutMutation = useMutation({
    mutationFn: async () => {
      return visitsApi.autoCheckOutOpen()
    },
    onSuccess: count => {
      setActionSuccess(`System auto-closed ${count} open visit(s).`)
      queryClient.invalidateQueries({ queryKey: ['openVisits'] })
      queryClient.invalidateQueries({ queryKey: ['visits'] })
    }
  })

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Staff Home</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              On Site Now & Visitor Check-Out
            </h2>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-sm border border-emerald-500/30">
              {openVisits.length}
            </span>
          </div>
        </div>

        {/* Auto checkout note & simulator action */}
        <div className="flex items-center gap-3 text-xs">
          <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 text-slate-300 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>
              Auto Check-Out scheduled daily at{' '}
              <strong className="text-white">{settings?.autoCheckoutTime || '23:59'}</strong>
            </span>
          </div>

          <button
            type="button"
            id="test-auto-checkout-btn"
            onClick={() => autoCheckoutMutation.mutate()}
            disabled={autoCheckoutMutation.isPending || openVisits.length === 0}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-slate-300 font-semibold disabled:opacity-40 transition"
            title="Simulate end-of-day auto checkout"
          >
            Run Auto Check-Out
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/40 p-4 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs text-emerald-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Roster of Open Visits */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">Loading open visits roster...</div>
      ) : openVisits.length === 0 ? (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Visitors Currently On Site</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All registered guests have been checked out. Log a new visitor entry from Staff Home.
          </p>
          <button
            onClick={() => navigate('/staff')}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-500 transition"
          >
            Go to Staff Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {openVisits.map(visit => {
            const hasLentPpe = visit.ppeItemsLent && visit.ppeItemsLent.length > 0

            return (
              <div
                key={visit.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      {visit.visitorId}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>On Site</span>
                    </span>
                  </div>

                  {/* Name & Company */}
                  <div>
                    <h3 className="text-lg font-bold text-white" dir="auto">
                      {visit.visitorName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building className="h-3.5 w-3.5" />
                      <span>{visit.visitorCompany}</span>
                    </p>
                  </div>

                  {/* Purpose & Host */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purpose:</span>
                      <strong className="text-slate-200">{visit.purpose}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Host / Person:</span>
                      <span className="text-slate-300">{visit.hostName || 'Reception'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="text-slate-300">{visit.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Checked In:</span>
                      <span className="font-mono text-cyan-300">
                        {formatQatarTime(visit.checkInTime)}
                      </span>
                    </div>
                  </div>

                  {/* Lent PPE Notice */}
                  {hasLentPpe ? (
                    <div className="rounded-xl bg-amber-950/40 border border-amber-500/30 p-2.5 text-xs text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <HardHat className="h-3.5 w-3.5" />
                        <span>PPE Lent by Reception:</span>
                      </div>
                      <p className="text-[11px]">{visit.ppeItemsLent.join(', ')}</p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">No PPE lent</div>
                  )}
                </div>

                {/* Check out button */}
                <button
                  type="button"
                  id={`checkout-btn-${visit.id}`}
                  onClick={() => setCheckoutModalVisit(visit)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 hover:border-red-500/40 border border-slate-700 py-3.5 text-sm font-bold text-slate-200 transition active:scale-95 kiosk-touch-target"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Check-Out</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Check-Out Confirmation Modal */}
      {checkoutModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl text-left space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                  <LogOut className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirm Visitor Exit</h3>
                  <p className="text-xs text-slate-400" dir="auto">
                    {checkoutModalVisit.visitorName} ({checkoutModalVisit.visitorId})
                  </p>
                </div>
              </div>
            </div>

            {/* Check-in time & Lent PPE Checklist */}
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Entry Time:</span>
                <span className="font-mono text-white">
                  {formatQatarDateTime(checkoutModalVisit.checkInTime)}
                </span>
              </div>

              {checkoutModalVisit.ppeItemsLent && checkoutModalVisit.ppeItemsLent.length > 0 && (
                <div className="pt-2 border-t border-slate-700/80">
                  <span className="font-bold text-amber-400 block mb-1">
                    Verify Return of Lent PPE:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {checkoutModalVisit.ppeItemsLent.map((ppe, i) => (
                      <li key={i}>{ppe}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Staff Return Notes (Optional)
              </label>
              <input
                type="text"
                value={returnedPpeNotes}
                onChange={e => setReturnedPpeNotes(e.target.value)}
                placeholder="e.g. All lent PPE returned in good condition"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModalVisit(null)}
                className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-checkout-action-btn"
                disabled={checkOutMutation.isPending}
                onClick={() =>
                  checkOutMutation.mutate({
                    visitId: checkoutModalVisit.id,
                    notes: returnedPpeNotes
                  })
                }
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 disabled:opacity-50 transition"
              >
                {checkOutMutation.isPending ? 'Recording Exit...' : 'Confirm Check-Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
