import { db, delay, formatQatarDate, formatQatarTime } from './db'

export const reportsApi = {
  // S12 & Dashboard stats
  async getDashboardStats() {
    await delay(100)
    const visits = db.getVisits()
    const visitors = db.getVisitors()
    const inductions = db.getInductions()
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)

    const onSiteNow = visits.filter(v => v.status === 'ON_SITE').length
    const visitorsToday = visits.filter(v => v.checkInTime.slice(0, 10) === todayStr).length
    const newRegToday = visitors.filter(v => v.createdAt.slice(0, 10) === todayStr).length
    const inductionsToday = inductions.filter(
      i => i.status === 'ACKNOWLEDGED' && i.acknowledgedAt && i.acknowledgedAt.slice(0, 10) === todayStr
    ).length

    // Expiring in next 7 days
    const next7DaysMs = 7 * 24 * 60 * 60 * 1000
    const nowMs = now.getTime()
    const expiringSoon = inductions.filter(i => {
      if (i.status !== 'ACKNOWLEDGED' || !i.expiresAt) return false
      const expMs = new Date(i.expiresAt).getTime()
      return expMs > nowMs && expMs <= nowMs + next7DaysMs
    }).length

    const recentVisits = visits.slice(0, 6)

    return {
      onSiteNow,
      visitorsToday,
      newRegToday,
      inductionsToday,
      expiringSoon,
      recentVisits
    }
  },

  // Exhibit #48 Training Participant List data
  async getExhibit48TrainingList(date?: string) {
    await delay()
    const inductions = db.getInductions()
    const visitors = db.getVisitors()
    const videos = db.getVideos()

    const targetDate = date || new Date().toISOString().slice(0, 10)

    const filtered = inductions.filter(i => {
      const indDate = (i.acknowledgedAt || i.startedAt).slice(0, 10)
      return indDate === targetDate && i.status === 'ACKNOWLEDGED'
    })

    const participants = filtered.map((ind, idx) => {
      const visitor = visitors.find(v => v.id === ind.visitorId)
      const video = videos.find(v => v.id === ind.videoId)
      return {
        sr: idx + 1,
        name: visitor?.name || 'Unknown Visitor',
        qid: visitor?.idNumber || 'N/A',
        company: visitor?.company || 'N/A',
        department: visitor?.visitorType.replace('_', ' ') || 'Production',
        videoVersion: ind.videoVersion || video?.versionLabel || 'v2.1',
        time: formatQatarTime(ind.acknowledgedAt || ind.startedAt),
        signature: ind.signature || '',
        remark: 'Passed & Acknowledged'
      }
    })

    return {
      topic: 'Kelvion Corp + KTSQ Safety Induction',
      venue: 'Kelvion Doha Reception Kiosk',
      date: formatQatarDate(targetDate),
      participants
    }
  },

  // Daily Visitors Log Sheet data
  async getDailyVisitorsLogSheet(date?: string) {
    await delay()
    const visits = db.getVisits()
    const visitors = db.getVisitors()
    const inductions = db.getInductions()

    const targetDate = date || new Date().toISOString().slice(0, 10)

    const filtered = visits.filter(v => v.checkInTime.slice(0, 10) === targetDate)

    const sheetRows = filtered.map((v, idx) => {
      const visitor = visitors.find(vis => vis.id === v.visitorId)
      const latestInd = inductions.find(i => i.visitorId === v.visitorId && i.status === 'ACKNOWLEDGED')
      return {
        sl: idx + 1,
        name: v.visitorName,
        company: v.visitorCompany,
        mobile: visitor?.mobile || 'N/A',
        purpose: v.purpose,
        host: v.hostName || 'Reception',
        qid: visitor?.idNumber || 'N/A',
        timeIn: formatQatarTime(v.checkInTime),
        timeOut: v.checkOutTime ? formatQatarTime(v.checkOutTime) : (v.status === 'ON_SITE' ? 'ON SITE' : 'AUTO CHECK-OUT'),
        signature: latestInd?.signature || '',
        status: v.status
      }
    })

    return {
      date: formatQatarDate(targetDate),
      rows: sheetRows
    }
  }
}
