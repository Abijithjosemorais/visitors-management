import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { visitorsApi } from '../../api/visitors'
import { settingsApi } from '../../api/settings'
import { VisitorIdType } from '../../types'
import { CameraCaptureModal } from '../../components/common/CameraCaptureModal'
import { generateInitialsAvatar } from '../../lib/utils'
import {
  User,
  Building,
  Phone,
  CreditCard,
  Camera,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  HardHat,
  Lock
} from 'lucide-react'

export interface OnboardingDraft {
  // Step 1
  name: string
  company: string
  mobile: string
  idType: VisitorIdType
  idNumber: string
  idExpiry?: string
  photo?: string
  idDocFront?: string
  idDocBack?: string
  // Step 2
  visitorType: string
  purpose: string
  customPurpose?: string
  hostName?: string
  department?: string
  driverHasOwnPpe: boolean
  lentPpeItems: string[]
  consentQatarLaw: boolean
}

export const S04_S05Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = React.useMemo(() => [new URLSearchParams(location.search)], [location.search])
  const queryQid = searchParams.get('qid') || ''
  const queryName = searchParams.get('name') || ''
  const queryCompany = searchParams.get('company') || ''
  const queryMobile = searchParams.get('mobile') || ''

  // Retrieve prefilled QID/Passport or draft
  const initialPrefilled = (location.state as any)?.prefilledId || queryQid || ''
  const isPrefilledQid = /^\d{11}$/.test(initialPrefilled)

  const [step, setStep] = useState<1 | 2>(1)

  const [formData, setFormData] = useState<OnboardingDraft>(() => {
    // Check if draft in sessionStorage
    const saved = sessionStorage.getItem('kelvion_onboarding_draft')
    if (saved && !queryQid && !queryName) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return {
      name: queryName || '',
      company: queryCompany || '',
      mobile: queryMobile ? (queryMobile.startsWith('+') ? queryMobile : `+974 ${queryMobile}`) : '+974 ',
      idType: isPrefilledQid ? 'QID' : 'QID',
      idNumber: initialPrefilled,
      idExpiry: '',
      photo: '',
      visitorType: 'TRUCK_DRIVER',
      purpose: 'Raw Material Delivery',
      customPurpose: '',
      hostName: '',
      department: 'Logistics & Warehouse',
      driverHasOwnPpe: true,
      lentPpeItems: [],
      consentQatarLaw: false
    }
  })

  // Settings
  const [purposesList, setPurposesList] = useState<string[]>([])
  const [departmentsList, setDepartmentsList] = useState<string[]>([])
  const [visitorTypesConfig, setVisitorTypesConfig] = useState<any[]>([])

  // Camera modal state
  const [cameraModal, setCameraModal] = useState<{
    isOpen: boolean
    target: 'photo' | 'idDocFront' | 'idDocBack'
    title: string
  }>({
    isOpen: false,
    target: 'photo',
    title: 'Capture Visitor Photo'
  })

  // Duplicate error state
  const [duplicateVisitor, setDuplicateVisitor] = useState<{ id: string; name: string } | null>(null)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  useEffect(() => {
    settingsApi.getSettings().then(s => {
      setPurposesList(s.purposes)
      setDepartmentsList(s.departments)
      setVisitorTypesConfig(s.visitorTypes)
    })
  }, [])

  // Persist draft to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('kelvion_onboarding_draft', JSON.stringify(formData))
  }, [formData])

  // Step 1 Validation
  const isNameValid = formData.name.trim().length >= 2 && formData.name.trim().length <= 100
  const isCompanyValid = formData.company.trim().length >= 2
  // Qatar mobile check: either starts with +974 and has 8 digits, or general format min 8 digits
  const cleanMobile = formData.mobile.replace(/\D/g, '')
  const isMobileValid = cleanMobile.length >= 8
  const isQid = formData.idType === 'QID'
  const isQidValid = /^\d{11}$/.test(formData.idNumber.trim())
  const isOtherIdValid = formData.idNumber.trim().length >= 4
  const isIdValid = isQid ? isQidValid : isOtherIdValid

  const isStep1Valid = isNameValid && isCompanyValid && isMobileValid && isIdValid && !duplicateVisitor

  // Step 2 Validation
  const isPurposeValid = Boolean(formData.purpose)
  const isConsentValid = formData.consentQatarLaw
  const isStep2Valid = isPurposeValid && isConsentValid

  // Duplicate checking when idNumber or idType changes
  useEffect(() => {
    if (!isIdValid) {
      setDuplicateVisitor(null)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicate(true)
      const dup = await visitorsApi.checkDuplicate(formData.idType, formData.idNumber)
      if (dup) {
        setDuplicateVisitor({ id: dup.id, name: dup.name })
      } else {
        setDuplicateVisitor(null)
      }
      setCheckingDuplicate(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [formData.idType, formData.idNumber, isIdValid])

  const handleCaptureResult = (dataUrl: string) => {
    setFormData(prev => ({
      ...prev,
      [cameraModal.target]: dataUrl
    }))
  }

  const handleNextToStep2 = () => {
    if (!formData.photo) {
      // Auto-generate avatar if no webcam taken
      setFormData(prev => ({
        ...prev,
        photo: generateInitialsAvatar(prev.name)
      }))
    }
    setStep(2)
  }

  const handleProceedToReview = () => {
    // Navigate to S06 Review & Save
    navigate('/staff/review', { state: { draft: formData } })
  }

  // Toggle PPE items lent
  const handleToggleLentPpe = (item: string) => {
    setFormData(prev => ({
      ...prev,
      lentPpeItems: prev.lentPpeItems.includes(item)
        ? prev.lentPpeItems.filter(i => i !== item)
        : [...prev.lentPpeItems, item]
    }))
  }

  const activeVisitorType = visitorTypesConfig.find(vt => vt.id === formData.visitorType)
  const ppeChecklist = activeVisitorType?.defaultPpe || ['Safety shoes', 'Hi-vis vest']

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel and Return to Home</span>
          </button>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Visitor Onboarding & Registration
          </h2>
        </div>

        {/* Steps Breadcrumb */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              step === 1
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-[10px]">
              1
            </span>
            <span>Visitor Details</span>
          </div>

          <span className="text-slate-600">→</span>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              step === 2
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-[10px]">
              2
            </span>
            <span>Visit & PPE</span>
          </div>

          <span className="text-slate-600">→</span>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-[10px]">
              3
            </span>
            <span>Review & Save</span>
          </div>
        </div>
      </div>

      {/* Duplicate Alert */}
      {duplicateVisitor && (
        <div className="rounded-2xl bg-red-950/70 border border-red-500/60 p-5 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Duplicate ID Detected</h4>
              <p className="text-xs text-red-200 mt-0.5">
                This {formData.idType} is already registered to{' '}
                <strong className="text-white">{duplicateVisitor.name}</strong> ({duplicateVisitor.id}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/staff/visitor/${duplicateVisitor.id}`)}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold transition"
          >
            <span>Open Existing Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* STEP 1: VISITOR DETAILS */}
      {step === 1 && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800/80 pb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-400" />
              <span>Step 1: Visitor Identity & Document</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="demo-fill-sample-visitor"
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    name: 'Mansoor Al-Khater (منصور الخاطر)',
                    company: 'Qatar Gas Transport',
                    mobile: '+974 55998877',
                    idType: 'QID',
                    idNumber: prev.idNumber && prev.idNumber.length === 11 ? prev.idNumber : '29963401122',
                    idExpiry: '2028-12-31'
                  }))
                }
                className="rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 px-3 py-1.5 text-xs font-semibold transition"
              >
                + Fill Sample Visitor
              </button>
              <span className="text-xs text-slate-400 hidden sm:inline">• Fields with * mandatory</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name * (English & Arabic)
              </label>
              <input
                id="onboard-name"
                type="text"
                dir="auto"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ahmed Al-Sulaiti / أحمد السليطي"
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {!isNameValid && formData.name.length > 0 && (
                <span className="text-[11px] text-red-400 mt-1 block">
                  Name must be between 2 and 100 characters.
                </span>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Company / Organization *
              </label>
              <input
                id="onboard-company"
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Qatar Industrial Logistics W.L.L."
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Mobile Number * (Qatar +974)
              </label>
              <input
                id="onboard-mobile"
                type="tel"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+974 5511 2233"
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard Qatar 8-digit phone with +974 prefix
              </span>
            </div>

            {/* ID Document Type & Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  ID Type *
                </label>
                <select
                  id="onboard-id-type"
                  value={formData.idType}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      idType: e.target.value as VisitorIdType
                    })
                  }
                  className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-3.5 py-3.5 text-base text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="QID">Qatar ID (QID)</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="GCC_ID">GCC National ID</option>
                  <option value="OTHER">Other Official ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  {isQid ? 'QID Number * (11 digits)' : 'ID / Passport Number *'}
                </label>
                <input
                  id="onboard-id-number"
                  type="text"
                  value={formData.idNumber}
                  onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder={isQid ? '29063401234' : 'e.g. P1234567'}
                  className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                />
                {isQid && formData.idNumber.length > 0 && !isQidValid && (
                  <span className="text-[11px] text-amber-400 mt-1 block">
                    QID must be exactly 11 digits (current: {formData.idNumber.length})
                  </span>
                )}
              </div>
            </div>

            {/* ID Expiry */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                ID Expiry Date (Optional)
              </label>
              <input
                id="onboard-id-expiry"
                type="date"
                value={formData.idExpiry || ''}
                onChange={e => setFormData({ ...formData, idExpiry: e.target.value })}
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3 text-base text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Photo & Document Capture Actions */}
            <div className="flex flex-col justify-end space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Visitor Photo & Document Camera
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="capture-photo-btn"
                  onClick={() =>
                    setCameraModal({
                      isOpen: true,
                      target: 'photo',
                      title: 'Capture Visitor Photo (Webcam/Upload)'
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3.5 px-4 text-xs font-bold text-slate-200 transition"
                >
                  <Camera className="h-4 w-4 text-cyan-400" />
                  <span>{formData.photo ? 'Change Photo' : 'Take Visitor Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCameraModal({
                      isOpen: true,
                      target: 'idDocFront',
                      title: 'Scan/Capture ID Document Front'
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3.5 px-4 text-xs font-bold text-slate-200 transition"
                >
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span>{formData.idDocFront ? 'ID Front Attached' : 'Capture ID Front'}</span>
                </button>
              </div>

              {formData.photo && (
                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Photo ready for badge generation</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              id="onboard-step1-next"
              disabled={!isStep1Valid || checkingDuplicate}
              onClick={handleNextToStep2}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-cyan-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 kiosk-touch-target"
            >
              <span>Continue to Visit & PPE</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VISIT DETAILS & PPE CHECKLIST */}
      {step === 2 && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HardHat className="h-5 w-5 text-cyan-400" />
              <span>Step 2: Visit Purpose, Category & PPE Compliance</span>
            </h3>
            <span className="text-xs text-slate-400">Visitor: {formData.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visitor Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Visitor Category *
              </label>
              <select
                id="onboard-visitor-type"
                value={formData.visitorType}
                onChange={e => setFormData({ ...formData, visitorType: e.target.value })}
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white focus:border-cyan-500 focus:outline-none"
              >
                {visitorTypesConfig.map(vt => (
                  <option key={vt.id} value={vt.id}>
                    {vt.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1.5">
                {activeVisitorType?.description || 'Site safety protocol applies'}
              </p>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Purpose of Visit *
              </label>
              <select
                id="onboard-purpose"
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white focus:border-cyan-500 focus:outline-none"
              >
                {purposesList.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="Other">Other (Custom Purpose)</option>
              </select>

              {formData.purpose === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify purpose..."
                  value={formData.customPurpose || ''}
                  onChange={e => setFormData({ ...formData, customPurpose: e.target.value })}
                  className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
                />
              )}
            </div>

            {/* Host / Person to meet */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Person to Meet (Optional)
              </label>
              <input
                id="onboard-host"
                type="text"
                value={formData.hostName || ''}
                onChange={e => setFormData({ ...formData, hostName: e.target.value })}
                placeholder="e.g. Ibrahim Al-Mohannadi (Logistics)"
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Department to Visit
              </label>
              <select
                id="onboard-department"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-3.5 text-base text-white focus:border-cyan-500 focus:outline-none"
              >
                {departmentsList.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PPE Checklist per Visitor Type */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Mandatory PPE Verification for {activeVisitorType?.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check required safety gear before granting access to premises
                </p>
              </div>
            </div>

            {formData.visitorType === 'TRUCK_DRIVER' ? (
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                  <input
                    type="checkbox"
                    id="driver-ppe-confirm"
                    checked={formData.driverHasOwnPpe}
                    onChange={e =>
                      setFormData({ ...formData, driverHasOwnPpe: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 mt-0.5"
                  />
                  <div className="text-xs">
                    <strong className="text-white block text-sm">
                      Staff Confirmation: Driver possesses and is wearing mandatory PPE
                    </strong>
                    <span className="text-slate-300">
                      Safety boots, high-visibility vest, and long trousers verified prior to bay entry.
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Select PPE items lent by Kelvion Reception:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ppeChecklist.map((item: string) => {
                    const isChecked = formData.lentPpeItems.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleLentPpe(item)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition text-left ${
                          isChecked
                            ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <HardHat className="h-4 w-4 shrink-0" />
                        <span>{item}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Consent (Qatar Law No. 13 of 2016) */}
          <div className="rounded-2xl bg-cyan-950/30 border border-cyan-500/30 p-5 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="consent-qatar-law"
                checked={formData.consentQatarLaw}
                onChange={e => setFormData({ ...formData, consentQatarLaw: e.target.checked })}
                className="h-5 w-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 mt-0.5"
              />
              <div className="text-xs">
                <strong className="text-white block text-sm">
                  Personal Data Processing Consent (Qatar Law No. 13 of 2016) *
                </strong>
                <span className="text-slate-300 leading-relaxed block mt-0.5">
                  The visitor consents to Kelvion Thermal Solutions W.L.L. collecting and storing their name, national ID/passport details, photo, and safety induction records for facility security, occupational safety, and regulatory compliance under the Personal Data Privacy Protection Law of the State of Qatar.
                </span>
              </div>
            </label>
          </div>

          {/* Step 2 Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 px-6 py-4 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Step 1</span>
            </button>

            <button
              type="button"
              id="onboard-step2-next"
              disabled={!isStep2Valid}
              onClick={handleProceedToReview}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-cyan-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 kiosk-touch-target"
            >
              <span>Review & Save Profile</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModal.isOpen}
        title={cameraModal.title}
        onClose={() => setCameraModal({ ...cameraModal, isOpen: false })}
        onCapture={handleCaptureResult}
      />
    </div>
  )
}
