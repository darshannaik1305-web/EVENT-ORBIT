import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import adminService from '@/services/adminService'
import clubService from '@/services/clubService'
import ConfirmModal from '@/components/common/ConfirmModal'

export default function Users() {
  const [users, setUsers] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null
  })

  const [assignForm, setAssignForm] = useState({
    usn: '',
    fullName: '',
    email: '',
    mobile: '',
    gender: 'MALE',
    password: '',
    clubId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userRes, clubRes] = await Promise.all([
        adminService.listUsers(),
        clubService.getAllClubs()
      ])
      setUsers(userRes.data || [])
      setClubs(clubRes.data || [])
    } catch (err) {
      console.error('Error fetching admin data:', err)
      toast.error('Failed to load user directory')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserEnabled = async (user) => {
    try {
      await adminService.setUserEnabled(user.id, !user.enabled)
      toast.success(`User ${user.username} ${!user.enabled ? 'enabled' : 'disabled'}`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleRevokeClubAdmin = (clubAdminId, clubName) => {
    setConfirmState({
      isOpen: true,
      title: 'Revoke Club Admin Role?',
      message: `Are you sure you want to revoke the Club Admin assignment for '${clubName}'?`,
      action: async () => {
        try {
          await adminService.deleteClubAdmin(clubAdminId)
          toast.success('Club admin role revoked')
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to revoke club admin')
        }
      }
    })
  }

  const handleDeleteUser = (user) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete User Profile?',
      message: `Are you sure you want to delete user profile '${user.fullName || user.username}' (${user.username})? This action cannot be undone.`,
      action: async () => {
        try {
          await adminService.deleteUser(user.id)
          toast.success(`User '${user.username}' deleted successfully`)
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete user')
        }
      }
    })
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignForm.usn || !assignForm.clubId) {
      toast.error('Student USN and Club selection are required')
      return
    }
    try {
      const res = await adminService.createClubAdmin({
        usn: assignForm.usn.trim(),
        clubId: assignForm.clubId
      })
      toast.success(res.data?.message || 'Club Admin privilege assigned successfully!')
      setShowAssignModal(false)
      setAssignForm({ usn: '', clubId: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign club admin')
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))

    if (roleFilter === 'STUDENT') {
      return matchesSearch && (u.role === 'USER' || u.role === 'STUDENT')
    }
    if (roleFilter === 'CLUB_ADMIN') {
      return matchesSearch && u.role === 'CLUB_ADMIN'
    }
    if (roleFilter === 'ADMIN') {
      return matchesSearch && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
    }
    return matchesSearch
  })

  const getClubName = (clubId) => {
    const found = clubs.find((c) => c.id === clubId)
    return found ? found.name : clubId
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-white/10 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>👥</span> Student & Admin Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage user profiles, assign Club Admin privileges, and control account status.
          </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <span>➕</span> Assign Club Admin
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 border border-white/5 rounded-xl">
        <input
          type="text"
          placeholder="Search by USN, Name, or Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary"
        />

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'STUDENT', 'CLUB_ADMIN'].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                roleFilter === rf
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {rf === 'ALL' ? 'All Users' : rf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Club(s)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isClubAdmin = u.role === 'CLUB_ADMIN'
                  const isSuperAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.fullName || u.username}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">{u.username}</span>
                          {u.email && <span>{u.email}</span>}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                            isSuperAdmin
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isClubAdmin
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {isSuperAdmin ? 'Super Admin' : isClubAdmin ? 'Club Admin' : 'Student'}
                        </span>
                      </td>

                      <td className="p-4">
                        {isClubAdmin && u.clubs && u.clubs.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {u.clubs.map((c) => (
                              <div key={c.clubAdminId} className="flex items-center gap-2 text-xs">
                                <span className="bg-purple-950/60 text-purple-200 px-2 py-0.5 rounded border border-purple-500/30">
                                  {getClubName(c.clubId)}
                                </span>
                                <button
                                  onClick={() => handleRevokeClubAdmin(c.clubAdminId, getClubName(c.clubId))}
                                  className="text-red-400 hover:text-red-300 font-semibold text-[11px] cursor-pointer"
                                  title="Revoke Admin"
                                >
                                  ✖ Revoke
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            u.enabled
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {!isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleToggleUserEnabled(u)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                u.enabled
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                            >
                              {u.enabled ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
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

      {/* Modal: Assign Club Admin */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡</span> Assign Club Admin Role
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student USN *</label>
                <input
                  type="text"
                  placeholder="e.g. 1MJ23CS001"
                  value={assignForm.usn}
                  onChange={(e) => setAssignForm({ ...assignForm, usn: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Club *</label>
                <select
                  value={assignForm.clubId}
                  onChange={(e) => setAssignForm({ ...assignForm, clubId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Choose Club --</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-950/40 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <span>ℹ️</span> Assignment Guidelines:
                </div>
                <ul className="list-disc list-inside text-[11px] text-purple-300/80 space-y-0.5">
                  <li>User must already be registered as a Student.</li>
                  <li>Maximum 2 Club Admins allowed per club.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Assign Privilege
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirm"
        confirmVariant="danger"
        onConfirm={() => {
          if (confirmState.action) confirmState.action()
        }}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

