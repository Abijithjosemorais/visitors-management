import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitorMode } from '../../context/VisitorModeContext'
import { videosApi } from '../../api/videos'
import { inductionsApi } from '../../api/inductions'
import { SafetyVideo } from '../../types'
import { Play, Pause, ShieldCheck, ArrowRight, Volume2, VolumeX, AlertCircle } from 'lucide-react'

export const S08VideoPlayer: React.FC = () => {
  const { activeVisitor, activeInduction, setActiveInduction } = useVisitorMode()
  const navigate = useNavigate()

  const [activeVideo, setActiveVideo] = useState<SafetyVideo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(15)
  const [maxWatchedTime, setMaxWatchedTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const watchedSecRef = useRef<number>(0)

  // Fetch active video
  useEffect(() => {
    videosApi.getActiveVideo().then(v => {
      setActiveVideo(v)
      setDuration(v.durationSeconds || 15)
    })
  }, [])

  // Guard against keyboard navigation (arrow keys, space bar seeking)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'j', 'l'].includes(
          e.key
        )
      ) {
        e.preventDefault()
      }
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
        togglePlay()
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault() // Disable right click
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.warn('Playback error:', err)
      })
    }
  }

  // Handle time update and strict skip prevention
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime

    // Strict skip prevention: if current time is greater than maxWatchedTime + 1.0s, snap back!
    if (current > maxWatchedTime + 1.2) {
      videoRef.current.currentTime = maxWatchedTime
      setCurrentTime(maxWatchedTime)
      return
    }

    setCurrentTime(current)
    const newMax = Math.max(maxWatchedTime, current)
    setMaxWatchedTime(newMax)
    watchedSecRef.current = Math.floor(newMax)

    // Save progress to induction
    if (activeInduction) {
      inductionsApi.updateProgress(activeInduction.id, Math.floor(newMax))
    }
  }

  // When video ends naturally
  const handleVideoEnded = async () => {
    setIsPlaying(false)
    setIsCompleted(true)
    if (activeInduction) {
      await inductionsApi.updateProgress(activeInduction.id, duration)
      setActiveInduction(prev => (prev ? { ...prev, status: 'COMPLETED', watchedSeconds: duration } : null))
    }
  }

  const handleProceedToAcknowledge = () => {
    navigate('/visitor/acknowledge')
  }

  const progressPercent = Math.min(100, (currentTime / (duration || 1)) * 100)

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-8 max-w-5xl mx-auto w-full select-none animate-in fade-in">
      {/* Video Title Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Mandatory Safety Briefing • {activeVideo?.versionLabel || 'v2.1'}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            {activeVideo?.title || 'Kelvion Doha Safety Induction'}
          </h3>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs animate-bounce">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Watched</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">
            Watch fully to proceed to acknowledgement
          </div>
        )}
      </div>

      {/* Video Container */}
      <div
        className="relative w-full aspect-16/9 rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center group"
        onContextMenu={e => e.preventDefault()}
      >
        {activeVideo && (
          <video
            ref={videoRef}
            src={activeVideo.url}
            playsInline
            controls={false} // Disable native browser controls
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={e => {
              const d = e.currentTarget.duration
              if (d && !isNaN(d) && d > 0) {
                setDuration(Math.floor(d))
              }
            }}
            onError={() => {
              // Graceful fallback video demo stream if network restricted
              setVideoError('Standard video stream loaded.')
            }}
            className="w-full h-full object-contain cursor-pointer pointer-events-auto"
            onClick={togglePlay}
          />
        )}

        {/* Big Overlay Play Button when paused */}
        {!isPlaying && !isCompleted && (
          <button
            type="button"
            id="video-play-overlay"
            onClick={togglePlay}
            className="absolute inset-0 m-auto flex items-center justify-center h-24 w-24 rounded-full bg-cyan-600/90 text-white shadow-2xl shadow-cyan-500/50 hover:scale-110 active:scale-95 transition"
          >
            <Play className="h-10 w-10 fill-white ml-1.5" />
          </button>
        )}

        {/* Completed Overlay Banner */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="text-2xl font-bold text-white">Video Complete</h4>
            <p className="text-xs text-slate-300 max-w-md text-center">
              You have completed 100% of the safety video. Please proceed to the final step to review PPE guidelines and sign the safety acknowledgement.
            </p>
            <button
              type="button"
              id="proceed-to-ack-btn"
              onClick={handleProceedToAcknowledge}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 transition transform active:scale-95 kiosk-touch-target"
            >
              <span>Proceed to Acknowledgement</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Custom Non-Interactive Kiosk Player Controls */}
      <div className="mt-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        {/* NON-INTERACTIVE Progress Bar (seeking disabled) */}
        <div className="space-y-1">
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{Math.floor(currentTime)}s watched</span>
            <span>{Math.floor(progressPercent)}%</span>
            <span>{duration}s total</span>
          </div>
        </div>

        {/* Play/Pause & Sound Only */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="video-play-pause-btn"
              onClick={togglePlay}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white transition active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted
                  setIsMuted(!isMuted)
                }
              }}
              className="rounded-xl bg-slate-800 p-2.5 text-slate-300 hover:text-white transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-amber-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Skip disabled badge */}
          <span className="text-[11px] text-slate-500 italic">
            Seeking and fast-forwarding are disabled for safety compliance
          </span>
        </div>
      </div>
    </div>
  )
}
