import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { visitorsApi } from '../../api/visitors'
import { visitsApi } from '../../api/visits'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  UserPlus,
  Users,
  LogOut,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react'

export const S02StaffHome: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [searchedTerm, setSearchedTerm] = useState('')
  const navigate = useNavigate()

  // On site now count
  const { data: openVisits = [] } = useQuery({
    queryKey: ['openVisits'],
    queryFn: () => visitsApi.getOpenVisits()
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = searchQuery.trim()
    if (!clean) return

    setIsSearching(true)
    setNotFound(false)
    setSearchedTerm(clean)

    try {
      const match = await visitorsApi.search(clean)
      if (match) {
        navigate(`/staff/visitor/${match.id}`)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('Search error:', err)
      setNotFound(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRegisterNew = () => {
    // Passes the searched QID or Passport into onboarding state
    navigate('/staff/onboarding', { state: { prefilledId: searchedTerm } })
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col justify-center space-y-8 animate-in fade-in">
      {/* Top Banner & Fast Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* On Site Now Tile */}
        <div
          onClick={() => navigate('/staff/on-site')}
          id="tile-on-site-now"
          className="cursor-pointer group rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-6 shadow-xl hover:border-emerald-400/60 transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Active Facility Presence
            </span>
            <h3 className="text-3xl font-extrabold text-white">
              {openVisits.length}{' '}
              <span className="text-base font-medium text-slate-400">On Site Now</span>
            </h3>
            <p className="text-xs text-slate-400">Tap to view live roster & check out</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition">
            <Users className="h-7 w-7" />
          </div>
        </div>

        {/* Quick Check-Out Button */}
        <div
          onClick={() => navigate('/staff/on-site')}
          id="home-checkout-btn"
          className="cursor-pointer group rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/70 p-6 shadow-xl hover:border-cyan-500/50 transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Visitor Departure
            </span>
            <h3 className="text-2xl font-bold text-white">Log Check-Out</h3>
            <p className="text-xs text-slate-400">Return PPE & record exit timestamps</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition">
            <LogOut className="h-7 w-7" />
          </div>
        </div>

        {/* New Visitor Button */}
        <div
          onClick={() => navigate('/staff/onboarding')}
          id="home-new-visitor-btn"
          className="cursor-pointer group rounded-3xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-blue-950/50 border border-cyan-500/40 p-6 shadow-xl hover:border-cyan-400 transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              First Time Guest
            </span>
            <h3 className="text-2xl font-bold text-white">New Visitor</h3>
            <p className="text-xs text-slate-400">Register profile & mandatory PPE</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition">
            <UserPlus className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Hero Big Search Box */}
      <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            Kiosk Visitor Lookup
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Look up Visitor Profile
          </h2>
          <p className="text-sm text-slate-400">
            Enter 11-digit Qatar ID (QID), Visitor ID (e.g. VIS-000101), or Passport Number
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-6 h-7 w-7 text-cyan-400" />
            <input
              id="visitor-search-input"
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                if (notFound) setNotFound(false)
              }}
              placeholder="Enter QID or Visitor ID (e.g. 29063401234 or VIS-000101)..."
              className="w-full rounded-3xl bg-slate-800/90 border-2 border-slate-700/80 pl-18 pr-44 py-6 text-xl md:text-2xl font-medium text-white placeholder:text-base md:placeholder:text-lg placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 shadow-inner transition kiosk-touch-target"
            />
            <button
              type="submit"
              id="visitor-search-submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-cyan-600/30 disabled:opacity-40 transition active:scale-95 kiosk-touch-target"
            >
              <span>{isSearching ? 'Searching...' : 'Lookup'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Not Found Alert */}
        {notFound && (
          <div className="max-w-xl mx-auto rounded-2xl bg-amber-950/40 border border-amber-500/40 p-5 text-left flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-base">Visitor Not Found</h4>
                <p className="text-xs text-amber-200 mt-0.5">
                  No record matches "<strong className="text-white">{searchedTerm}</strong>". This visitor may need to be registered.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="not-found-register-btn"
              onClick={handleRegisterNew}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register New Visitor</span>
            </button>
          </div>
        )}

        {/* Quick Test Helper shortcuts */}
        <div className="max-w-2xl mx-auto pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Quick Try:
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('29063401234')}
            className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 font-mono transition"
          >
            29063401234 (Ahmed - Valid)
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('28563405678')}
            className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:text-amber-300 hover:bg-slate-700 font-mono transition"
          >
            28563405678 (Khalid - Expired)
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('29263409988')}
            className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:text-red-300 hover:bg-slate-700 font-mono transition"
          >
            29263409988 (Rashid - Blocked)
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('P8923412')}
            className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 font-mono transition"
          >
            P8923412 (Passport)
          </button>
        </div>
      </div>
    </div>
  )
}
