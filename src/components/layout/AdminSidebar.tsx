import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { KelvionLogo } from '../common/KelvionLogo'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Users2,
  Video,
  UserCheck,
  Sliders,
  FileText,
  MonitorCheck,
  LogOut
} from 'lucide-react'

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Visitor Directory', to: '/admin/visitors', icon: Users2 },
    { name: 'Safety Videos', to: '/admin/videos', icon: Video },
    { name: 'Staff Users', to: '/admin/users', icon: UserCheck },
    { name: 'Settings & Lists', to: '/admin/settings', icon: Sliders },
    { name: 'Reports & Audit Log', to: '/admin/reports', icon: FileText }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Logo */}
        <div className="px-2 pt-2 pb-1">
          <KelvionLogo size="sm" />
          <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-md inline-block">
            Admin Management Console
          </div>
        </div>

        {/* Quick Kiosk Switcher */}
        <div className="px-2">
          <NavLink
            to="/staff"
            id="admin-to-kiosk-btn"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 transition"
          >
            <MonitorCheck className="h-4 w-4" />
            <span>Launch Staff Kiosk</span>
          </NavLink>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 px-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* User profile & sign out */}
      <div className="border-t border-slate-800/80 pt-4 px-2 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs uppercase">
            {user?.name.slice(0, 2) || 'AD'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-purple-400 truncate">Super Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
