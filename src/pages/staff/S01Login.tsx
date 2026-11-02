import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KelvionLogo } from '../../components/common/KelvionLogo'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, LogIn, User, Lock, AlertCircle, Sparkles } from 'lucide-react'

export const S01Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const user = await login(username, password)
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin')
      } else {
        navigate('/staff')
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Demo auto-fill helper
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError(null)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900/80 border border-slate-800 p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 pb-8 border-b border-slate-800/80">
          <KelvionLogo size="lg" />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Visitor Management Kiosk • Reception Access</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5 text-left">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-950/60 border border-red-500/40 p-4 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Username or Staff ID
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin or staff1"
                className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/80 pl-12 pr-4 py-4 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition kiosk-touch-target"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/80 pl-12 pr-4 py-4 text-base text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition kiosk-touch-target"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 px-6 text-base font-bold text-white shadow-xl shadow-cyan-600/30 disabled:opacity-50 transition transform active:scale-[0.99] kiosk-touch-target"
          >
            <LogIn className="h-5 w-5" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Kiosk'}</span>
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Quick Demo Credentials (Click to Fill):</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="fill-admin"
              onClick={() => handleQuickFill('admin', 'Admin@123')}
              className="p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-left transition"
            >
              <span className="block text-xs font-bold text-purple-300">SuperAdmin</span>
              <span className="block text-[10px] text-slate-400 font-mono">admin</span>
            </button>
            <button
              type="button"
              id="fill-staff1"
              onClick={() => handleQuickFill('staff1', 'Staff@123')}
              className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition"
            >
              <span className="block text-xs font-bold text-cyan-300">Staff 1</span>
              <span className="block text-[10px] text-slate-400 font-mono">staff1</span>
            </button>
            <button
              type="button"
              id="fill-staff2"
              onClick={() => handleQuickFill('staff2', 'Staff@123')}
              className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition"
            >
              <span className="block text-xs font-bold text-cyan-300">Staff 2</span>
              <span className="block text-[10px] text-slate-400 font-mono">staff2</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
