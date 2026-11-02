import React, { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, RefreshCw, Check } from 'lucide-react'

interface CameraCaptureModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onCapture: (dataUrl: string) => void
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  title,
  onClose,
  onCapture
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, capturedImage])

  const startCamera = async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err)
      setCameraError('Webcam/Camera device not accessible. You can upload an image file instead.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const handleSnap = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      setCapturedImage(dataUrl)
      stopCamera()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setCapturedImage(reader.result as string)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      setCapturedImage(null)
      onClose()
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    startCamera()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-left space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera()
              setCapturedImage(null)
              onClose()
            }}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder or Preview */}
        <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="h-full w-full object-cover" />
          ) : cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-amber-300">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-500 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload From File</span>
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
              </button>

              {!cameraError && (
                <button
                  type="button"
                  onClick={handleSnap}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 transition"
                >
                  <Camera className="h-4 w-4" />
                  <span>Snap Photo</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition"
              >
                <Check className="h-4 w-4" />
                <span>Use This Image</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
