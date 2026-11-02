import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { Play, Shield, User, HardHat, CheckCircle2 } from 'lucide-react'

export const S07InductionStart: React.FC = () => {
  const { activeVisitor, activeInduction } = useVisitorMode()
  const navigate = useNavigate()

  if (!activeVisitor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-slate-400">No active visitor session found.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Welcome Card */}
      <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-8 md:p-12 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        {/* Visitor Identity Highlight */}
        <div className="flex flex-col items-center space-y-4">
          <div className="h-28 w-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-cyan-500 shadow-xl shadow-cyan-500/20">
            {activeVisitor.photo ? (
              <img
                src={activeVisitor.photo}
                alt={activeVisitor.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-500">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
              Welcome to Kelvion Thermal Solutions • Doha
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight" dir="auto">
              {activeVisitor.name}
            </h2>
            <p className="text-base font-semibold text-slate-300">
              {activeVisitor.company} • Pass ID: <span className="font-mono text-cyan-300">{activeVisitor.id}</span>
            </p>
          </div>
        </div>

        {/* Mandatory Safety Notice */}
        <div className="max-w-2xl mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 text-left flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <strong className="text-white text-sm block">Mandatory Safety Briefing</strong>
            <p className="leading-relaxed">
              For your safety and the security of all staff, please watch the mandatory safety induction video in full. Once the video concludes, you will acknowledge the safety guidelines and sign on-screen.
            </p>
          </div>
        </div>

        {/* Big Start Video Button */}
        <div className="pt-2">
          <button
            type="button"
            id="visitor-start-video-btn"
            onClick={() => navigate('/visitor/video')}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 py-5 px-8 text-xl font-black text-white shadow-2xl shadow-cyan-500/40 transition transform active:scale-95 kiosk-touch-target"
          >
            <Play className="h-7 w-7 fill-white" />
            <span>Start Safety Video</span>
          </button>
        </div>
      </div>
    </div>
  )
}
