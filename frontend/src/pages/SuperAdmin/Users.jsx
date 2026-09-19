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
      await adminService.assignClubAdmin({
        usn: assignForm.usn.trim(),
        clubId: assignForm.clubId
      })
      toast.success(`Assigned Club Admin for club`)
      setShowAssignModal(false)
      setAssignForm({
        usn: '',
        fullName: '',
        email: '',
        mobile: '',
        gender: 'MALE',
        password: '',
        clubId: ''
      })
      fetchData()
    } catch (err) {
      console.error('Failed to assign club admin:', err)
      toast.error(err.response?.data?.message || 'Assignment failed')
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    const matchesSearch =
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))

    if (roleFilter !== 'ALL') {
      return matchesSearch && u.role === roleFilter
    }
    return matchesSearch
  })

  const getClubName = (clubId) => {
    const found = clubs.find((c) => c.id === clubId)
    return found ? found.name : clubId
  }

  return (
    <div className="space-y-6 select-none">
      {/* Top Header & Actions */}
      <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#F28D1E]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F28D1E]/10 border border-[#F28D1E]/20 text-[#F28D1E] text-xs font-bold mb-1">
            <span>👥 Access Management</span>
            <span>•</span>
            <span>Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
            <span>👥</span> Student & Admin Directory
          </h1>
          <p className="text-[#666666] text-xs sm:text-sm mt-1">
            Manage user profiles, assign Club Admin privileges, and control institutional account status.
          </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <span>➕</span> Assign Club Admin
        </button>
      </div>

      {/* Filters & Search */}
      <div className="academic-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by USN, Name, or Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl text-xs text-[#202020] outline-none focus:border-[#F28D1E] focus:bg-white transition-all"
        />

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'STUDENT', 'CLUB_ADMIN'].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                roleFilter === rf
                  ? 'bg-[#F28D1E] text-white shadow-sm'
                  : 'bg-[#F1EFEB] text-[#666666] hover:bg-[#E5E1DC] hover:text-[#202020]'
              }`}
            >
              {rf === 'ALL' ? 'All Users' : rf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="academic-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#F28D1E] font-bold animate-pulse">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[#888888]">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#202020]">
              <thead className="bg-[#F7F6F3] text-[#555555] uppercase text-[10px] tracking-wider border-b border-[#E5E1DC]">
                <tr>
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Assigned Club(s)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1DC]">
                {filteredUsers.map((u) => {
                  const isClubAdmin = u.role === 'CLUB_ADMIN'
                  const isSuperAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'

                  return (
                    <tr key={u.id} className="hover:bg-[#F7F6F3]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#202020]">{u.fullName || u.username}</div>
                        <div className="text-xs text-[#666666] flex items-center gap-2 mt-0.5">
                          <span className="font-mono bg-[#F1EFEB] px-1.5 py-0.5 rounded text-[11px] font-bold text-[#F28D1E]">{u.username}</span>
                          {u.email && <span>{u.email}</span>}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                            isSuperAdmin
                              ? 'bg-[#7B1113]/10 text-[#7B1113] border-[#7B1113]/25'
                              : isClubAdmin
                              ? 'bg-[#F28D1E]/10 text-[#F28D1E] border-[#F28D1E]/20'
                              : 'bg-[#2563A6]/10 text-[#2563A6] border-[#2563A6]/20'
                          }`}
                        >
                          {isSuperAdmin ? 'Super Admin' : isClubAdmin ? 'Club Admin' : 'Student'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {isClubAdmin && u.clubs && u.clubs.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {u.clubs.map((c) => (
                              <div key={c.clubAdminId} className="flex items-center gap-2 text-xs">
                                <span className="bg-[#F28D1E]/10 text-[#F28D1E] px-2 py-0.5 rounded border border-[#F28D1E]/20 font-semibold">
                                  {getClubName(c.clubId)}
                                </span>
                                <button
                                  onClick={() => handleRevokeClubAdmin(c.clubAdminId, getClubName(c.clubId))}
                                  className="text-[#B42318] hover:underline font-bold text-[11px] cursor-pointer"
                                  title="Revoke Admin"
                                >
                                  ✖ Revoke
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#888888] text-xs">—</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.enabled
                              ? 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/30'
                              : 'bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/30'
                          }`}
                        >
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {!isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleToggleUserEnabled(u)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                u.enabled
                                    ? 'bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20 hover:bg-[#B7791F]/20'
                                  : 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/20 hover:bg-[#287A4B]/20'
                              }`}
                            >
                              {u.enabled ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 hover:bg-[#B42318]/20 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E1DC] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E1DC] pb-3">
              <h3 className="text-lg font-headings font-bold text-[#202020] flex items-center gap-2">
                <span>⚡</span> Assign Club Admin Role
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-[#888888] hover:text-[#202020] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#555555] mb-1">Student USN *</label>
                <input
                  type="text"
                  placeholder="e.g. 1MJ23CS001"
                  value={assignForm.usn}
                  onChange={(e) => setAssignForm({ ...assignForm, usn: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] font-mono outline-none focus:border-[#F28D1E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555555] mb-1">Select Target Club *</label>
                <select
                  value={assignForm.clubId}
                  onChange={(e) => setAssignForm({ ...assignForm, clubId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] outline-none focus:border-[#F28D1E] cursor-pointer"
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

              <div className="bg-[#F28D1E]/10 border border-[#F28D1E]/20 p-3.5 rounded-xl text-xs text-[#202020] space-y-1">
                <div className="font-bold text-[#F28D1E] flex items-center gap-1.5">
                  <span>ℹ️</span> Assignment Guidelines:
                </div>
                <ul className="list-disc list-inside text-[11px] text-[#555555] space-y-0.5">
                  <li>User must already be registered as a Student.</li>
                  <li>Maximum 2 Club Admins allowed per club.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DC]">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-white border border-[#E5E1DC] hover:bg-[#F1EFEB] text-[#555555] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 cursor-pointer"
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
