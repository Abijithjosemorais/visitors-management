import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { visitorsApi, VisitorWithStatus } from '../../api/visitors'
import { inductionsApi } from '../../api/inductions'
import { visitsApi } from '../../api/visits'
import { useAuth } from '../../context/AuthContext'
import { Visitor, Induction, Visit } from '../../types'
import { formatQatarDate, formatQatarTime, formatQatarDateTime } from '../../api/db'
import { PrintBadgeModal } from '../../components/common/PrintBadgeModal'
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  User,
  Building,
  Phone,
  CreditCard,
  Ban,
  Unlock,
  Printer,
  History,
  Clock,
  X,
  AlertTriangle
} from 'lucide-react'

export const S13VisitorDirectory: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [visitors, setVisitors] = useState<VisitorWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL')

  // Selected visitor profile modal
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorWithStatus | null>(null)
  const [visitorInductions, setVisitorInductions] = useState<Induction[]>([])
  const [visitorVisits, setVisitorVisits] = useState<Visit[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Block/Unblock action modal
  const [blockModal, setBlockModal] = useState<{
    isOpen: boolean
    mode: 'BLOCK' | 'UNBLOCK'
    reason: string
    error: string | null
  }>({
    isOpen: false,
    mode: 'BLOCK',
    reason: '',
    error: null
  })

  // Print Badge
  const [printBadgeVisitor, setPrintBadgeVisitor] = useState<Visitor | null>(null)

  useEffect(() => {
    loadVisitors()
  }, [typeFilter, statusFilter])

  const loadVisitors = async () => {
    setLoading(true)
    try {
      const data = await visitorsApi.getAll({
        search,
        type: typeFilter,
        status: statusFilter
      })
      setVisitors(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadVisitors()
  }

  const openVisitorProfile = async (v: VisitorWithStatus) => {
    setSelectedVisitor(v)
    setLoadingDetails(true)
    try {
      const [inds, vsts] = await Promise.all([
        inductionsApi.getByVisitor(v.id),
        visitsApi.getAllVisits({ visitorId: v.id })
      ])
      setVisitorInductions(inds)
      setVisitorVisits(vsts)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleConfirmBlockToggle = async () => {
    if (!selectedVisitor || !user) return
    if (!blockModal.reason.trim() || blockModal.reason.trim().length < 5) {
      setBlockModal(prev => ({
        ...prev,
        error: 'A mandatory reason of at least 5 characters is required.'
      }))
      return
    }

    try {
      if (blockModal.mode === 'BLOCK') {
        const updated = await visitorsApi.block(selectedVisitor.id, blockModal.reason, user.name)
        setSelectedVisitor({ ...selectedVisitor, ...updated, isBlocked: true })
      } else {
        const updated = await visitorsApi.unblock(selectedVisitor.id, blockModal.reason, user.name)
        setSelectedVisitor({ ...selectedVisitor, ...updated, isBlocked: false })
      }

      setBlockModal({ isOpen: false, mode: 'BLOCK', reason: '', error: null })
      loadVisitors()
    } catch (err: any) {
      setBlockModal(prev => ({ ...prev, error: err.message || 'Operation failed' }))
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            Security & Identity Records
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Visitor Directory & Safety Dossiers
          </h2>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, company, QID, or Visitor ID..."
            className="w-full rounded-2xl bg-slate-800 border border-slate-700 pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="TRUCK_DRIVER">Truck Driver</option>
            <option value="PRODUCTION_VISITOR">Production Visitor</option>
            <option value="OFFICE_VISITOR">Office Visitor</option>
          </select>
        </div>

        {/* Induction Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Induction:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRED">Expired</option>
            <option value="NONE">No Induction</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading directory...</div>
        ) : visitors.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No matching visitor records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                  <th className="py-3.5 px-4">Visitor ID</th>
                  <th className="py-3.5 px-4">Visitor Name</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">ID Document</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Induction Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visitors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{v.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          {v.photo ? (
                            <img src={v.photo} alt={v.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 m-1.5 text-slate-500" />
                          )}
                        </div>
                        <span className="font-semibold text-white" dir="auto">{v.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{v.company}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {v.idType}: {v.idNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {v.visitorType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.isBlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40">
                          <Ban className="h-3 w-3" />
                          <span>BLOCKED</span>
                        </span>
                      ) : v.inductionStatus === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                          <ShieldCheck className="h-3 w-3" />
                          <span>VALID ({v.inductionDaysLeft}d)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40">
                          <ShieldAlert className="h-3 w-3" />
                          <span>{v.inductionStatus === 'EXPIRED' ? 'EXPIRED' : 'NONE'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openVisitorProfile(v)}
                        id={`view-profile-${v.id}`}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Detail Slide-over / Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl text-left space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                  {selectedVisitor.photo ? (
                    <img src={selectedVisitor.photo} alt={selectedVisitor.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 m-3 text-slate-500" />
                  )}
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {selectedVisitor.id}
                  </span>
                  <h3 className="text-xl font-bold text-white" dir="auto">
                    {selectedVisitor.name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedVisitor.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintBadgeVisitor(selectedVisitor)}
                  className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:text-white transition"
                  title="Print Badge"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Block / Unblock Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-xs">
                <span className="text-slate-400 block">Security Admission Status:</span>
                <strong className={selectedVisitor.isBlocked ? 'text-red-400 text-sm' : 'text-emerald-400 text-sm'}>
                  {selectedVisitor.isBlocked ? 'BLOCKED FROM PREMISES' : 'AUTHORIZED FOR ADMISSION'}
                </strong>
                {selectedVisitor.blockReason && (
                  <p className="text-red-200 mt-1 italic">"{selectedVisitor.blockReason}"</p>
                )}
              </div>

              {selectedVisitor.isBlocked ? (
                <button
                  type="button"
                  id="unblock-visitor-btn"
                  onClick={() =>
                    setBlockModal({
                      isOpen: true,
                      mode: 'UNBLOCK',
                      reason: '',
                      error: null
                    })
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unblock Visitor</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="block-visitor-btn"
                  onClick={() =>
                    setBlockModal({
                      isOpen: true,
                      mode: 'BLOCK',
                      reason: '',
                      error: null
                    })
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Block Visitor</span>
                </button>
              )}
            </div>

            {/* Tabs / Sub-tables: Inductions History and Visits History */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Safety Induction Records ({visitorInductions.length})
              </h4>
              <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Video Version</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {visitorInductions.map(ind => (
                      <tr key={ind.id}>
                        <td className="p-2.5">{formatQatarDateTime(ind.startedAt)}</td>
                        <td className="p-2.5 font-mono">{ind.videoVersion}</td>
                        <td className="p-2.5">{ind.watchedSeconds}s / {ind.totalSeconds}s</td>
                        <td className="p-2.5 font-bold">
                          <span className={ind.status === 'ACKNOWLEDGED' ? 'text-emerald-400' : 'text-amber-400'}>
                            {ind.status}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {ind.signature ? (
                            <span className="text-emerald-400 font-semibold">Captured</span>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Facility Visit History ({visitorVisits.length})
              </h4>
              <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2.5">Time In</th>
                      <th className="p-2.5">Time Out</th>
                      <th className="p-2.5">Purpose</th>
                      <th className="p-2.5">Host</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {visitorVisits.map(v => (
                      <tr key={v.id}>
                        <td className="p-2.5 font-mono">{formatQatarDateTime(v.checkInTime)}</td>
                        <td className="p-2.5 font-mono">
                          {v.checkOutTime ? formatQatarTime(v.checkOutTime) : '--:--'}
                        </td>
                        <td className="p-2.5">{v.purpose}</td>
                        <td className="p-2.5">{v.hostName}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.status === 'ON_SITE' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {v.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block / Unblock Modal */}
      {blockModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-left space-y-5">
            <h3 className="text-lg font-bold text-white">
              {blockModal.mode === 'BLOCK' ? 'Block Visitor from Entry' : 'Unblock Visitor Admission'}
            </h3>

            {blockModal.error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                {blockModal.error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Mandatory Security Reason *
              </label>
              <textarea
                rows={3}
                value={blockModal.reason}
                onChange={e => setBlockModal({ ...blockModal, reason: e.target.value })}
                placeholder="Specify regulatory or safety rationale..."
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBlockModal({ ...blockModal, isOpen: false })}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlockToggle}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg transition ${
                  blockModal.mode === 'BLOCK'
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {blockModal.mode === 'BLOCK' ? 'Confirm Block' : 'Confirm Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Badge Modal */}
      {printBadgeVisitor && (
        <PrintBadgeModal
          visitor={printBadgeVisitor}
          isOpen={Boolean(printBadgeVisitor)}
          onClose={() => setPrintBadgeVisitor(null)}
        />
      )}
    </div>
  )
}
