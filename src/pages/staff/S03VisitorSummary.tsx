import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { visitorsApi, VisitorWithStatus } from '../../api/visitors'
import { visitsApi } from '../../api/visits'
import { inductionsApi } from '../../api/inductions'
import { settingsApi } from '../../api/settings'
import { useAuth } from '../../context/AuthContext'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { formatQatarDate, formatQatarTime } from '../../api/db'
import { PrintBadgeModal } from '../../components/common/PrintBadgeModal'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Play,
  LogIn,
  Printer,
  Edit,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Building,
  CreditCard,
  Phone,
  HardHat,
  ChevronRight
} from 'lucide-react'

export const S03VisitorSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { startVisitorSession } = useVisitorMode()

  const [visitor, setVisitor] = useState<VisitorWithStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Visit details to review/update before logging entry
  const [purpose, setPurpose] = useState('Raw Material Delivery')
  const [customPurpose, setCustomPurpose] = useState('')
  const [visitorType, setVisitorType] = useState('TRUCK_DRIVER')
  const [hostName, setHostName] = useState('Ibrahim Al-Mohannadi')
  const [department, setDepartment] = useState('Logistics & Warehouse')
  const [selectedPpeLent, setSelectedPpeLent] = useState<string[]>([])
  const [purposesList, setPurposesList] = useState<string[]>([])
  const [departmentsList, setDepartmentsList] = useState<string[]>([])
  const [visitorTypesConfig, setVisitorTypesConfig] = useState<any[]>([])

  // State for actions
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false)
  const [entrySuccess, setEntrySuccess] = useState<string | null>(null)
  const [isStartingInduction, setIsStartingInduction] = useState(false)

  // Check query params if returning from cancelled or cleared induction
  const wasCancelled = searchParams.get('cancelled') === 'true'
  const wasCleared = searchParams.get('cleared') === 'true'

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [v, settings] = await Promise.all([
        visitorsApi.getById(id),
        settingsApi.getSettings()
      ])

      if (!v) {
        setError(`Visitor profile ${id} was not found.`)
        return
      }

      setVisitor(v)
      setVisitorType(v.visitorType || 'TRUCK_DRIVER')
      setPurposesList(settings.purposes)
      setDepartmentsList(settings.departments)
      setVisitorTypesConfig(settings.visitorTypes)

      if (settings.purposes.length > 0) {
        setPurpose(settings.purposes[0])
      }
      if (settings.departments.length > 0) {
        setDepartment(settings.departments[0])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load visitor profile.')
    } finally {
      setLoading(false)
    }
  }

  // Check if ID document is expired
  const isIdDocExpired = Boolean(
    visitor?.idExpiry && new Date(visitor.idExpiry).getTime() < new Date().getTime()
  )

  const handleStartInduction = async () => {
    if (!visitor || !user) return
    setIsStartingInduction(true)
    try {
      const induction = await inductionsApi.startInduction({
        visitorId: visitor.id,
        staffUserId: user.id,
        device: 'Kiosk-Reception-01'
      })
      startVisitorSession(visitor, induction)
    } catch (err: any) {
      alert(`Error starting induction: ${err.message}`)
    } finally {
      setIsStartingInduction(false)
    }
  }

  const handleLogEntry = async () => {
    if (!visitor || !user) return
    setIsSubmittingEntry(true)
    setError(null)
    try {
      const finalPurpose = purpose === 'Other' ? customPurpose || 'General Site Visit' : purpose
      const newVisit = await visitsApi.logEntry({
        visitorId: visitor.id,
        purpose: finalPurpose,
        hostName,
        department,
        visitorType,
        ppeItemsLent: selectedPpeLent,
        staffUserId: user.id
      })

      setEntrySuccess(`Entry logged successfully at ${formatQatarTime(newVisit.checkInTime)}.`)
      // Refresh visitor status
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to log entry.')
    } finally {
      setIsSubmittingEntry(false)
    }
  }

  const handlePpeToggle = (item: string) => {
    setSelectedPpeLent(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading visitor profile...</p>
        </div>
      </div>
    )
  }

  if (error && !visitor) {
    return (
      <div className="flex-1 max-w-2xl mx-auto p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-red-950/60 text-red-400 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold text-white">Visitor Record Error</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={() => navigate('/staff')}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Staff Home</span>
        </button>
      </div>
    )
  }

  if (!visitor) return null

  // Available PPE checklist for the selected visitor type
  const activeTypeConfig = visitorTypesConfig.find(vt => vt.id === visitorType)
  const ppeOptions = activeTypeConfig ? activeTypeConfig.defaultPpe : ['Safety shoes', 'Hi-vis vest']

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Top Navigation & Fast Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <button
          onClick={() => navigate('/staff')}
          className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lookup</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            id="print-badge-btn"
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-cyan-400 hover:text-white transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Badge</span>
          </button>

          <button
            onClick={() => navigate(`/admin/visitors?search=${visitor.id}`)}
            className="flex items-center gap-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Full Profile</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {wasCancelled && (
        <div className="rounded-2xl bg-amber-950/60 border border-amber-500/40 p-4 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>
            Induction was cancelled by staff override and recorded as <strong>INCOMPLETE</strong>. Entry cannot be logged.
          </span>
        </div>
      )}

      {entrySuccess && (
        <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/40 p-4 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{entrySuccess}</span>
        </div>
      )}

      {/* Main Grid: Left Column Visitor ID Card, Right Column Status & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visitor Dossier (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="h-28 w-24 shrink-0 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-md flex items-center justify-center">
              {visitor.photo ? (
                <img src={visitor.photo} alt={visitor.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-slate-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md inline-block mb-1">
                {visitor.id}
              </span>
              <h3 className="text-xl font-bold text-white leading-tight" dir="auto">
                {visitor.name}
              </h3>
              <p className="text-sm font-semibold text-slate-300 mt-1 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{visitor.company}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>{visitor.mobile}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">ID Document Type:</span>
              <span className="font-semibold text-white">{visitor.idType}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">ID Number:</span>
              <span className="font-mono font-semibold text-white">{visitor.idNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">ID Expiry:</span>
              <span className={`font-semibold ${isIdDocExpired ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                {visitor.idExpiry ? formatQatarDate(visitor.idExpiry) : 'Not specified'}
                {isIdDocExpired && ' (EXPIRED)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Visitor Category:</span>
              <span className="font-semibold text-cyan-300">
                {visitor.visitorType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Registered Since:</span>
              <span className="text-slate-300">{formatQatarDate(visitor.createdAt)}</span>
            </div>
          </div>

          {/* Expired ID Document Warning */}
          {isIdDocExpired && (
            <div className="rounded-2xl bg-amber-950/40 border border-amber-500/40 p-4 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>ID Document Has Expired</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Staff must verify and update the visitor's new identification document before granting admission.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Status & Entry Management (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Banner */}
          {visitor.isBlocked ? (
            <div className="rounded-3xl bg-red-950/70 border-2 border-red-500/60 p-6 shadow-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldX className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-red-200">
                    ENTRY NOT PERMITTED – CONTACT ADMIN
                  </h4>
                  <p className="text-xs text-red-300 mt-0.5">
                    This visitor has been placed on the Kelvion Doha site restriction blacklist.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/40 border border-red-500/30 p-3.5 text-xs text-red-100">
                <strong>Mandatory Reason:</strong> {visitor.blockReason}
                {visitor.blockedBy && (
                  <span className="block mt-1 text-[10px] text-red-300">
                    Logged by: {visitor.blockedBy} on {formatQatarDate(visitor.blockedAt || '')}
                  </span>
                )}
              </div>
            </div>
          ) : visitor.inductionStatus === 'VALID' ? (
            <div className="rounded-3xl bg-emerald-950/60 border-2 border-emerald-500/50 p-6 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Induction Clearance Status
                  </span>
                  <h4 className="text-xl md:text-2xl font-black text-white">
                    Induction Valid Until {formatQatarDate(visitor.inductionExpiryDate || '')}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-300 mt-0.5">
                    {visitor.inductionDaysLeft} day{visitor.inductionDaysLeft === 1 ? '' : 's'} remaining on current safety induction.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-red-950/50 border-2 border-red-500/50 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">
                    Induction Clearance Status
                  </span>
                  <h4 className="text-xl md:text-2xl font-black text-white">
                    {visitor.inductionStatus === 'EXPIRED'
                      ? `Induction Expired on ${formatQatarDate(visitor.inductionExpiryDate || '')}`
                      : 'No Safety Induction on Record'}
                  </h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    Mandatory safety induction must be completed before entry can be logged.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartInduction}
                id="start-induction-btn"
                disabled={isStartingInduction}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-cyan-600/30 transition transform active:scale-95 kiosk-touch-target"
              >
                <Play className="h-5 w-5 fill-white" />
                <span>{isStartingInduction ? 'Launching...' : 'Start Induction'}</span>
              </button>
            </div>
          )}

          {/* Prompt if visitor already has an open visit */}
          {visitor.hasOpenVisit && (
            <div className="rounded-2xl bg-amber-950/50 border border-amber-500/40 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-amber-400 shrink-0" />
                <div>
                  <h5 className="font-bold text-white text-sm">Visitor is Currently On Site</h5>
                  <p className="text-xs text-amber-200 mt-0.5">
                    An open visit is already recorded. Please close the active visit before logging another entry.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/staff/on-site')}
                id="resolve-open-visit-btn"
                className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold transition"
              >
                Go to Check-Out
              </button>
            </div>
          )}

          {/* Visit Purpose, Host, and PPE Selection Form */}
          {!visitor.isBlocked && (
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-xl">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>Visit Details & Entry Preparation</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Purpose of Visit
                  </label>
                  <select
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {purposesList.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Other">Other (Specify)</option>
                  </select>

                  {purpose === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify custom purpose..."
                      value={customPurpose}
                      onChange={e => setCustomPurpose(e.target.value)}
                      className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Visitor Category
                  </label>
                  <select
                    value={visitorType}
                    onChange={e => setVisitorType(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {visitorTypesConfig.map(vt => (
                      <option key={vt.id} value={vt.id}>
                        {vt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Person to Meet (Host)
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={e => setHostName(e.target.value)}
                    placeholder="e.g. Ibrahim Al-Mohannadi"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PPE Items Lent by Kelvion */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  PPE Lent by Kelvion Reception (Tick all items provided to visitor):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ppeOptions.map((item: string) => {
                    const isLent = selectedPpeLent.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePpeToggle(item)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                          isLent
                            ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <HardHat className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Button: Log Entry */}
              <div className="pt-2">
                <button
                  type="button"
                  id="log-entry-btn"
                  onClick={handleLogEntry}
                  disabled={
                    isSubmittingEntry ||
                    visitor.inductionStatus !== 'VALID' ||
                    visitor.hasOpenVisit ||
                    visitor.isBlocked
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-4 px-6 text-base font-bold text-white shadow-xl shadow-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-[0.99] kiosk-touch-target"
                >
                  <LogIn className="h-5 w-5" />
                  <span>
                    {isSubmittingEntry
                      ? 'Logging Entry...'
                      : visitor.hasOpenVisit
                      ? 'Visitor Already On Site'
                      : visitor.inductionStatus !== 'VALID'
                      ? 'Log Entry (Induction Required)'
                      : 'Log Visitor Entry'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Badge Modal */}
      <PrintBadgeModal
        visitor={visitor}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  )
}
