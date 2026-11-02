import React from 'react'
import { useNavigate } from 'react-router-dom'
import { reportsApi } from '../../api/reports'
import { useQuery } from '@tanstack/react-query'
import { formatQatarTime, formatQatarDate } from '../../api/db'
import {
  Users,
  UserCheck,
  ShieldAlert,
  Clock,
  UserPlus,
  PlayCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react'

export const S12AdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => reportsApi.getDashboardStats(),
    refetchInterval: 8000
  })

  if (isLoading || !stats) {
    return <div className="p-8 text-center text-slate-400">Loading admin metrics...</div>
  }

  const statCards = [
    {
      label: 'On Site Now',
      val: stats.onSiteNow,
      sub: 'Currently on premises',
      icon: Users,
      color: 'emerald',
      action: () => navigate('/staff/on-site')
    },
    {
      label: 'Visitors Today',
      val: stats.visitorsToday,
      sub: 'Entries logged today',
      icon: Clock,
      color: 'cyan',
      action: () => navigate('/admin/reports')
    },
    {
      label: 'New Registrations',
      val: stats.newRegToday,
      sub: 'New profiles registered today',
      icon: UserPlus,
      color: 'blue',
      action: () => navigate('/admin/visitors')
    },
    {
      label: 'Inductions Completed',
      val: stats.inductionsToday,
      sub: 'Passed and acknowledged today',
      icon: ShieldCheck,
      color: 'purple',
      action: () => navigate('/admin/reports')
    },
    {
      label: 'Expiring in 7 Days',
      val: stats.expiringSoon,
      sub: 'Inductions near renewal threshold',
      icon: AlertTriangle,
      color: 'amber',
      action: () => navigate('/admin/visitors?status=EXPIRED')
    }
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 text-left animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            Executive Site Overview
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Kelvion Doha Visitor Operations Dashboard
          </h2>
        </div>

        <button
          onClick={() => navigate('/staff')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
        >
          <span>Open Reception Kiosk Mode</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Metrics 5-Tile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(c => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              onClick={c.action}
              className="cursor-pointer group rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {c.label}
                </span>
                <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-black text-white">{c.val}</span>
                <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Visits & Operational Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Visits Table (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Recent Visitor Movements</span>
            </h3>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-xs text-cyan-400 hover:underline"
            >
              View Full Visit Log →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Visitor Name</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3">Time In</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentVisits.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-semibold text-white" dir="auto">
                      {v.visitorName}
                    </td>
                    <td className="py-3 text-slate-300">{v.visitorCompany}</td>
                    <td className="py-3 text-slate-400">{v.purpose}</td>
                    <td className="py-3 font-mono text-cyan-300">
                      {formatQatarTime(v.checkInTime)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'ON_SITE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fast Action Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Admin Quick Management</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/admin/videos')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition"
              >
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-5 w-5 text-cyan-400" />
                  <span>Update Safety Video Version</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                  <span>Adjust Validity Days & PPE</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-emerald-400" />
                  <span>Export Exhibit #48 Training List</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
