import React, { useState } from 'react'
import { visitsApi } from '../../api/visits'
import { inductionsApi } from '../../api/inductions'
import { auditApi } from '../../api/audit'
import { reportsApi } from '../../api/reports'
import { visitorsApi } from '../../api/visitors'
import { useQuery } from '@tanstack/react-query'
import { formatQatarDate, formatQatarTime, formatQatarDateTime } from '../../api/db'
import { exportToCSV } from '../../lib/utils'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Shield,
  Clock,
  Printer,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

export const S17ReportsAudit: React.FC = () => {
  const [tab, setTab] = useState<'VISITS' | 'INDUCTIONS' | 'AUDIT' | 'EXHIBIT_48' | 'DAILY_LOG'>('VISITS')

  // Date filters
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Data queries
  const { data: visits = [] } = useQuery({
    queryKey: ['visits', deptFilter, statusFilter],
    queryFn: () => visitsApi.getAllVisits({ department: deptFilter, status: statusFilter })
  })

  const { data: inductions = [] } = useQuery({
    queryKey: ['inductions'],
    queryFn: () => inductionsApi.getAll()
  })

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => auditApi.getAuditLogs()
  })

  const { data: exhibit48Data } = useQuery({
    queryKey: ['exhibit48', selectedDate],
    queryFn: () => reportsApi.getExhibit48TrainingList(selectedDate)
  })

  const { data: dailyLogData } = useQuery({
    queryKey: ['dailyLog', selectedDate],
    queryFn: () => reportsApi.getDailyVisitorsLogSheet(selectedDate)
  })

  // Export CSV Handlers
  const handleExportVisitsCSV = () => {
    const headers = ['Visit ID', 'Visitor ID', 'Name', 'Company', 'Category', 'Purpose', 'Host', 'Department', 'Check-In', 'Check-Out', 'Status']
    const rows = visits.map(v => [
      v.id,
      v.visitorId,
      v.visitorName,
      v.visitorCompany,
      v.visitorType,
      v.purpose,
      v.hostName || '',
      v.department || '',
      v.checkInTime,
      v.checkOutTime || '',
      v.status
    ])
    exportToCSV(`Kelvion_Visits_Report_${new Date().toISOString().slice(0, 10)}`, headers, rows)
  }

  const handleExportInductionsCSV = () => {
    const headers = ['Induction ID', 'Visitor ID', 'Video Version', 'Started At', 'Completed At', 'Watched Sec', 'Total Sec', 'Status', 'Expires At']
    const rows = inductions.map(i => [
      i.id,
      i.visitorId,
      i.videoVersion,
      i.startedAt,
      i.completedAt || '',
      i.watchedSeconds,
      i.totalSeconds,
      i.status,
      i.expiresAt || ''
    ])
    exportToCSV(`Kelvion_Inductions_Report_${new Date().toISOString().slice(0, 10)}`, headers, rows)
  }

  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Details']
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      l.userName,
      l.action,
      l.resourceType,
      l.resourceId || '',
      l.details
    ])
    exportToCSV(`Kelvion_Audit_Log_${new Date().toISOString().slice(0, 10)}`, headers, rows)
  }

  const handleExportExhibit48CSV = () => {
    if (!exhibit48Data) return
    const headers = ['SR', 'Topic', 'Venue', 'Date', 'Name', 'QID/ID', 'Company', 'Department', 'Video Faculty Version', 'Time', 'Signature Status', 'Remark']
    const rows = exhibit48Data.participants.map(p => [
      p.sr,
      exhibit48Data.topic,
      exhibit48Data.venue,
      exhibit48Data.date,
      p.name,
      p.qid,
      p.company,
      p.department,
      p.videoVersion,
      p.time,
      p.signature ? 'Signed (Digital)' : 'None',
      p.remark
    ])
    exportToCSV(`Exhibit_48_Training_Participant_List_${selectedDate}`, headers, rows)
  }

  const handleExportDailyLogCSV = () => {
    if (!dailyLogData) return
    const headers = ['SL #', 'Date', 'Name', 'Company', 'Mobile No.', 'Purpose', 'Host', 'QID', 'Time In', 'Time Out', 'Signature Status', 'Status']
    const rows = dailyLogData.rows.map(r => [
      r.sl,
      dailyLogData.date,
      r.name,
      r.company,
      r.mobile,
      r.purpose,
      r.host,
      r.qid,
      r.timeIn,
      r.timeOut,
      r.signature ? 'Signed (Digital)' : 'None',
      r.status
    ])
    exportToCSV(`Daily_Visitors_Log_Sheet_${selectedDate}`, headers, rows)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            Compliance, HSE Audit & Legal Reports
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Reports & Comprehensive Audit Trail
          </h2>
        </div>

        {/* Global CSV Download for active tab */}
        <button
          type="button"
          onClick={() => {
            if (tab === 'VISITS') handleExportVisitsCSV()
            else if (tab === 'INDUCTIONS') handleExportInductionsCSV()
            else if (tab === 'AUDIT') handleExportAuditCSV()
            else if (tab === 'EXHIBIT_48') handleExportExhibit48CSV()
            else if (tab === 'DAILY_LOG') handleExportDailyLogCSV()
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export Current Report to CSV</span>
        </button>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 gap-2">
        <button
          onClick={() => setTab('VISITS')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'VISITS' ? 'border-cyan-400 text-cyan-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Visit Log
        </button>
        <button
          onClick={() => setTab('INDUCTIONS')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'INDUCTIONS' ? 'border-cyan-400 text-cyan-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Induction Log (incl. Incomplete)
        </button>
        <button
          onClick={() => setTab('EXHIBIT_48')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'EXHIBIT_48' ? 'border-cyan-400 text-cyan-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Training Participant List (Exhibit #48)
        </button>
        <button
          onClick={() => setTab('DAILY_LOG')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'DAILY_LOG' ? 'border-cyan-400 text-cyan-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Daily Visitors Log Sheet
        </button>
        <button
          onClick={() => setTab('AUDIT')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'AUDIT' ? 'border-cyan-400 text-cyan-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          System Audit Trail
        </button>
      </div>

      {/* Date Filter Bar for Exhibit #48 and Daily Log */}
      {(tab === 'EXHIBIT_48' || tab === 'DAILY_LOG') && (
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 border border-slate-800 p-3 text-xs">
          <Calendar className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Select Date for Sheet Generation:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>
      )}

      {/* 1. VISIT LOG TAB */}
      {tab === 'VISITS' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Visitor</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Host / Dept</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visits.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white" dir="auto">{v.visitorName}</td>
                    <td className="py-3 px-4 text-slate-300">{v.visitorCompany}</td>
                    <td className="py-3 px-4 text-slate-300">{v.purpose}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {v.hostName} ({v.department})
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{formatQatarDateTime(v.checkInTime)}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {v.checkOutTime ? formatQatarTime(v.checkOutTime) : '--:--'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INDUCTION LOG TAB */}
      {tab === 'INDUCTIONS' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Induction ID</th>
                  <th className="py-3 px-4">Visitor ID</th>
                  <th className="py-3 px-4">Video Version</th>
                  <th className="py-3 px-4">Started At</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Validity Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inductions.map(ind => (
                  <tr key={ind.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-cyan-400">{ind.id}</td>
                    <td className="py-3 px-4 font-mono text-white">{ind.visitorId}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{ind.videoVersion}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{formatQatarDateTime(ind.startedAt)}</td>
                    <td className="py-3 px-4 text-slate-300">{ind.watchedSeconds}s / {ind.totalSeconds}s</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ind.status === 'ACKNOWLEDGED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : ind.status === 'INCOMPLETE'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {ind.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {ind.expiresAt ? formatQatarDate(ind.expiresAt) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. EXHIBIT #48 TRAINING PARTICIPANT LIST */}
      {tab === 'EXHIBIT_48' && exhibit48Data && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-md space-y-4">
            <div className="border-b-2 border-slate-900 pb-3 flex flex-wrap justify-between items-center text-xs">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  KELVION THERMAL SOLUTIONS W.L.L. (DOHA)
                </h3>
                <span className="font-bold text-slate-700">
                  TRAINING PARTICIPANT LIST (EXHIBIT #48)
                </span>
              </div>
              <div className="text-right space-y-0.5 text-[11px] text-slate-700">
                <p><strong>Topic:</strong> {exhibit48Data.topic}</p>
                <p><strong>Venue:</strong> {exhibit48Data.venue}</p>
                <p><strong>Date:</strong> {exhibit48Data.date}</p>
              </div>
            </div>

            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="p-2">SR #</th>
                  <th className="p-2">Participant Name</th>
                  <th className="p-2">QID / ID No.</th>
                  <th className="p-2">Company / Department</th>
                  <th className="p-2">Faculty Version</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Signature</th>
                  <th className="p-2">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exhibit48Data.participants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No participants completed induction on this date ({exhibit48Data.date}).
                    </td>
                  </tr>
                ) : (
                  exhibit48Data.participants.map(p => (
                    <tr key={p.sr}>
                      <td className="p-2 font-bold">{p.sr}</td>
                      <td className="p-2 font-bold" dir="auto">{p.name}</td>
                      <td className="p-2 font-mono">{p.qid}</td>
                      <td className="p-2">{p.company} ({p.department})</td>
                      <td className="p-2 font-mono">{p.videoVersion}</td>
                      <td className="p-2 font-mono">{p.time}</td>
                      <td className="p-2">
                        {p.signature ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                            Digitally Signed
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="p-2 text-emerald-700 font-semibold">{p.remark}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DAILY VISITORS LOG SHEET */}
      {tab === 'DAILY_LOG' && dailyLogData && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-md space-y-4">
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center text-xs">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  KELVION DOHA – DAILY VISITORS LOG SHEET
                </h3>
                <span className="font-bold text-slate-700">Date: {dailyLogData.date}</span>
              </div>
            </div>

            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="p-2">SL #</th>
                  <th className="p-2">Visitor Name</th>
                  <th className="p-2">Company</th>
                  <th className="p-2">Mobile No.</th>
                  <th className="p-2">Purpose</th>
                  <th className="p-2">QID</th>
                  <th className="p-2">Time In</th>
                  <th className="p-2">Time Out</th>
                  <th className="p-2">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dailyLogData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      No visits logged on {dailyLogData.date}.
                    </td>
                  </tr>
                ) : (
                  dailyLogData.rows.map(r => (
                    <tr key={r.sl}>
                      <td className="p-2 font-bold">{r.sl}</td>
                      <td className="p-2 font-bold" dir="auto">{r.name}</td>
                      <td className="p-2">{r.company}</td>
                      <td className="p-2 font-mono">{r.mobile}</td>
                      <td className="p-2">{r.purpose}</td>
                      <td className="p-2 font-mono">{r.qid}</td>
                      <td className="p-2 font-mono text-cyan-800 font-bold">{r.timeIn}</td>
                      <td className="p-2 font-mono">{r.timeOut}</td>
                      <td className="p-2">
                        {r.signature ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                            Digitally Signed
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. AUDIT TRAIL TAB */}
      {tab === 'AUDIT' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatQatarDateTime(l.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{l.userName}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-cyan-400 font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{l.resourceType}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
