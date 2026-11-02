import {
  User,
  Visitor,
  Induction,
  Visit,
  SafetyVideo,
  KioskSettings,
  AuditLog,
  AppNotification,
  InductionValidationResult
} from '../types'
import { generateInitialsAvatar } from '../lib/utils'

const STORAGE_KEY_PREFIX = 'kelvion_kiosk_'

export const delay = (ms?: number) => {
  const wait = ms ?? Math.floor(Math.random() * 250) + 150 // 150-400ms latency
  return new Promise(resolve => setTimeout(resolve, wait))
}

export const initialSettings: KioskSettings = {
  validityDays: 30,
  autoCheckoutTime: '23:59',
  minVisitorAge: 18,
  declarationText:
    'Herewith I understood the Kelvion safety induction and agree to follow the instructions. I will move on the premises on my own responsibility.',
  visitorTypes: [
    {
      id: 'TRUCK_DRIVER',
      name: 'Truck / Delivery Driver',
      description: 'Drivers delivering or picking up materials and equipment at loading bays',
      defaultPpe: ['Safety shoes', 'Hi-vis vest', 'Long trousers'],
      ppePictograms: [
        { name: 'Safety Boots', icon: 'Footprints' },
        { name: 'High-Vis Vest', icon: 'Shirt' },
        { name: 'Long Trousers', icon: 'Scissors' }
      ]
    },
    {
      id: 'PRODUCTION_VISITOR',
      name: 'Visitor to Production Areas',
      description: 'Guests, contractors, and inspectors accessing workshop & fabrication bays',
      defaultPpe: [
        'Safety shoes',
        'Hi-vis vest',
        'Safety glasses',
        'Ear protection',
        'Gloves',
        'Long trousers'
      ],
      ppePictograms: [
        { name: 'Safety Boots', icon: 'Footprints' },
        { name: 'High-Vis Vest', icon: 'Shirt' },
        { name: 'Safety Glasses', icon: 'Glasses' },
        { name: 'Ear Protection', icon: 'Headphones' },
        { name: 'Safety Gloves', icon: 'Hand' },
        { name: 'Long Trousers', icon: 'Scissors' }
      ]
    },
    {
      id: 'OFFICE_VISITOR',
      name: 'Office & Admin Visitor',
      description: 'Guests visiting administrative offices only, no workshop access',
      defaultPpe: ['Visitor Badge'],
      ppePictograms: [{ name: 'Visitor Badge', icon: 'BadgeCheck' }]
    }
  ],
  idTypes: ['QID', 'Passport', 'GCC ID', 'Other'],
  departments: [
    'Production & Fabrication',
    'Heat Exchanger Assembly',
    'HSE & Quality Assurance',
    'Logistics & Warehouse',
    'Plant Maintenance',
    'Engineering & Design',
    'Commercial & Sales',
    'Human Resources'
  ],
  purposes: [
    'Raw Material Delivery',
    'Finished Goods Pickup',
    'Equipment Maintenance / Calibration',
    'HSE Audit / Regulatory Inspection',
    'Client Technical Review',
    'Subcontractor Fabrication Work',
    'Vendor Assessment Meeting'
  ],
  simulatedDateOffsetDays: 0
}

export const initialUsers: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.almansoor@kelvion.qa',
    mobile: '+974 5511 2233',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    pin: '1234',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'USR-002',
    username: 'staff1',
    name: 'Mariam Al-Kuwari',
    email: 'mariam.kuwari@kelvion.qa',
    mobile: '+974 6622 3344',
    role: 'STAFF',
    status: 'ACTIVE',
    pin: '1111',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'USR-003',
    username: 'staff2',
    name: 'Joseph Mathew',
    email: 'joseph.mathew@kelvion.qa',
    mobile: '+974 7733 4455',
    role: 'STAFF',
    status: 'ACTIVE',
    pin: '2222',
    createdAt: '2026-01-15T08:00:00Z'
  }
]

export const initialVideos: SafetyVideo[] = [
  {
    id: 'VID-001',
    title: 'Kelvion Doha Comprehensive Safety Induction 2026',
    versionLabel: 'v2.1',
    // High reliability demo instructional video URL with CC-0 / webm/mp4 sample
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationSeconds: 15,
    status: 'ACTIVE',
    uploadedBy: 'Tariq Al-Mansoor',
    uploadedAt: '2026-01-05T10:00:00Z',
    inductionsCompletedCount: 42
  },
  {
    id: 'VID-000',
    title: 'Kelvion Plant Safety Induction 2025',
    versionLabel: 'v1.4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    durationSeconds: 15,
    status: 'ARCHIVED',
    uploadedBy: 'Tariq Al-Mansoor',
    uploadedAt: '2025-06-01T09:00:00Z',
    inductionsCompletedCount: 128
  }
]

export const initialVisitors: Visitor[] = [
  {
    id: 'VIS-000101',
    name: 'Ahmed Al-Sulaiti (أحمد السليطي)',
    company: 'Qatar Industrial Logistics W.L.L.',
    mobile: '+974 5544 3322',
    idType: 'QID',
    idNumber: '29063401234',
    idExpiry: '2027-12-31',
    photo: generateInitialsAvatar('Ahmed Al-Sulaiti', '#0284c7'),
    visitorType: 'TRUCK_DRIVER',
    isBlocked: false,
    createdAt: '2026-09-01T08:30:00Z',
    updatedAt: '2026-10-25T09:00:00Z'
  },
  {
    id: 'VIS-000102',
    name: 'Michael Vance',
    company: 'Apex Tube Inspection Services',
    mobile: '+974 6677 8899',
    idType: 'PASSPORT',
    idNumber: 'P8923412',
    idExpiry: '2028-06-15',
    photo: generateInitialsAvatar('Michael Vance', '#0d9488'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-08-14T10:15:00Z',
    updatedAt: '2026-10-10T11:00:00Z'
  },
  {
    id: 'VIS-000103',
    name: 'Khalid Al-Hajri (خالد الهاجري)',
    company: 'Gulf Steel Fabrication',
    mobile: '+974 7711 2244',
    idType: 'QID',
    idNumber: '28563405678',
    idExpiry: '2027-08-20',
    photo: generateInitialsAvatar('Khalid Al-Hajri', '#7c3aed'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-07-02T09:00:00Z',
    updatedAt: '2026-09-12T14:00:00Z'
  },
  {
    id: 'VIS-000104',
    name: 'Rashid Al-Kuwari (راشد الكواري)',
    company: 'Heavy Haul Transport Qatar',
    mobile: '+974 3388 9900',
    idType: 'QID',
    idNumber: '29263409988',
    idExpiry: '2027-04-10',
    photo: generateInitialsAvatar('Rashid Al-Kuwari', '#ea580c'),
    visitorType: 'TRUCK_DRIVER',
    isBlocked: true,
    blockReason: 'Security alert: Disregarded workshop PPE & entered non-authorized electrical sub-station without permit on 14/10/2026.',
    blockedAt: '2026-10-15T11:20:00Z',
    blockedBy: 'Tariq Al-Mansoor',
    createdAt: '2026-05-11T13:45:00Z',
    updatedAt: '2026-10-15T11:20:00Z'
  },
  {
    id: 'VIS-000105',
    name: 'David Schmidt',
    company: 'Kelvion Holding GmbH (Bochum)',
    mobile: '+49 171 9928374',
    idType: 'PASSPORT',
    idNumber: 'C1049281',
    idExpiry: '2029-01-30',
    photo: generateInitialsAvatar('David Schmidt', '#2563eb'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-28T07:15:00Z',
    updatedAt: '2026-10-28T07:15:00Z'
  },
  {
    id: 'VIS-000106',
    name: 'Fatima Al-Naimi (فاطمة النعيمي)',
    company: 'Qatar Ministry of Environment & HSE',
    mobile: '+974 5599 0011',
    idType: 'QID',
    idNumber: '29463407766',
    idExpiry: '2028-11-15',
    photo: generateInitialsAvatar('Fatima Al-Naimi', '#db2777'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-29T08:00:00Z',
    updatedAt: '2026-10-29T08:00:00Z'
  },
  {
    id: 'VIS-000107',
    name: 'Mohammed Salem (محمد سالم)',
    company: 'Doha Crane & Heavy Rigging',
    mobile: '+974 6655 4433',
    idType: 'QID',
    idNumber: '28863403322',
    idExpiry: '2026-09-01', // EXPIRED ID DOCUMENT (warning!)
    photo: generateInitialsAvatar('Mohammed Salem', '#4f46e5'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-06-15T09:20:00Z',
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'VIS-000108',
    name: 'Suresh Kumar',
    company: 'Al-Attiyah Industrial Gas Solutions',
    mobile: '+974 7788 1122',
    idType: 'QID',
    idNumber: '28663408899',
    idExpiry: '2027-10-31',
    photo: generateInitialsAvatar('Suresh Kumar', '#059669'),
    visitorType: 'TRUCK_DRIVER',
    isBlocked: false,
    createdAt: '2026-09-10T11:00:00Z',
    updatedAt: '2026-10-18T14:30:00Z'
  },
  {
    id: 'VIS-000109',
    name: 'Nasser Al-Marri (ناصر المري)',
    company: 'Petrofac Doha Services',
    mobile: '+974 5533 8811',
    idType: 'QID',
    idNumber: '29163404455',
    idExpiry: '2028-02-28',
    photo: generateInitialsAvatar('Nasser Al-Marri', '#d97706'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-15T09:30:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'VIS-000110',
    name: 'Jean-Luc Dubois',
    company: 'Bureau Veritas Middle East',
    mobile: '+974 3344 5566',
    idType: 'PASSPORT',
    idNumber: '19FR89421',
    idExpiry: '2027-09-15',
    photo: generateInitialsAvatar('Jean-Luc Dubois', '#0891b2'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-22T08:15:00Z',
    updatedAt: '2026-10-22T08:15:00Z'
  },
  {
    id: 'VIS-000111',
    name: 'Hamad Al-Thani (حمد آل ثاني)',
    company: 'Qatar Energy Industrial City Dept',
    mobile: '+974 5522 7788',
    idType: 'QID',
    idNumber: '29363401122',
    idExpiry: '2028-05-30',
    photo: generateInitialsAvatar('Hamad Al-Thani', '#9333ea'),
    visitorType: 'OFFICE_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-30T10:00:00Z',
    updatedAt: '2026-10-30T10:00:00Z'
  },
  {
    id: 'VIS-000112',
    name: 'Vikram Patel',
    company: 'Precision Gaskets & Fasteners Ltd',
    mobile: '+974 6611 9988',
    idType: 'QID',
    idNumber: '28763402233',
    idExpiry: '2027-07-20',
    photo: generateInitialsAvatar('Vikram Patel', '#16a34a'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-27T13:00:00Z',
    updatedAt: '2026-10-27T13:00:00Z'
  },
  {
    id: 'VIS-000113',
    name: 'Ali Al-Kuwari (علي الكواري)',
    company: 'Doha Technical Supplies',
    mobile: '+974 7799 4433',
    idType: 'QID',
    idNumber: '28963407788',
    idExpiry: '2027-11-10',
    photo: generateInitialsAvatar('Ali Al-Kuwari', '#ca8a04'),
    visitorType: 'TRUCK_DRIVER',
    isBlocked: false,
    createdAt: '2026-10-24T09:00:00Z',
    updatedAt: '2026-10-24T09:00:00Z'
  },
  {
    id: 'VIS-000114',
    name: 'Carlos Mendoza',
    company: 'Wartsila Energy Services',
    mobile: '+974 3377 2211',
    idType: 'PASSPORT',
    idNumber: 'PA904321',
    idExpiry: '2028-04-12',
    photo: generateInitialsAvatar('Carlos Mendoza', '#e11d48'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-26T14:15:00Z',
    updatedAt: '2026-10-26T14:15:00Z'
  },
  {
    id: 'VIS-000115',
    name: 'Zaid Al-Ansari (زيد الأنصاري)',
    company: 'Oryx GTL Contracting',
    mobile: '+974 5588 3344',
    idType: 'QID',
    idNumber: '29563406655',
    idExpiry: '2028-09-25',
    photo: generateInitialsAvatar('Zaid Al-Ansari', '#0284c7'),
    visitorType: 'PRODUCTION_VISITOR',
    isBlocked: false,
    createdAt: '2026-10-31T09:00:00Z',
    updatedAt: '2026-10-31T09:00:00Z'
  }
]

// Base date reference: 2026-11-01
export const initialInductions: Induction[] = [
  // Ahmed: acknowledged 10 days ago (2026-10-22) -> VALID (20 days remaining)
  {
    id: 'IND-001',
    visitorId: 'VIS-000101',
    videoId: 'VID-001',
    videoVersion: 'v2.1',
    startedAt: '2026-10-22T08:10:00Z',
    completedAt: '2026-10-22T08:25:00Z',
    watchedSeconds: 15,
    totalSeconds: 15,
    status: 'ACKNOWLEDGED',
    acknowledgedAt: '2026-10-22T08:26:00Z',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" stroke="black" stroke-width="2" fill="none"/></svg>',
    expiresAt: '2026-11-21T08:26:00Z',
    staffUserId: 'USR-002',
    device: 'Kiosk-Reception-01'
  },
  // Michael Vance: acknowledged 25 days ago (2026-10-07) -> VALID (5 days left)
  {
    id: 'IND-002',
    visitorId: 'VIS-000102',
    videoId: 'VID-001',
    videoVersion: 'v2.1',
    startedAt: '2026-10-07T09:00:00Z',
    completedAt: '2026-10-07T09:15:00Z',
    watchedSeconds: 15,
    totalSeconds: 15,
    status: 'ACKNOWLEDGED',
    acknowledgedAt: '2026-10-07T09:16:00Z',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M20 30 C 50 10, 80 50, 160 20" stroke="black" stroke-width="2" fill="none"/></svg>',
    expiresAt: '2026-11-06T09:16:00Z',
    staffUserId: 'USR-002',
    device: 'Kiosk-Reception-01'
  },
  // Khalid: acknowledged 40 days ago (2026-09-22) -> EXPIRED (was 30 days)
  {
    id: 'IND-003',
    visitorId: 'VIS-000103',
    videoId: 'VID-000',
    videoVersion: 'v1.4',
    startedAt: '2026-09-22T10:00:00Z',
    completedAt: '2026-09-22T10:15:00Z',
    watchedSeconds: 15,
    totalSeconds: 15,
    status: 'ACKNOWLEDGED',
    acknowledgedAt: '2026-09-22T10:16:00Z',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15 45 Q 60 5 120 40" stroke="black" stroke-width="2" fill="none"/></svg>',
    expiresAt: '2026-10-22T10:16:00Z',
    staffUserId: 'USR-003',
    device: 'Kiosk-Reception-01'
  },
  // Suresh Kumar: acknowledged 2 days ago (2026-10-30) -> VALID
  {
    id: 'IND-004',
    visitorId: 'VIS-000108',
    videoId: 'VID-001',
    videoVersion: 'v2.1',
    startedAt: '2026-10-30T11:15:00Z',
    completedAt: '2026-10-30T11:30:00Z',
    watchedSeconds: 15,
    totalSeconds: 15,
    status: 'ACKNOWLEDGED',
    acknowledgedAt: '2026-10-30T11:32:00Z',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M25 35 Q 75 15 150 35" stroke="black" stroke-width="2" fill="none"/></svg>',
    expiresAt: '2026-11-29T11:32:00Z',
    staffUserId: 'USR-002',
    device: 'Kiosk-Reception-01'
  },
  // Incomplete attempt for Nasser Al-Marri
  {
    id: 'IND-005',
    visitorId: 'VIS-000109',
    videoId: 'VID-001',
    videoVersion: 'v2.1',
    startedAt: '2026-10-20T10:10:00Z',
    watchedSeconds: 6,
    totalSeconds: 15,
    status: 'INCOMPLETE',
    staffUserId: 'USR-002',
    device: 'Kiosk-Reception-01'
  }
]

export const initialVisits: Visit[] = [
  // Ahmed is ON_SITE right now (open visit)
  {
    id: 'VST-0001',
    visitorId: 'VIS-000101',
    visitorName: 'Ahmed Al-Sulaiti (أحمد السليطي)',
    visitorCompany: 'Qatar Industrial Logistics W.L.L.',
    visitorType: 'TRUCK_DRIVER',
    purpose: 'Raw Material Delivery',
    hostName: 'Ibrahim Al-Mohannadi',
    department: 'Logistics & Warehouse',
    checkInTime: '2026-11-01T08:15:00Z',
    status: 'ON_SITE',
    ppeItemsLent: ['Hi-vis vest'],
    staffCheckInId: 'USR-002'
  },
  // David Schmidt is ON_SITE right now
  {
    id: 'VST-0002',
    visitorId: 'VIS-000105',
    visitorName: 'David Schmidt',
    visitorCompany: 'Kelvion Holding GmbH (Bochum)',
    visitorType: 'PRODUCTION_VISITOR',
    purpose: 'Client Technical Review',
    hostName: 'Tariq Al-Mansoor',
    department: 'Engineering & Design',
    checkInTime: '2026-11-01T09:00:00Z',
    status: 'ON_SITE',
    ppeItemsLent: ['Safety glasses', 'Ear protection'],
    staffCheckInId: 'USR-002'
  },
  // Past completed visit for Michael Vance
  {
    id: 'VST-0003',
    visitorId: 'VIS-000102',
    visitorName: 'Michael Vance',
    visitorCompany: 'Apex Tube Inspection Services',
    visitorType: 'PRODUCTION_VISITOR',
    purpose: 'Equipment Maintenance / Calibration',
    hostName: 'Hassan Mahmoud',
    department: 'Heat Exchanger Assembly',
    checkInTime: '2026-10-25T08:30:00Z',
    checkOutTime: '2026-10-25T14:45:00Z',
    status: 'CHECKED_OUT',
    ppeItemsLent: ['Safety glasses'],
    staffCheckInId: 'USR-002',
    staffCheckOutId: 'USR-003'
  },
  // Auto-checked out visit
  {
    id: 'VST-0004',
    visitorId: 'VIS-000108',
    visitorName: 'Suresh Kumar',
    visitorCompany: 'Al-Attiyah Industrial Gas Solutions',
    visitorType: 'TRUCK_DRIVER',
    purpose: 'Finished Goods Pickup',
    hostName: 'Ibrahim Al-Mohannadi',
    department: 'Logistics & Warehouse',
    checkInTime: '2026-10-30T13:00:00Z',
    checkOutTime: '2026-10-30T23:59:00Z',
    status: 'AUTO_CHECKED_OUT',
    ppeItemsLent: [],
    staffCheckInId: 'USR-002'
  }
]

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-15T11:20:00Z',
    userId: 'USR-001',
    userName: 'Tariq Al-Mansoor',
    action: 'VISITOR_BLOCKED',
    resourceType: 'Visitor',
    resourceId: 'VIS-000104',
    details: 'Blocked visitor Rashid Al-Kuwari. Reason: Security alert: Disregarded workshop PPE & entered electrical sub-station.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-01T08:00:00Z',
    userId: 'USR-001',
    userName: 'Tariq Al-Mansoor',
    action: 'SETTINGS_UPDATE',
    resourceType: 'Settings',
    details: 'Updated induction validity period from 45 days to 30 days.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-09-01T10:00:00Z',
    userId: 'USR-001',
    userName: 'Tariq Al-Mansoor',
    action: 'VIDEO_ACTIVATED',
    resourceType: 'SafetyVideo',
    resourceId: 'VID-001',
    details: 'Activated video v2.1 (Kelvion Doha Comprehensive Safety Induction 2026); archived v1.4.'
  }
]

export const initialNotifications: AppNotification[] = [
  {
    id: 'NOTIF-001',
    timestamp: '2026-10-15T11:20:00Z',
    title: 'Visitor Blocked',
    message: 'Rashid Al-Kuwari (QID: 29263409988) was blocked for security violations.',
    type: 'ALERT',
    read: false,
    visitorId: 'VIS-000104'
  }
]

// LocalStorage helpers
function getFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(defaultVal))
      return defaultVal
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e)
    return defaultVal
  }
}

function setToStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val))
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e)
  }
}

// Master Database in-memory + synced to localStorage
export const db = {
  getUsers: () => getFromStorage<User[]>('users', initialUsers),
  setUsers: (users: User[]) => setToStorage('users', users),

  getVisitors: () => getFromStorage<Visitor[]>('visitors', initialVisitors),
  setVisitors: (visitors: Visitor[]) => setToStorage('visitors', visitors),

  getInductions: () => getFromStorage<Induction[]>('inductions', initialInductions),
  setInductions: (inductions: Induction[]) => setToStorage('inductions', inductions),

  getVisits: () => getFromStorage<Visit[]>('visits', initialVisits),
  setVisits: (visits: Visit[]) => setToStorage('visits', visits),

  getVideos: () => getFromStorage<SafetyVideo[]>('videos', initialVideos),
  setVideos: (videos: SafetyVideo[]) => setToStorage('videos', videos),

  getSettings: () => getFromStorage<KioskSettings>('settings', initialSettings),
  setSettings: (settings: KioskSettings) => setToStorage('settings', settings),

  getAuditLogs: () => getFromStorage<AuditLog[]>('audit_logs', initialAuditLogs),
  setAuditLogs: (logs: AuditLog[]) => setToStorage('audit_logs', logs),

  getNotifications: () => getFromStorage<AppNotification[]>('notifications', initialNotifications),
  setNotifications: (notes: AppNotification[]) => setToStorage('notifications', notes),

  // Reset database to initial seed state
  resetToInitial: () => {
    setToStorage('users', initialUsers)
    setToStorage('visitors', initialVisitors)
    setToStorage('inductions', initialInductions)
    setToStorage('visits', initialVisits)
    setToStorage('videos', initialVideos)
    setToStorage('settings', initialSettings)
    setToStorage('audit_logs', initialAuditLogs)
    setToStorage('notifications', initialNotifications)
  }
}

// Simulated Date helper: allows SuperAdmin to jump +10 days, +31 days, or reset
export function getSimulatedNow(): Date {
  const settings = db.getSettings()
  const offsetDays = settings.simulatedDateOffsetDays || 0
  const realNow = new Date()
  return new Date(realNow.getTime() + offsetDays * 24 * 60 * 60 * 1000)
}

// Core business logic: evaluate induction validity using dynamic settings and simulated date
export function evaluateInductionStatus(visitorId: string): InductionValidationResult {
  const inductions = db.getInductions()
  const settings = db.getSettings()
  const now = getSimulatedNow()

  // Find latest acknowledged induction for this visitor
  const acknowledged = inductions
    .filter(i => i.visitorId === visitorId && i.status === 'ACKNOWLEDGED' && i.acknowledgedAt)
    .sort((a, b) => new Date(b.acknowledgedAt!).getTime() - new Date(a.acknowledgedAt!).getTime())

  if (acknowledged.length === 0) {
    return {
      status: 'NONE',
      reason: 'No completed safety induction on record.'
    }
  }

  const latest = acknowledged[0]
  const ackTime = new Date(latest.acknowledgedAt!).getTime()
  const validityMs = (settings.validityDays || 30) * 24 * 60 * 60 * 1000
  const expiresAt = new Date(ackTime + validityMs)
  const msRemaining = expiresAt.getTime() - now.getTime()
  const daysLeft = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

  if (msRemaining <= 0) {
    return {
      status: 'EXPIRED',
      latestInduction: latest,
      expiresAt: expiresAt.toISOString(),
      daysLeft: 0,
      reason: `Safety induction expired on ${formatQatarDate(expiresAt)}`
    }
  }

  return {
    status: 'VALID',
    latestInduction: latest,
    expiresAt: expiresAt.toISOString(),
    daysLeft,
    reason: `Induction valid until ${formatQatarDate(expiresAt)} – ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
  }
}

// Date formatting helper in DD/MM/YYYY
export function formatQatarDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '--/--/----'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Time formatting helper in HH:mm
export function formatQatarTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '--:--'
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${mins}`
}

export function formatQatarDateTime(date: Date | string): string {
  return `${formatQatarDate(date)} ${formatQatarTime(date)}`
}
