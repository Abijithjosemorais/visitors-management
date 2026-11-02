import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { visitorsApi } from '../../api/visitors'
import { inductionsApi } from '../../api/inductions'
import { useAuth } from '../../context/AuthContext'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { Visitor } from '../../types'
import { OnboardingDraft } from './S04_S05Onboarding'
import { PrintBadgeModal } from '../../components/common/PrintBadgeModal'
import { QRCodeSVG } from 'qrcode.react'
import {
  CheckCircle2,
  Edit,
  ArrowLeft,
  Printer,
  Play,
  Save,
  User,
  Building,
  CreditCard,
  Phone,
  HardHat,
  AlertCircle
} from 'lucide-react'

export const S06ReviewSave: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { startVisitorSession } = useVisitorMode()

  const draft: OnboardingDraft = (location.state as any)?.draft || (() => {
    try {
      const raw = sessionStorage.getItem('kelvion_onboarding_draft')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const [saving, setSaving] = useState(false)
  const [savedVisitor, setSavedVisitor] = useState<Visitor | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  if (!draft) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-slate-400">No onboarding draft found.</p>
        <button
          onClick={() => navigate('/staff/onboarding')}
          className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white"
        >
          Start Onboarding
        </button>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // Create new visitor
      const newVisitor = await visitorsApi.create({
        name: draft.name.trim(),
        company: draft.company.trim(),
        mobile: draft.mobile.trim(),
        idType: draft.idType,
        idNumber: draft.idNumber.trim(),
        idExpiry: draft.idExpiry,
        photo: draft.photo,
        idDocFront: draft.idDocFront,
        idDocBack: draft.idDocBack,
        visitorType: draft.visitorType
      })

      setSavedVisitor(newVisitor)
      // Clear draft
      sessionStorage.removeItem('kelvion_onboarding_draft')
    } catch (err: any) {
      setError(err.message || 'Failed to save visitor profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleStartInduction = async () => {
    if (!savedVisitor || !user) return
    try {
      const induction = await inductionsApi.startInduction({
        visitorId: savedVisitor.id,
        staffUserId: user.id,
        device: 'Kiosk-Reception-01'
      })
      startVisitorSession(savedVisitor, induction)
    } catch (err: any) {
      alert(`Error starting induction: ${err.message}`)
    }
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate('/staff/onboarding')}
            disabled={Boolean(savedVisitor)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-1 disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Edit Step 2</span>
          </button>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            {savedVisitor ? 'Registration Complete & Visitor ID Generated' : 'Step 3: Review & Finalize'}
          </h2>
        </div>

        {savedVisitor && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Profile Saved</span>
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-950/70 border border-red-500/60 p-4 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Visitor ID Card Banner (When Saved) */}
      {savedVisitor && (
        <div className="rounded-3xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/60 border-2 border-cyan-500/60 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95">
          <div className="flex items-center gap-5">
            <div className="h-24 w-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-cyan-500/50 shrink-0">
              {savedVisitor.photo ? (
                <img src={savedVisitor.photo} alt={savedVisitor.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-slate-500" />
              )}
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 block mb-1">
                Official Visitor ID Assigned
              </span>
              <h3 className="text-3xl font-black font-mono text-white tracking-wide">
                {savedVisitor.id}
              </h3>
              <p className="text-sm font-semibold text-slate-200 mt-1" dir="auto">
                {savedVisitor.name} • {savedVisitor.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live QR Code */}
            <div className="p-2.5 rounded-2xl bg-white shadow-lg flex flex-col items-center">
              <QRCodeSVG value={savedVisitor.id} size={70} level="M" />
              <span className="text-[8px] font-mono font-bold text-slate-900 mt-1">
                {savedVisitor.id}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                id="print-card-btn"
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-cyan-300 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Visitor Badge</span>
              </button>

              <button
                type="button"
                id="start-induction-after-save"
                onClick={handleStartInduction}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 transition transform active:scale-95 kiosk-touch-target"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Hand Kiosk to Visitor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 Summary */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <span>Visitor Identity</span>
            </h4>
            {!savedVisitor && (
              <button
                onClick={() => navigate('/staff/onboarding')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Full Name:</span>
              <strong className="text-white" dir="auto">{draft.name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Company:</span>
              <strong className="text-white">{draft.company}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Mobile Phone:</span>
              <span className="font-mono text-slate-200">{draft.mobile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">ID Document:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {draft.idType}: {draft.idNumber}
              </span>
            </div>
            {draft.idExpiry && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ID Expiry:</span>
                <span className="text-slate-300">{draft.idExpiry}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 Summary */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <HardHat className="h-4 w-4 text-cyan-400" />
              <span>Visit & PPE Requirements</span>
            </h4>
            {!savedVisitor && (
              <button
                onClick={() => navigate('/staff/onboarding')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Visitor Category:</span>
              <strong className="text-cyan-300">{draft.visitorType.replace('_', ' ')}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Visit Purpose:</span>
              <strong className="text-white">
                {draft.purpose === 'Other' ? draft.customPurpose : draft.purpose}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Person to Meet:</span>
              <span className="text-slate-200">{draft.hostName || 'Reception / General'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Department:</span>
              <span className="text-slate-200">{draft.department}</span>
            </div>
            <div className="py-1">
              <span className="text-slate-400 block mb-1">PPE Compliance:</span>
              {draft.visitorType === 'TRUCK_DRIVER' ? (
                <span className="text-emerald-400 font-semibold">
                  Driver's own PPE verified by staff
                </span>
              ) : (
                <span className="text-slate-200">
                  Lent items: {draft.lentPpeItems.join(', ') || 'None required'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {!savedVisitor && (
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/staff/onboarding')}
            className="flex items-center gap-2 rounded-2xl bg-slate-800 px-6 py-4 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Modify Details</span>
          </button>

          <button
            type="button"
            id="confirm-save-visitor-btn"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 disabled:opacity-50 transition transform active:scale-95 kiosk-touch-target"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Creating Profile...' : 'Save & Generate Visitor Pass'}</span>
          </button>
        </div>
      )}

      {/* Printable Badge Modal */}
      {savedVisitor && (
        <PrintBadgeModal
          visitor={savedVisitor}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  )
}
