import React, { useState, useEffect } from 'react'
import { settingsApi } from '../../api/settings'
import { useAuth } from '../../context/AuthContext'
import { KioskSettings, VisitorTypeConfig } from '../../types'
import {
  Sliders,
  Save,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'

export const S16SettingsLists: React.FC = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<KioskSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Active sub-tab
  const [tab, setTab] = useState<'GENERAL' | 'PPE_TYPES' | 'LISTS'>('GENERAL')

  // New list item inputs
  const [newDepartment, setNewDepartment] = useState('')
  const [newPurpose, setNewPurpose] = useState('')
  const [newIdType, setNewIdType] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const data = await settingsApi.getSettings()
    setSettings(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!settings || !user) return
    setSaving(true)
    setNotice(null)
    try {
      await settingsApi.updateSettings(settings, user.name)
      setNotice('Settings saved successfully. Changes take effect on the next lookup immediately.')
      setTimeout(() => setNotice(null), 4000)
    } catch (err: any) {
      alert(`Save error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // List modification helpers
  const addItemToList = (key: 'departments' | 'purposes' | 'idTypes', value: string) => {
    if (!settings || !value.trim()) return
    if (settings[key].includes(value.trim())) return

    setSettings({
      ...settings,
      [key]: [...settings[key], value.trim()]
    })
  }

  const removeItemFromList = (key: 'departments' | 'purposes' | 'idTypes', index: number) => {
    if (!settings) return
    const updated = [...settings[key]]
    updated.splice(index, 1)
    setSettings({ ...settings, [key]: updated })
  }

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>
  }

  return (
    <div className="p-6 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            Kiosk Configuration & Policy Engine
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            System Settings & Master Lists
          </h2>
        </div>

        <button
          type="button"
          id="save-settings-btn"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/50 p-4 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setTab('GENERAL')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition ${
            tab === 'GENERAL'
              ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          General Safety Policies
        </button>
        <button
          onClick={() => setTab('PPE_TYPES')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition ${
            tab === 'PPE_TYPES'
              ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Visitor Categories & PPE
        </button>
        <button
          onClick={() => setTab('LISTS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition ${
            tab === 'LISTS'
              ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Master Lists & Dropdowns
        </button>
      </div>

      {/* TAB 1: GENERAL SAFETY POLICIES */}
      {tab === 'GENERAL' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Validity Days */}
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Induction Validity (Days) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-validity-days"
                  type="number"
                  min={1}
                  max={365}
                  value={settings.validityDays}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      validityDays: parseInt(e.target.value, 10) || 30
                    })
                  }
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xl font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400 font-semibold shrink-0">Days</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Standard: 30 days. Changing this updates visitor status dynamically on next lookup.
              </p>
            </div>

            {/* Auto Checkout Time */}
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Auto Check-Out Time *
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-auto-checkout"
                  type="time"
                  value={settings.autoCheckoutTime}
                  onChange={e =>
                    setSettings({ ...settings, autoCheckoutTime: e.target.value })
                  }
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xl font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Daily time when open visits are automatically closed. Default: 23:59.
              </p>
            </div>

            {/* Minimum Age */}
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Minimum Visitor Age
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={14}
                  max={25}
                  value={settings.minVisitorAge}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      minVisitorAge: parseInt(e.target.value, 10) || 18
                    })
                  }
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xl font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400 font-semibold shrink-0">Years</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Qatar industrial safety regulation requirement (18+).
              </p>
            </div>
          </div>

          {/* Legal Declaration Text */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Safety Induction Declaration Agreement (Screen S09)
            </label>
            <textarea
              id="settings-declaration-text"
              rows={3}
              value={settings.declarationText}
              onChange={e => setSettings({ ...settings, declarationText: e.target.value })}
              className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-4 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              This exact declaration text is displayed to every visitor during the digital signature step.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: VISITOR CATEGORIES & PPE */}
      {tab === 'PPE_TYPES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {settings.visitorTypes.map((vt, vtIdx) => (
            <div
              key={vt.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-base text-white">{vt.name}</h4>
                <span className="font-mono text-xs text-cyan-400">{vt.id}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={vt.description || ''}
                  onChange={e => {
                    const copy = [...settings.visitorTypes]
                    copy[vtIdx].description = e.target.value
                    setSettings({ ...settings, visitorTypes: copy })
                  }}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Mandatory PPE Checklist
                </label>
                <div className="flex flex-wrap gap-2">
                  {vt.defaultPpe.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-200"
                    >
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MASTER LISTS & DROPDOWNS */}
      {tab === 'LISTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          {/* Departments */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-white">Kelvion Doha Departments</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New department..."
                value={newDepartment}
                onChange={e => setNewDepartment(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  addItemToList('departments', newDepartment)
                  setNewDepartment('')
                }}
                className="rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shrink-0 hover:bg-cyan-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              {settings.departments.map((dept, i) => (
                <li key={i} className="flex items-center justify-between py-1.5 text-xs text-slate-300">
                  <span>{dept}</span>
                  <button
                    onClick={() => removeItemFromList('departments', i)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Purposes */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-white">Visit Purposes</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New purpose..."
                value={newPurpose}
                onChange={e => setNewPurpose(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  addItemToList('purposes', newPurpose)
                  setNewPurpose('')
                }}
                className="rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shrink-0 hover:bg-cyan-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              {settings.purposes.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-1.5 text-xs text-slate-300">
                  <span>{p}</span>
                  <button
                    onClick={() => removeItemFromList('purposes', i)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ID Types */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-white">Allowed ID Document Types</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New ID type..."
                value={newIdType}
                onChange={e => setNewIdType(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  addItemToList('idTypes', newIdType)
                  setNewIdType('')
                }}
                className="rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shrink-0 hover:bg-cyan-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              {settings.idTypes.map((t, i) => (
                <li key={i} className="flex items-center justify-between py-1.5 text-xs text-slate-300">
                  <span>{t}</span>
                  <button
                    onClick={() => removeItemFromList('idTypes', i)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
