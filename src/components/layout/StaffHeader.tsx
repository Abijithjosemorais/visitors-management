import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KelvionLogo } from '../common/KelvionLogo'
import { useAuth } from '../../context/AuthContext'
import { useDemoTools } from '../../context/DemoToolsContext'
import { useQuery } from '@tanstack/react-query'
import { visitsApi } from '../../api/visits'
import { notificationsApi } from '../../api/notifications'
import {
  Users,
  LogOut,
  Bell,
  Home,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react'

export const StaffHeader: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth()
  const { simulatedDate, offsetDays } = useDemoTools()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  // Live on-site count
  const { data: openVisits = [] } = useQuery({
    queryKey: ['openVisits'],
    queryFn: () => visitsApi.getOpenVisits(),
    refetchInterval: 5000
  })

  // Notifications
  const { data: notifications = [], refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    refetchInterval: 10000
  })

  const unreadNotifs = notifications.filter(n => !n.read)

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead()
    refetchNotifs()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo & Home */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/staff" className="flex items-center hover:opacity-90 transition">
            <KelvionLogo size="sm" />
          </Link>

          <Link
            to="/staff"
            id="nav-staff-home"
            className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm border border-slate-700/50"
          >
            <Home className="h-4 w-4 text-cyan-400" />
            <span>Staff Home</span>
          </Link>

          {/* On Site Now quick pill */}
          <Link
            to="/staff/on-site"
            id="nav-on-site"
            className="flex items-center gap-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-900/50 hover:border-emerald-400/50 transition shadow-inner"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Users className="h-4 w-4" />
            <span>
              On site now: <strong className="text-white ml-0.5">{openVisits.length}</strong>
            </span>
          </Link>
        </div>

        {/* Right: Date, Notifications, Admin Switch, User & Logout */}
        <div className="flex items-center gap-3">
          {/* Simulated Date badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700/60">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span>{simulatedDate}</span>
            {offsetDays !== 0 && (
              <span className="rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-1.5 py-0.2 text-[10px] font-bold">
                {offsetDays > 0 ? `+${offsetDays}d` : `${offsetDays}d`}
              </span>
            )}
          </div>

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl bg-slate-800/80 p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700/50"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md shadow-red-500/50 animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Dropdown menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-white text-sm">Notifications & Alerts</span>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 py-1">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition ${n.read ? 'opacity-70' : 'bg-slate-800/40 rounded-xl'}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'ALERT' ? (
                            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              {new Date(n.timestamp).toLocaleTimeString('en-GB')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Switcher for SuperAdmin */}
          {isSuperAdmin && (
            <Link
              to="/admin"
              id="nav-admin-console"
              className="hidden sm:flex items-center gap-2 rounded-xl bg-purple-900/40 border border-purple-500/40 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-800/50 hover:text-white transition"
            >
              <Shield className="h-3.5 w-3.5 text-purple-400" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700/50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-xs font-bold text-white uppercase">
              {user?.name.slice(0, 2) || 'ST'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">{user?.name}</span>
              <span className="text-[10px] text-cyan-400 font-medium">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Reception Staff'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            id="nav-logout"
            className="rounded-xl bg-slate-800/80 p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition border border-slate-700/50"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
