import React, { useState } from 'react'
import { usersApi } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, UserRole } from '../../types'
import { formatQatarDate } from '../../api/db'
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  Shield,
  KeyRound,
  Edit,
  Power,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export const S15StaffUsers: React.FC = () => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [modalUser, setModalUser] = useState<{
    isOpen: boolean
    mode: 'ADD' | 'EDIT'
    id?: string
    name: string
    username: string
    email: string
    mobile: string
    role: UserRole
    pin: string
    error: string | null
  }>({
    isOpen: false,
    mode: 'ADD',
    name: '',
    username: '',
    email: '',
    mobile: '+974 ',
    role: 'STAFF',
    pin: '1234',
    error: null
  })

  const [resetPassModal, setResetPassModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
    newPass: string
    success: boolean
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    newPass: '',
    success: false
  })

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers()
  })

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      return usersApi.toggleStatus(id, currentUser?.name || 'Admin')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to update user status.')
    }
  })

  // Save/Create user
  const handleSaveUser = async () => {
    if (!modalUser.name.trim() || !modalUser.username.trim()) {
      setModalUser(prev => ({ ...prev, error: 'Name and Username are required.' }))
      return
    }

    try {
      if (modalUser.mode === 'ADD') {
        await usersApi.createUser(
          {
            name: modalUser.name.trim(),
            username: modalUser.username.trim(),
            email: modalUser.email.trim(),
            mobile: modalUser.mobile.trim(),
            role: modalUser.role,
            status: 'ACTIVE',
            pin: modalUser.pin || '1234'
          },
          currentUser?.name || 'Admin'
        )
      } else if (modalUser.id) {
        await usersApi.updateUser(
          modalUser.id,
          {
            name: modalUser.name.trim(),
            username: modalUser.username.trim(),
            email: modalUser.email.trim(),
            mobile: modalUser.mobile.trim(),
            role: modalUser.role,
            pin: modalUser.pin
          },
          currentUser?.name || 'Admin'
        )
      }

      setModalUser(prev => ({ ...prev, isOpen: false }))
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) {
      setModalUser(prev => ({ ...prev, error: err.message || 'Operation failed' }))
    }
  }

  const handleConfirmResetPass = async () => {
    if (!resetPassModal.newPass) return
    await usersApi.resetPassword(
      resetPassModal.userId,
      resetPassModal.newPass,
      currentUser?.name || 'Admin'
    )
    setResetPassModal(prev => ({ ...prev, success: true }))
    setTimeout(() => {
      setResetPassModal({ isOpen: false, userId: '', userName: '', newPass: '', success: false })
    }, 1200)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            Access Control & Staff Accounts
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Staff Users & Authorization
          </h2>
        </div>

        <button
          type="button"
          id="add-staff-btn"
          onClick={() =>
            setModalUser({
              isOpen: true,
              mode: 'ADD',
              name: '',
              username: '',
              email: '',
              mobile: '+974 ',
              role: 'STAFF',
              pin: '1111',
              error: null
            })
          }
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Staff User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Kiosk Override PIN</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map(u => {
                  const isCurrentUser = currentUser?.id === u.id
                  const isActive = u.status === 'ACTIVE'

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 uppercase">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{u.username}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span>{u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{u.mobile}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{u.pin || '1234'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* Edit */}
                        <button
                          onClick={() =>
                            setModalUser({
                              isOpen: true,
                              mode: 'EDIT',
                              id: u.id,
                              name: u.name,
                              username: u.username,
                              email: u.email,
                              mobile: u.mobile,
                              role: u.role,
                              pin: u.pin || '1234',
                              error: null
                            })
                          }
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 p-1.5 text-slate-300 hover:text-white transition"
                          title="Edit Profile"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() =>
                            setResetPassModal({
                              isOpen: true,
                              userId: u.id,
                              userName: u.name,
                              newPass: 'Staff@123',
                              success: false
                            })
                          }
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 p-1.5 text-cyan-400 hover:text-white transition"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>

                        {/* Toggle Status (cannot deactivate main admin) */}
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => toggleMutation.mutate(u.id)}
                            className={`rounded-lg p-1.5 transition ${
                              isActive
                                ? 'bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400'
                                : 'bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400'
                            }`}
                            title={isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {modalUser.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {modalUser.mode === 'ADD' ? 'Add Staff User' : 'Edit User Profile'}
              </h3>
              <button
                onClick={() => setModalUser(prev => ({ ...prev, isOpen: false }))}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalUser.error && (
              <div className="rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-200">
                {modalUser.error}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={modalUser.name}
                  onChange={e => setModalUser({ ...modalUser, name: e.target.value })}
                  placeholder="e.g. Mariam Al-Kuwari"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={modalUser.username}
                    onChange={e => setModalUser({ ...modalUser, username: e.target.value })}
                    placeholder="e.g. staff3"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={modalUser.role}
                    onChange={e =>
                      setModalUser({ ...modalUser, role: e.target.value as UserRole })
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={modalUser.email}
                  onChange={e => setModalUser({ ...modalUser, email: e.target.value })}
                  placeholder="name@kelvion.qa"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={modalUser.mobile}
                    onChange={e => setModalUser({ ...modalUser, mobile: e.target.value })}
                    placeholder="+974 5511 2233"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Kiosk Exit PIN (4 digits)
                  </label>
                  <input
                    type="text"
                    value={modalUser.pin}
                    onChange={e => setModalUser({ ...modalUser, pin: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalUser(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 transition"
              >
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-left space-y-4">
            <h3 className="text-lg font-bold text-white">Reset Staff Password</h3>
            <p className="text-xs text-slate-400">
              Set new password for <strong className="text-white">{resetPassModal.userName}</strong>
            </p>

            {resetPassModal.success ? (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Password successfully reset!</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="text"
                    value={resetPassModal.newPass}
                    onChange={e =>
                      setResetPassModal({ ...resetPassModal, newPass: e.target.value })
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setResetPassModal({
                        isOpen: false,
                        userId: '',
                        userName: '',
                        newPass: '',
                        success: false
                      })
                    }
                    className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResetPass}
                    className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white transition"
                  >
                    Update Password
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
