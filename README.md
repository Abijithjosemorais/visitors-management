# Kelvion Doha • Visitor Management & Safety Induction Kiosk (Phase 1)

Frontend web application for **Kelvion Thermal Solutions W.L.L. (Kelvion Doha), Qatar**.
Built with **React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack Query + React Hook Form + Zod**.

Designed as a landscape-first, tablet-optimized kiosk (min 56px touch targets, high contrast, industrial theme, English & Arabic bilingual support with `dir="auto"`). Features a typed in-memory mock API layer persisted to `localStorage` with realistic artificial latency (150–400ms), mirroring a future REST API.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at
http://localhost:5173/
```

To run a production build & typecheck:
```bash
npm run build
```

---

## 🔑 Seeded Demo Credentials

| Role | Username | Password | Kiosk Override PIN | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `Admin@123` | `1234` | Full access (Users, Videos, Settings, Reports, Audit, Kiosk) |
| **Reception Staff** | `staff1` | `Staff@123` | `1111` | Kiosk operations, onboarding, lookups, check-in/out |
| **Reception Staff** | `staff2` | `Staff@123` | `2222` | Kiosk operations, onboarding, lookups, check-in/out |

> **Quick Logins:** On the login screen ([S01](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S01Login.tsx)), click the quick fill buttons (**SuperAdmin**, **Staff 1**, **Staff 2**) to autofill credentials instantly.

---

## 👥 Seed Visitors for Testing

| Visitor Name | QID / ID | Category | Status & Scenario |
| :--- | :--- | :--- | :--- |
| **Ahmed Al-Sulaiti (أحمد السليطي)** | `29063401234` | Truck Driver | **VALID** (Induction acknowledged 10 days ago, 20 days left). Currently **ON SITE** |
| **Khalid Al-Hajri (خالد الهاجري)** | `28563405678` | Production Visitor | **EXPIRED** (Induction acknowledged 40 days ago). Requires induction video |
| **Rashid Al-Kuwari (راشد الكواري)** | `29263409988` | Truck Driver | **BLOCKED** (Disregarded workshop PPE). Entry denied alert |
| **Mohammed Salem (محمد سالم)** | `28863403322` | Production Visitor | **EXPIRED ID DOCUMENT** warning |
| **Michael Vance** | Passport `P8923412` | Production Visitor | **VALID** (5 days left) |
| **David Schmidt** | Passport `C1049281` | Production Visitor | Currently **ON SITE** (Open visit) |

---

## 🛠️ Dev-Only Demo Tools (SuperAdmin Floating Panel)

When logged in as `SUPER_ADMIN` (`admin`), a floating **Demo Tools** button appears in the bottom right corner:
- **Active Simulated Date Display:** Shows simulated Qatar time (`DD/MM/YYYY`).
- **`+10 Days` Button:** Simulates a returning visitor on Day 10 (induction remains **VALID**).
- **`+31 Days` Button:** Simulates returning after 30 days (induction becomes **EXPIRED**).
- **`Reset Date` Button:** Resets simulated time back to real-time.
- **`Reset All Mock Data` Button:** Re-seeds `localStorage` back to default seed records.
- **Quick-copy QIDs:** One-click copy for test QIDs.

---

## 📋 Walkthrough of Acceptance Scenarios

### Scenario 1: New Visitor Flow
1. Login as `staff1` / `Staff@123`.
2. On Staff Home ([S02](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S02StaffHome.tsx)), type unknown QID `29963409999` and click **Lookup**.
3. Alert shows **"Visitor Not Found"** with a **"Register New Visitor"** button. Click it.
4. Onboarding Step 1 ([S04](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S04_S05Onboarding.tsx)): QID is pre-filled. Click `+ Fill Sample Visitor` or type Name (English/Arabic), Company, and Mobile (`+974 55998877`).
5. Step 2 ([S05](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S04_S05Onboarding.tsx)): Select category (e.g. *Visitor to Production Areas*), select lent PPE (Safety shoes, glasses, ear protection), and tick **Consent (Qatar Law No. 13 of 2016)**.
6. Step 3 Review ([S06](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S06ReviewSave.tsx)): Click **"Save & Generate Visitor Pass"**. Visitor ID (e.g., `VIS-000116`), QR code, and printable badge are generated.
7. Click **"Hand Kiosk to Visitor"** to enter locked **Visitor Mode** ([S07](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/visitor/S07InductionStart.tsx)).
8. Visitor clicks **"Start Safety Video"** ([S08](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/visitor/S08VideoPlayer.tsx)). Video plays to 100%.
9. Visitor proceeds to Acknowledgement ([S09](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/visitor/S09Acknowledgement.tsx)), signs on-screen (or clicks `Sign Sample`), and clicks **"I Acknowledge & Agree"**.
10. Screen [S10](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/visitor/S10ClearedConfirmed.tsx) displays **"You Are Cleared to Visit until DD/MM/YYYY"** with confetti. Click **"Return Control to Staff"**.
11. On [S03](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S03VisitorSummary.tsx), click **"Log Visitor Entry"**. Entry logged with validity set 30 days ahead.

### Scenario 2: Skip Prevention & Video Guards
- In [S08 Video Player](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/visitor/S08VideoPlayer.tsx): Native player controls, context menus, right-clicks, and download/picture-in-picture are disabled.
- Arrow keys (`ArrowRight`, `PageDown`, etc.) are intercepted and blocked.
- Seeking is prevented with a **max watched time guard**: any manual jump forward instantly snaps playback back to the highest consecutive watched point.
- The **"Proceed to Acknowledgement"** button remains hidden and the acknowledgement button is disabled until 100% of the video duration is watched.

### Scenario 3: Return on Day 10 (Valid Induction)
1. Open **Demo Tools** and click **`+10 Days`**.
2. Look up `29063401234` (Ahmed Al-Sulaiti).
3. Status shows green badge: **"Induction Valid Until 21/11/2026 – 10 days left"**.
4. The **"Log Entry"** button is enabled directly without requiring a video re-watch.

### Scenario 4: Return after 30 Days (Simulated Day 31)
1. Open **Demo Tools** and click **`+31 Days`**.
2. Look up `29063401234`.
3. Status dynamically updates to red badge: **"Induction Expired on 21/11/2026"**.
4. **"Log Entry"** is disabled; staff clicks **"Start Induction"**.
5. Active video plays; after acknowledgement, validity resets 30 days ahead.

### Scenario 5: Video Library Version Management
1. Log in as `admin`. Go to **Safety Videos** ([S14](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/admin/S14VideoLibrary.tsx)).
2. Click **"Upload New Video"** (Title: *Kelvion Doha Comprehensive Safety Induction 2027*, Version: *v2.2*).
3. Click **"Activate"** on the newly added version.
4. Previous active video (`v2.1`) is automatically marked `ARCHIVED`.
5. Existing valid inductions remain valid. An expired visitor starting an induction will now watch and record version `v2.2`.

### Scenario 6: Duplicate ID Prevention
1. In Onboarding ([S04](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S04_S05Onboarding.tsx)), enter existing QID `29063401234`.
2. Inline alert immediately blocks submission: **"Duplicate ID Detected: This QID is already registered to Ahmed Al-Sulaiti (VIS-000101)"**.
3. Staff can click **"Open Existing Profile"** to navigate directly to their record.

### Scenario 7: Check-Out with PPE Verification
1. Click **"On site now"** or navigate to `/staff/on-site` ([S11](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/staff/S11OnSiteCheckOut.tsx)).
2. Click **"Log Check-Out"** for a visitor (e.g. David Schmidt).
3. Modal displays check-in time and checklist of lent PPE items for physical return verification.
4. Click **"Confirm Check-Out"**. Check-out time is recorded and visit is closed.

### Scenario 8: Dynamic Validity Setting
1. Log in as `admin`. Go to **Settings & Lists** ([S16](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/admin/S16SettingsLists.tsx)).
2. Change **Induction Validity** from `30` to `15` days and click **Save Settings**.
3. Immediately navigate back to staff lookup for a visitor acknowledged 18 days ago.
4. The visitor's status changes from VALID to **EXPIRED** because the business rule dynamically recalculates against current settings at lookup time.

### Scenario 9: Audit & CSV Reports
1. In Admin console, go to **Reports & Audit Log** ([S17](file:///c:/ajithproject/projects%20from%20ajith/reception/src/pages/admin/S17ReportsAudit.tsx)).
2. Tab **Training Participant List (Exhibit #48)**: Generates corporate training participant sheet (Topic, Venue, Date, Participant SR, Name, QID, Company, Video Version, Signature). Click **"Export Current Report to CSV"**.
3. Tab **Daily Visitors Log Sheet**: Generates daily reception log sheet (SL #, Name, Company, Mobile, Purpose, QID, Time In, Time Out, Signature). Click **"Export Current Report to CSV"**.

### Scenario 10: Role Route Guarding
1. Log in as staff user `staff1`.
2. Notice the navigation bar hides Admin Console, Users, Videos, Settings, and Reports.
3. Attempt to browse directly to `http://localhost:5173/admin/videos` or `http://localhost:5173/admin/settings`.
4. The `AdminRoute` guard intercepts the navigation and immediately redirects `staff1` back to `/staff`.

---

## 🗄️ Mock API Specification (`/src/api`)

The frontend interacts exclusively with typed mock API services in `/src/api/` that simulate a real backend REST API with artificial delay:

### 1. Auth (`/src/api/auth.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate staff/admin | `{ username, password }` | `User` object |
| `POST` | `/api/auth/logout` | Terminate session | None | `{ success: true }` |
| `POST` | `/api/auth/verify-pin` | Verify staff override PIN | `{ userId, pinOrPassword }` | `{ verified: boolean }` |

### 2. Visitors (`/src/api/visitors.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/visitors/search?q={query}` | Search by QID / Visitor ID / Passport | None | `VisitorWithStatus \| null` |
| `GET` | `/api/visitors` | List visitors with filters | Query: `type`, `status`, `search` | `VisitorWithStatus[]` |
| `GET` | `/api/visitors/:id` | Get visitor by ID | None | `VisitorWithStatus` |
| `POST` | `/api/visitors` | Register new visitor | `Omit<Visitor, 'id' \| 'createdAt'>` | `Visitor` (with generated `VIS-0001xx`) |
| `PATCH` | `/api/visitors/:id` | Update profile | `Partial<Visitor>` | `Visitor` |
| `POST` | `/api/visitors/:id/block` | Block visitor | `{ reason: string }` | `Visitor` |
| `POST` | `/api/visitors/:id/unblock` | Unblock visitor | `{ reason: string }` | `Visitor` |

### 3. Inductions (`/src/api/inductions.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/inductions/start` | Start safety induction | `{ visitorId, staffUserId, device }` | `Induction` (status `IN_PROGRESS`) |
| `PATCH` | `/api/inductions/:id/progress` | Update watched seconds | `{ watchedSeconds: number }` | `{ success: true }` |
| `POST` | `/api/inductions/:id/acknowledge` | Acknowledge & sign | `{ signature: base64 }` | `Induction` (status `ACKNOWLEDGED`) |
| `POST` | `/api/inductions/:id/cancel` | Staff cancellation override | `{ reason?: string }` | `Induction` (status `INCOMPLETE`) |

### 4. Visits (`/src/api/visits.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/visits/open` | Get visitors currently on site | None | `Visit[]` (status `ON_SITE`) |
| `GET` | `/api/visits` | List visits with filters | Query: `department`, `status` | `Visit[]` |
| `POST` | `/api/visits/check-in` | Log visitor entry | `{ visitorId, purpose, host, dept, ppe }` | `Visit` |
| `POST` | `/api/visits/:id/check-out` | Log visitor departure | `{ staffUserId, notes?: string }` | `Visit` (status `CHECKED_OUT`) |
| `POST` | `/api/visits/auto-checkout` | Run auto check-out | None | `{ closedCount: number }` |

### 5. Videos (`/src/api/videos.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/videos` | List safety video versions | None | `SafetyVideo[]` |
| `GET` | `/api/videos/active` | Get currently active video | None | `SafetyVideo` |
| `POST` | `/api/videos/upload` | Upload new video | `{ title, versionLabel, url, duration }` | `SafetyVideo` |
| `POST` | `/api/videos/:id/activate` | Activate version (archives prev) | None | `SafetyVideo` |

### 6. Settings (`/src/api/settings.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/settings` | Get system settings | None | `KioskSettings` |
| `PUT` | `/api/settings` | Update settings & lists | `Partial<KioskSettings>` | `KioskSettings` |
| `POST` | `/api/settings/offset` | Demo simulated date offset | `{ days: number }` | `KioskSettings` |
| `POST` | `/api/settings/reset` | Reset demo database | None | `{ success: true }` |

### 7. Users (`/src/api/users.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List staff accounts | None | `User[]` |
| `POST` | `/api/users` | Add staff user | `Omit<User, 'id' \| 'createdAt'>` | `User` |
| `PATCH` | `/api/users/:id` | Update profile | `Partial<User>` | `User` |
| `POST` | `/api/users/:id/toggle-status` | Activate/Deactivate | None | `User` |
| `POST` | `/api/users/:id/reset-password`| Reset password | `{ newPass: string }` | `{ success: true }` |

### 8. Reports & Audit (`/src/api/reports.ts`, `/src/api/audit.ts`)
| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard` | Dashboard KPI tiles | None | `{ onSiteNow, visitorsToday, ... }` |
| `GET` | `/api/reports/exhibit-48?date=` | Exhibit #48 training sheet | Query: `date` | `{ topic, venue, date, participants }` |
| `GET` | `/api/reports/daily-log?date=` | Daily visitor log sheet | Query: `date` | `{ date, rows }` |
| `GET` | `/api/audit` | Audit event logs | Query: `action`, `search` | `AuditLog[]` |

---

## 🏗️ Folder Structure

```
reception/
├── src/
│   ├── api/                   # Typed mock REST API layer (localStorage)
│   │   ├── auth.ts            # Staff authentication & PIN verification
│   │   ├── audit.ts           # Audit logging & event stream
│   │   ├── db.ts              # Database seeds, latency wrapper, dynamic rules
│   │   ├── inductions.ts      # Induction progress, 100% video guard, signatures
│   │   ├── notifications.ts   # In-app alerts (e.g., blocked visitor alerts)
│   │   ├── reports.ts         # Exhibit #48 and Daily Log generators
│   │   ├── settings.ts        # Dynamic validity, simulated time offset
│   │   ├── users.ts           # Staff user management & passwords
│   │   ├── videos.ts          # Video library upload, preview & activation
│   │   ├── visitors.ts        # Visitor directory, duplicates, block/unblock
│   │   └── visits.ts          # Entry logging, check-out, open visit roster
│   ├── components/
│   │   ├── common/            # KelvionLogo, PrintBadgeModal, CameraModal, DemoTools, Guards
│   │   └── layout/            # StaffHeader, AdminSidebar, VisitorLayout, Layouts
│   ├── context/               # AuthContext, VisitorModeContext, DemoToolsContext
│   ├── lib/                   # Utility helpers, CSV export, date formatters
│   ├── pages/
│   │   ├── admin/             # S12 Dashboard, S13 Directory, S14 Videos, S15 Users, S16 Settings, S17 Reports
│   │   ├── staff/             # S01 Login, S02 Home, S03 Summary, S04/S05 Onboarding, S06 Review, S11 Check-Out
│   │   └── visitor/           # S07 Welcome, S08 Video Player, S09 Acknowledgement, S10 Cleared
│   ├── types/                 # TypeScript interfaces for all resources
│   ├── App.tsx                # Central routing & providers
│   ├── index.css              # Industrial kiosk design system & print styles
│   └── main.tsx               # Application root
├── index.html                 # Google fonts (Inter, Outfit, Cairo for Arabic)
├── package.json
├── tsconfig.json
└── vite.config.ts
```
