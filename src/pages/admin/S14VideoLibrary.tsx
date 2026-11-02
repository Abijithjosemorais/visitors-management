import React, { useState } from 'react'
import { videosApi } from '../../api/videos'
import { useAuth } from '../../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafetyVideo } from '../../types'
import { formatQatarDate } from '../../api/db'
import {
  Video,
  Upload,
  Play,
  CheckCircle2,
  Archive,
  Clock,
  User,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react'

export const S14VideoLibrary: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [previewVideo, setPreviewVideo] = useState<SafetyVideo | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadVersion, setUploadVersion] = useState('')
  const [uploadDuration, setUploadDuration] = useState('15')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Fetch all videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videosApi.getVideos()
  })

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: async (videoId: string) => {
      return videosApi.activateVideo(videoId, user?.name || 'Admin')
    },
    onSuccess: activated => {
      setActionNotice(
        `Video "${activated.title}" (${activated.versionLabel}) is now ACTIVE. Previous active video archived. Existing valid inductions remain valid.`
      )
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    }
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      return videosApi.uploadVideo({
        title: uploadTitle,
        versionLabel: uploadVersion,
        durationSeconds: parseInt(uploadDuration, 10) || 15,
        uploadedBy: user?.name || 'Admin'
      })
    },
    onSuccess: () => {
      setIsUploadModalOpen(false)
      setUploadTitle('')
      setUploadVersion('')
      setActionNotice('New safety video version uploaded successfully.')
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    }
  })

  return (
    <div className="p-6 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            HSE Induction Media Governance
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Safety Video Library & Versions
          </h2>
        </div>

        <button
          type="button"
          id="upload-video-btn"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
        >
          <Upload className="h-4 w-4" />
          <span>Upload New Video</span>
        </button>
      </div>

      {actionNotice && (
        <div className="rounded-2xl bg-cyan-950/70 border border-cyan-500/50 p-4 text-xs text-cyan-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs text-cyan-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => {
          const isActive = v.status === 'ACTIVE'

          return (
            <div
              key={v.id}
              className={`rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl border transition ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">{v.id}</span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-xs font-bold shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span>ACTIVE VERSION</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
                      <Archive className="h-3 w-3" />
                      <span>ARCHIVED</span>
                    </span>
                  )}
                </div>

                {/* Title & Version */}
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{v.title}</h3>
                  <span className="inline-block font-mono text-xs font-semibold text-cyan-400 mt-1">
                    Version: {v.versionLabel}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold">{v.durationSeconds} seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uploaded By:</span>
                    <span>{v.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uploaded Date:</span>
                    <span>{formatQatarDate(v.uploadedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inductions Completed:</span>
                    <strong className="text-white">{v.inductionsCompletedCount} visitors</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  id={`preview-video-${v.id}`}
                  onClick={() => setPreviewVideo(v)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Preview</span>
                </button>

                {!isActive && (
                  <button
                    type="button"
                    id={`activate-video-${v.id}`}
                    onClick={() => activateMutation.mutate(v.id)}
                    disabled={activateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Activate</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-lg font-bold text-white">{previewVideo.title}</h3>
                <span className="text-xs text-cyan-400 font-mono">Version: {previewVideo.versionLabel}</span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-black border border-slate-800">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Upload New Safety Induction Video</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Kelvion Doha Safety Induction 2027"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Version Label *
                  </label>
                  <input
                    type="text"
                    value={uploadVersion}
                    onChange={e => setUploadVersion(e.target.value)}
                    placeholder="e.g. v2.2"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Duration (Sec)
                  </label>
                  <input
                    type="number"
                    value={uploadDuration}
                    onChange={e => setUploadDuration(e.target.value)}
                    placeholder="15"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Select Video File (MP4, max 500MB)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2 text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Newly uploaded videos are saved in ARCHIVED state initially. You can review them before activating.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="submit-video-upload"
                disabled={!uploadTitle.trim() || !uploadVersion.trim() || uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
                className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 disabled:opacity-50 transition"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Save Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
