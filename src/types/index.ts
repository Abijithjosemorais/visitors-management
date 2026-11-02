export type UserRole = 'SUPER_ADMIN' | 'STAFF'

export interface User {
  id: string
  username: string
  name: string
  email: string
  mobile: string
  role: UserRole
  status: 'ACTIVE' | 'INACTIVE'
  pin?: string // 4-digit PIN for quick kiosk exit
  createdAt: string
}

export type VisitorIdType = 'QID' | 'PASSPORT' | 'GCC_ID' | 'OTHER'

export interface Visitor {
  id: string // Format: VIS-000123
  name: string // English & Arabic supported
  company: string
  mobile: string // Qatar format default +974
  idType: VisitorIdType
  idNumber: string // 11 digits if QID
  idExpiry?: string // YYYY-MM-DD
  idDocFront?: string // base64 or placeholder
  idDocBack?: string
  photo?: string // base64 data url or avatar placeholder
  visitorType: string // TRUCK_DRIVER, PRODUCTION_VISITOR, OFFICE_VISITOR
  isBlocked: boolean
  blockReason?: string
  blockedAt?: string
  blockedBy?: string
  createdAt: string
  updatedAt: string
}

export type InductionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ACKNOWLEDGED' | 'INCOMPLETE'

export interface Induction {
  id: string
  visitorId: string
  videoId: string
  videoVersion: string
  startedAt: string
  completedAt?: string
  watchedSeconds: number
  totalSeconds: number
  status: InductionStatus
  acknowledgedAt?: string
  signature?: string // base64 data url
  expiresAt?: string // ISO date string
  staffUserId: string
  device: string
}

export type VisitStatus = 'ON_SITE' | 'CHECKED_OUT' | 'AUTO_CHECKED_OUT'

export interface Visit {
  id: string
  visitorId: string
  visitorName: string
  visitorCompany: string
  visitorType: string
  purpose: string
  hostName?: string
  department?: string
  checkInTime: string
  checkOutTime?: string
  status: VisitStatus
  ppeItemsLent: string[]
  staffCheckInId: string
  staffCheckOutId?: string
}

export interface SafetyVideo {
  id: string
  title: string
  versionLabel: string
  url: string
  durationSeconds: number
  status: 'ACTIVE' | 'ARCHIVED'
  uploadedBy: string
  uploadedAt: string
  inductionsCompletedCount: number
}

export interface VisitorTypeConfig {
  id: string
  name: string
  description?: string
  defaultPpe: string[]
  ppePictograms: { name: string; icon: string }[]
}

export interface KioskSettings {
  validityDays: number // default 30
  autoCheckoutTime: string // "23:59"
  minVisitorAge: number // 18
  declarationText: string
  visitorTypes: VisitorTypeConfig[]
  idTypes: string[]
  departments: string[]
  purposes: string[]
  simulatedDateOffsetDays: number // Demo helper: +10, +31 etc.
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resourceType: string
  resourceId?: string
  details: string
  beforeState?: any
  afterState?: any
}

export interface AppNotification {
  id: string
  timestamp: string
  title: string
  message: string
  type: 'ALERT' | 'INFO' | 'WARNING'
  read: boolean
  visitorId?: string
}

export interface InductionValidationResult {
  status: 'VALID' | 'EXPIRED' | 'NONE'
  latestInduction?: Induction
  daysLeft?: number
  expiresAt?: string
  reason?: string
}
