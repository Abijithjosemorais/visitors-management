import { SafetyVideo } from '../types'
import { db, delay } from './db'
import { auditApi } from './audit'

export const videosApi = {
  async getVideos(): Promise<SafetyVideo[]> {
    await delay()
    return db.getVideos()
  },

  async getActiveVideo(): Promise<SafetyVideo> {
    await delay(100)
    const videos = db.getVideos()
    const active = videos.find(v => v.status === 'ACTIVE')
    if (!active) {
      // Fallback
      return videos[0]
    }
    return active
  },

  async uploadVideo(data: {
    title: string
    versionLabel: string
    url?: string
    durationSeconds?: number
    uploadedBy: string
  }): Promise<SafetyVideo> {
    await delay()
    const videos = db.getVideos()

    const newVideo: SafetyVideo = {
      id: `VID-${String(videos.length + 1).padStart(3, '0')}`,
      title: data.title.trim(),
      versionLabel: data.versionLabel.trim(),
      // Use provided URL or standard sample video
      url: data.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      durationSeconds: data.durationSeconds || 15,
      status: 'ARCHIVED', // uploaded as inactive by default until activated
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date().toISOString(),
      inductionsCompletedCount: 0
    }

    videos.unshift(newVideo)
    db.setVideos(videos)

    await auditApi.logAction({
      action: 'VIDEO_UPLOADED',
      resourceType: 'SafetyVideo',
      resourceId: newVideo.id,
      details: `Uploaded new safety video "${newVideo.title}" (${newVideo.versionLabel})`
    })

    return newVideo
  },

  async activateVideo(id: string, staffName: string): Promise<SafetyVideo> {
    await delay()
    const videos = db.getVideos()
    const target = videos.find(v => v.id === id)
    if (!target) throw new Error('Video not found')

    const prevActive = videos.find(v => v.status === 'ACTIVE')

    // Mark all others archived, activate target
    videos.forEach(v => {
      if (v.id === id) {
        v.status = 'ACTIVE'
      } else if (v.status === 'ACTIVE') {
        v.status = 'ARCHIVED'
      }
    })

    db.setVideos(videos)

    await auditApi.logAction({
      action: 'VIDEO_ACTIVATED',
      resourceType: 'SafetyVideo',
      resourceId: id,
      details: `Activated safety video "${target.title}" (${target.versionLabel}). Archived previous video (${prevActive?.versionLabel || 'None'}). Existing valid inductions remain valid.`,
      beforeState: { activeVideoId: prevActive?.id, activeVersion: prevActive?.versionLabel },
      afterState: { activeVideoId: target.id, activeVersion: target.versionLabel }
    })

    return target
  },

  async incrementInductionCount(videoId: string): Promise<void> {
    const videos = db.getVideos()
    const video = videos.find(v => v.id === videoId)
    if (video) {
      video.inductionsCompletedCount = (video.inductionsCompletedCount || 0) + 1
      db.setVideos(videos)
    }
  }
}
