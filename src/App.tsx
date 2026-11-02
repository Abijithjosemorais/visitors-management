import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { DemoToolsProvider } from './context/DemoToolsContext'
import { VisitorModeProvider } from './context/VisitorModeContext'
import { ProtectedRoute, AdminRoute } from './components/common/RouteGuards'

// Layouts
import { StaffLayout } from './components/layout/StaffLayout'
import { VisitorLayout } from './components/layout/VisitorLayout'
import { AdminLayout } from './components/layout/AdminLayout'

// Screens
import { S01Login } from './pages/staff/S01Login'
import { S02StaffHome } from './pages/staff/S02StaffHome'
import { S03VisitorSummary } from './pages/staff/S03VisitorSummary'
import { S04_S05Onboarding } from './pages/staff/S04_S05Onboarding'
import { S06ReviewSave } from './pages/staff/S06ReviewSave'
import { S11OnSiteCheckOut } from './pages/staff/S11OnSiteCheckOut'

import { S07InductionStart } from './pages/visitor/S07InductionStart'
import { S08VideoPlayer } from './pages/visitor/S08VideoPlayer'
import { S09Acknowledgement } from './pages/visitor/S09Acknowledgement'
import { S10ClearedConfirmed } from './pages/visitor/S10ClearedConfirmed'

import { S12AdminDashboard } from './pages/admin/S12AdminDashboard'
import { S13VisitorDirectory } from './pages/admin/S13VisitorDirectory'
import { S14VideoLibrary } from './pages/admin/S14VideoLibrary'
import { S15StaffUsers } from './pages/admin/S15StaffUsers'
import { S16SettingsLists } from './pages/admin/S16SettingsLists'
import { S17ReportsAudit } from './pages/admin/S17ReportsAudit'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false
    }
  }
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DemoToolsProvider>
            <VisitorModeProvider>
              <Routes>
                {/* S01 Login */}
                <Route path="/login" element={<S01Login />} />

                {/* Staff Flow */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute>
                      <StaffLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<S02StaffHome />} />
                  <Route path="visitor/:id" element={<S03VisitorSummary />} />
                  <Route path="onboarding" element={<S04_S05Onboarding />} />
                  <Route path="review" element={<S06ReviewSave />} />
                  <Route path="on-site" element={<S11OnSiteCheckOut />} />
                </Route>

                {/* Visitor Mode Flow (Locked Kiosk) */}
                <Route
                  path="/visitor"
                  element={
                    <ProtectedRoute>
                      <VisitorLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="welcome" element={<S07InductionStart />} />
                  <Route path="video" element={<S08VideoPlayer />} />
                  <Route path="acknowledge" element={<S09Acknowledgement />} />
                  <Route path="cleared" element={<S10ClearedConfirmed />} />
                </Route>

                {/* SuperAdmin Console (Route Guarded for SUPER_ADMIN only) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<S12AdminDashboard />} />
                  <Route path="visitors" element={<S13VisitorDirectory />} />
                  <Route path="videos" element={<S14VideoLibrary />} />
                  <Route path="users" element={<S15StaffUsers />} />
                  <Route path="settings" element={<S16SettingsLists />} />
                  <Route path="reports" element={<S17ReportsAudit />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </VisitorModeProvider>
          </DemoToolsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
