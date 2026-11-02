import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { settingsApi } from '../../api/settings'
import { inductionsApi } from '../../api/inductions'
import SignatureCanvas from 'react-signature-canvas'
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Footprints,
  Shirt,
  Glasses,
  Headphones,
  Hand,
  Scissors,
  BadgeCheck,
  AlertCircle
} from 'lucide-react'

export const S09Acknowledgement: React.FC = () => {
  const { activeVisitor, activeInduction, setActiveInduction } = useVisitorMode()
  const navigate = useNavigate()

  const [declarationText, setDeclarationText] = useState(
    'Herewith I understood the Kelvion safety induction and agree to follow the instructions. I will move on the premises on my own responsibility.'
  )
  const [visitorTypesConfig, setVisitorTypesConfig] = useState<any[]>([])
  const [hasSignature, setHasSignature] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sigCanvasRef = useRef<SignatureCanvas | null>(null)

  useEffect(() => {
    settingsApi.getSettings().then(s => {
      if (s.declarationText) setDeclarationText(s.declarationText)
      setVisitorTypesConfig(s.visitorTypes)
    })
  }, [])

  if (!activeVisitor || !activeInduction) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-slate-400">No active visitor session found.</p>
      </div>
    )
  }

  // Guard: Check if video was 100% watched
  const isVideoFinished =
    activeInduction.status === 'COMPLETED' ||
    activeInduction.watchedSeconds >= activeInduction.totalSeconds

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setHasSignature(false)
    }
  }

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setHasSignature(true)
    }
  }

  const handleAcknowledge = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      setError('Please provide your signature before acknowledging.')
      return
    }

    if (!isVideoFinished) {
      setError('The safety induction video must be completed 100% before acknowledgement.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const signatureData = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png')
      const updated = await inductionsApi.acknowledge(activeInduction.id, signatureData)
      setActiveInduction(updated)
      navigate('/visitor/cleared')
    } catch (err: any) {
      setError(err.message || 'Failed to record acknowledgement.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get PPE pictograms for visitor's type
  const activeTypeConfig = visitorTypesConfig.find(vt => vt.id === activeVisitor.visitorType)
  const ppeList = activeTypeConfig ? activeTypeConfig.defaultPpe : ['Safety shoes', 'Hi-vis vest']

  const renderIcon = (item: string) => {
    const lower = item.toLowerCase()
    if (lower.includes('shoe') || lower.includes('boot')) return <Footprints className="h-6 w-6 text-cyan-400" />
    if (lower.includes('vest') || lower.includes('vis')) return <Shirt className="h-6 w-6 text-amber-400" />
    if (lower.includes('glass')) return <Glasses className="h-6 w-6 text-cyan-400" />
    if (lower.includes('ear')) return <Headphones className="h-6 w-6 text-cyan-400" />
    if (lower.includes('glove')) return <Hand className="h-6 w-6 text-cyan-400" />
    if (lower.includes('trouser')) return <Scissors className="h-6 w-6 text-cyan-400" />
    return <BadgeCheck className="h-6 w-6 text-cyan-400" />
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800 text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
          Step 3 of 3 • Safety Agreement
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          PPE Compliance & Safety Acknowledgment
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Visitor: <strong className="text-white" dir="auto">{activeVisitor.name}</strong> •{' '}
          {activeVisitor.company}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-950/70 border border-red-500/60 p-4 text-xs text-red-200 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PPE Pictograms */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Mandatory PPE Required for Your Category ({activeTypeConfig?.name || 'Visitor'})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {ppeList.map((item: string) => (
            <div
              key={item}
              className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center">
                {renderIcon(item)}
              </div>
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration Text Box */}
      <div className="rounded-3xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-3 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Legal Safety Declaration
        </span>
        <blockquote className="p-4 rounded-2xl bg-slate-800/80 border-l-4 border-cyan-500 text-sm md:text-base font-medium text-slate-200 italic leading-relaxed">
          "{declarationText}"
        </blockquote>
      </div>

      {/* On-Screen Signature Pad */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Visitor Digital Signature *
            </h4>
            <p className="text-xs text-slate-400">
              Sign below using your finger or stylus on the touch screen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="demo-auto-sign-btn"
              onClick={() => {
                if (sigCanvasRef.current) {
                  const canvas = sigCanvasRef.current.getCanvas()
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    ctx.strokeStyle = '#0f172a'
                    ctx.lineWidth = 3
                    ctx.beginPath()
                    ctx.moveTo(30, 70)
                    ctx.bezierCurveTo(80, 20, 140, 110, 220, 40)
                    ctx.bezierCurveTo(240, 30, 280, 80, 320, 50)
                    ctx.stroke()
                    setHasSignature(true)
                  }
                }
              }}
              className="rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 px-3 py-1.5 text-xs font-semibold transition"
            >
              Sign Sample
            </button>
            <button
              type="button"
              id="clear-signature-btn"
              onClick={handleClearSignature}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Canvas container */}
        <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-white/95 overflow-hidden">
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor="#0f172a"
            canvasProps={{
              className: 'w-full h-44 cursor-crosshair'
            }}
            onEnd={handleSignatureEnd}
          />
        </div>

        {!hasSignature && (
          <span className="text-[11px] text-amber-400 block">
            Signature required to activate the Acknowledge button.
          </span>
        )}
      </div>

      {/* Acknowledge Button */}
      <div className="pt-2">
        <button
          type="button"
          id="visitor-ack-submit-btn"
          disabled={!hasSignature || !isVideoFinished || isSubmitting}
          onClick={handleAcknowledge}
          className="w-full flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 py-5 px-8 text-xl font-black text-white shadow-2xl shadow-emerald-600/40 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-[0.99] kiosk-touch-target"
        >
          <CheckCircle2 className="h-6 w-6" />
          <span>
            {isSubmitting
              ? 'Recording Induction...'
              : 'I Acknowledge & Agree to Safety Rules'}
          </span>
        </button>
      </div>
    </div>
  )
}
