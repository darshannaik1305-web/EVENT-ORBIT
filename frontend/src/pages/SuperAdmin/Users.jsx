import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import adminService from '@/services/adminService'
import clubService from '@/services/clubService'
import ConfirmModal from '@/components/common/ConfirmModal'
import Input from '@/components/common/Input'
import PasswordInput from '@/components/common/PasswordInput'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'

export default function Users() {
  const [activeTab, setActiveTab] = useState('STUDENTS') // 'STUDENTS' | 'CLUB_ADMINS'
  const [students, setStudents] = useState([])
  const [clubAdmins, setClubAdmins] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [createdCredentials, setCreatedCredentials] = useState(null)

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null
  })

  const [createAdminForm, setCreateAdminForm] = useState({
    facultyName: '',
    clubAdminId: '',
    clubId: '',
    email: '',
    mobile: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, clubAdminsRes, clubsRes] = await Promise.all([
        adminService.listUsers(),
        adminService.listClubAdmins(),
        clubService.getAllClubs()
      ])
      setStudents(usersRes.data || [])
      setClubAdmins(clubAdminsRes.data || [])
      setClubs(clubsRes.data || [])
    } catch (err) {
      console.error('Error fetching admin data:', err)
      toast.error('Failed to load accounts directory')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStudentEnabled = async (student) => {
    try {
      await adminService.setUserEnabled(student.id, !student.enabled)
      toast.success(`Student ${student.username} ${!student.enabled ? 'enabled' : 'disabled'}`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student status')
    }
  }

  const handleToggleClubAdminEnabled = async (admin) => {
    try {
      await adminService.setClubAdminEnabled(admin.id, !admin.enabled)
      toast.success(`Club Admin ${admin.clubAdminId || admin.username} ${!admin.enabled ? 'enabled' : 'disabled'}`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update club admin status')
    }
  }

  const handleDeleteStudent = (student) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Student Account?',
      message: `Are you sure you want to delete student '${student.fullName || student.username}' (${student.username})? This action cannot be undone.`,
      action: async () => {
        try {
          await adminService.deleteUser(student.id)
          toast.success(`Student '${student.username}' deleted successfully`)
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete student')
        }
      }
    })
  }

  const handleDeleteClubAdmin = (admin) => {
    setConfirmState({
      isOpen: true,
      title: 'Remove Club Admin Account?',
      message: `Are you sure you want to remove Club Admin '${admin.facultyName || admin.username}' (${admin.clubAdminId || admin.username})? Note: All club events, participants, and historical records will remain safely preserved.`,
      action: async () => {
        try {
          await adminService.deleteClubAdmin(admin.id)
          toast.success(`Club Admin '${admin.clubAdminId || admin.username}' removed successfully`)
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to remove club admin')
        }
      }
    })
  }

  const handleClubSelectChange = (selectedClubId) => {
    const selectedClub = clubs.find((c) => c.id === selectedClubId)
    let suggestedId = ''
    if (selectedClub) {
      const cleanName = selectedClub.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      suggestedId = `${cleanName.substring(0, 10)}01`
    }
    setCreateAdminForm((prev) => ({
      ...prev,
      clubId: selectedClubId,
      clubAdminId: prev.clubAdminId || suggestedId
    }))
  }

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault()
    if (!createAdminForm.facultyName.trim()) {
      toast.error('Faculty / Lecturer Name is required')
      return
    }
    if (!createAdminForm.clubAdminId.trim()) {
      toast.error('Club Admin ID is required (e.g. CODINGCLUB01)')
      return
    }
    if (!createAdminForm.clubId) {
      toast.error('Please select an assigned Club')
      return
    }
    const phoneDigits = (createAdminForm.mobile || '').replace(/\D/g, '')
    if (phoneDigits.length < 4) {
      toast.error('Phone number must contain at least 4 digits to generate the temporary password')
      return
    }

    setSubmitting(true)
    try {
      const res = await adminService.createClubAdmin({
        facultyName: createAdminForm.facultyName.trim(),
        clubAdminId: createAdminForm.clubAdminId.trim().toUpperCase(),
        clubId: createAdminForm.clubId,
        email: createAdminForm.email.trim(),
        mobile: createAdminForm.mobile.trim()
      })
      toast.success(`Lecturer Club Admin '${createAdminForm.clubAdminId.toUpperCase()}' created successfully!`)
      setShowCreateAdminModal(false)
      setCreatedCredentials(res.data)
      setCreateAdminForm({
        facultyName: '',
        clubAdminId: '',
        clubId: '',
        email: '',
        mobile: ''
      })
      fetchData()
    } catch (err) {
      console.error('Failed to create club admin:', err)
      toast.error(err.response?.data?.message || 'Failed to create Club Admin account')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter lists based on search term
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase()
    return (
      (s.username && s.username.toLowerCase().includes(term)) ||
      (s.fullName && s.fullName.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term))
    )
  })

  const filteredClubAdmins = clubAdmins.filter((a) => {
    const term = search.toLowerCase()
    return (
      (a.clubAdminId && a.clubAdminId.toLowerCase().includes(term)) ||
      (a.username && a.username.toLowerCase().includes(term)) ||
      (a.facultyName && a.facultyName.toLowerCase().includes(term)) ||
      (a.clubName && a.clubName.toLowerCase().includes(term)) ||
      (a.email && a.email.toLowerCase().includes(term))
    )
  })

  // Clubs that already have an active admin
  const assignedClubIds = new Set(clubAdmins.filter(a => a.enabled).map(a => a.adminClubId))

  return (
    <div className="space-y-6 select-none max-w-7xl">
      {/* Top Header */}
      <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#F28D1E]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F28D1E]/10 border border-[#F28D1E]/20 text-[#F28D1E] text-xs font-bold mb-1">
            <span>👥 Access Governance</span>
            <span>•</span>
            <span>Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
            <span>👥</span> User & Club Admin Management
          </h1>
          <p className="text-[#666666] text-xs sm:text-sm mt-1">
            Manage student registrations and provision dedicated Lecturer Club Admin accounts with assigned club domains.
          </p>
        </div>

        <button
          onClick={() => setShowCreateAdminModal(true)}
          className="px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <span>➕</span> Provision Club Admin
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E1DC] gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'STUDENTS'
              ? 'border-[#F28D1E] text-[#F28D1E]'
              : 'border-transparent text-[#666666] hover:text-[#202020]'
          }`}
        >
          <span>🎓</span>
          <span>Students Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLUB_ADMINS')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'CLUB_ADMINS'
              ? 'border-[#F28D1E] text-[#F28D1E]'
              : 'border-transparent text-[#666666] hover:text-[#202020]'
          }`}
        >
          <span>🛡️</span>
          <span>Faculty Club Admins ({clubAdmins.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="academic-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder={activeTab === 'STUDENTS' ? 'Search students by USN, Name, or Email...' : 'Search Club Admins by ID, Faculty Name, or Club...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-2 bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl text-xs text-[#202020] outline-none focus:border-[#F28D1E] focus:bg-white transition-all"
        />

        <div className="text-xs text-[#888888]">
          Showing {activeTab === 'STUDENTS' ? filteredStudents.length : filteredClubAdmins.length} account(s)
        </div>
      </div>

      {/* TAB 1: Students Directory */}
      {activeTab === 'STUDENTS' && (
        <div className="academic-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#F28D1E] font-bold animate-pulse">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-[#888888]">No student accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#202020]">
                <thead className="bg-[#F7F6F3] text-[#555555] uppercase text-[10px] tracking-wider border-b border-[#E5E1DC]">
                  <tr>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">USN</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1DC]">
                  {filteredStudents.map((s) => {
                    const isSuperAdmin = s.role === 'ADMIN' || s.role === 'SUPER_ADMIN'

                    return (
                      <tr key={s.id} className="hover:bg-[#F7F6F3]/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#202020]">{s.fullName || s.username}</div>
                          <div className="text-[11px] text-[#666666]">{s.gender || 'Student'}</div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-[#F28D1E]">
                          <span className="bg-[#F28D1E]/10 px-2 py-0.5 rounded border border-[#F28D1E]/20">
                            {s.username}
                          </span>
                        </td>

                        <td className="p-3.5 text-[#666666]">
                          <div>{s.email || '—'}</div>
                          <div className="text-[11px]">{s.mobile || ''}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              s.enabled
                                ? 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/30'
                                : 'bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/30'
                            }`}
                          >
                            {s.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          {!isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleToggleStudentEnabled(s)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                  s.enabled
                                    ? 'bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20 hover:bg-[#B7791F]/20'
                                    : 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/20 hover:bg-[#287A4B]/20'
                                }`}
                              >
                                {s.enabled ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(s)}
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
      )}

      {/* TAB 2: Faculty Club Admins */}
      {activeTab === 'CLUB_ADMINS' && (
        <div className="academic-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#F28D1E] font-bold animate-pulse">Loading Club Admins...</div>
          ) : filteredClubAdmins.length === 0 ? (
            <div className="p-12 text-center text-[#888888] space-y-3">
              <p>No Lecturer Club Admins provisioned yet.</p>
              <button
                onClick={() => setShowCreateAdminModal(true)}
                className="px-4 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl transition-all"
              >
                ➕ Provision First Club Admin
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#202020]">
                <thead className="bg-[#F7F6F3] text-[#555555] uppercase text-[10px] tracking-wider border-b border-[#E5E1DC]">
                  <tr>
                    <th className="p-3.5">Club Admin ID</th>
                    <th className="p-3.5">Faculty / Coordinator</th>
                    <th className="p-3.5">Assigned Club (1:1 Domain)</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1DC]">
                  {filteredClubAdmins.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F7F6F3]/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold bg-[#F28D1E]/10 text-[#F28D1E] px-2.5 py-1 rounded-lg border border-[#F28D1E]/30 text-xs">
                          {a.clubAdminId || a.username}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#202020]">{a.facultyName || a.fullName}</div>
                        <div className="text-[10px] uppercase font-bold text-[#888888]">Faculty In-Charge</div>
                      </td>

                      <td className="p-3.5">
                        <div className="inline-flex items-center gap-1.5 bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25 px-2.5 py-1 rounded-lg font-bold text-xs">
                          <span>🏛️</span>
                          <span>{a.clubName || a.adminClubId}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-[#666666]">
                        <div>{a.email || '—'}</div>
                        <div className="text-[11px]">{a.mobile || ''}</div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.enabled
                              ? 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/30'
                              : 'bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/30'
                          }`}
                        >
                          {a.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleClubAdminEnabled(a)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            a.enabled
                              ? 'bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20 hover:bg-[#B7791F]/20'
                              : 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/20 hover:bg-[#287A4B]/20'
                          }`}
                        >
                          {a.enabled ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleDeleteClubAdmin(a)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 hover:bg-[#B42318]/20 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Provision New Club Admin */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E1DC] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-[#E5E1DC] pb-3">
              <div>
                <h3 className="text-lg font-headings font-bold text-[#202020] flex items-center gap-2">
                  <span>🛡️</span> Provision Lecturer Club Admin
                </h3>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Create a separate Faculty Club Admin account with exclusive club ownership.
                </p>
              </div>
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="text-[#888888] hover:text-[#202020] text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              {/* Select Club */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#202020] uppercase tracking-wider block">
                  1. Assigned Student Club <span className="text-[#B42318]">*</span>
                </label>
                <select
                  value={createAdminForm.clubId}
                  onChange={(e) => handleClubSelectChange(e.target.value)}
                  className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#202020] outline-none focus:border-[#F28D1E] focus:bg-white transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Choose Club --</option>
                  {clubs.map((c) => {
                    const alreadyAssigned = assignedClubIds.has(c.id)
                    return (
                      <option key={c.id} value={c.id} disabled={alreadyAssigned}>
                        {c.name} {alreadyAssigned ? '(Already Assigned)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Faculty Name */}
              <Input
                label="2. Faculty / Lecturer Name"
                id="facultyName"
                placeholder="e.g. Dr. A. Sharma"
                value={createAdminForm.facultyName}
                onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, facultyName: e.target.value }))}
                required
              />

              {/* Permanent Club Admin ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#202020] uppercase tracking-wider block">
                  3. Permanent Club Admin ID <span className="text-[#B42318]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CODINGCLUB01"
                  value={createAdminForm.clubAdminId}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, clubAdminId: e.target.value.toUpperCase() }))}
                  className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#202020] outline-none focus:border-[#F28D1E] focus:bg-white uppercase transition-all"
                  required
                />
                <p className="text-[10px] text-[#888888]">
                  Used by the faculty member to sign in. Permanent and non-editable.
                </p>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Input
                  label="4. Faculty Mobile"
                  id="mobile"
                  placeholder="9876543210"
                  value={createAdminForm.mobile}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, mobile: e.target.value }))}
                  required
                />

                <Input
                  label="Faculty Email (Optional)"
                  id="email"
                  type="email"
                  placeholder="faculty@mvjce.edu.in"
                  value={createAdminForm.email}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              {/* Automatic Password Generation Notice */}
              <div className="p-3 bg-[#F28D1E]/10 border border-[#F28D1E]/20 rounded-xl flex items-start gap-2.5 text-xs text-[#202020]">
                <span className="text-base leading-none">🔐</span>
                <div className="space-y-1">
                  <p className="font-bold text-[#F28D1E]">
                    Automatic Temporary Password Generation
                  </p>
                  <p className="text-[11px] text-[#666666] leading-relaxed">
                    Initial password will be automatically generated as: <br />
                    <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-[#202020]">
                      &lt;FirstName&gt;@&lt;Last4DigitsOfPhone&gt;
                    </code>{' '}
                    (e.g., <em>Rajesh@3210</em>). It will be securely presented to you once upon creation.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateAdminModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >
                  Create Club Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Confirmation Dialog */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="academic-card max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-[#12B76A]/40 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-[#E5E1DC] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#12B76A]/10 border border-[#12B76A]/30 flex items-center justify-center text-2xl">
                <span>🎉</span>
              </div>
              <div>
                <h3 className="text-lg font-headings font-extrabold text-[#202020]">
                  Club Admin Account Provisioned!
                </h3>
                <p className="text-xs text-[#666666]">
                  Account created for {createdCredentials.facultyName} ({createdCredentials.clubName})
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F28D1E]/10 border border-[#F28D1E]/30 rounded-xl text-xs text-[#202020] flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <p className="text-[11px] leading-relaxed">
                <strong>Important:</strong> This generated temporary password is displayed <strong>ONLY ONCE</strong>. Please copy these credentials now and securely deliver them to the faculty member.
              </p>
            </div>

            <div className="bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-2">
                <span className="text-[#888888] font-sans font-medium text-xs">Faculty Name:</span>
                <span className="font-bold text-[#202020] font-sans">{createdCredentials.facultyName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-2">
                <span className="text-[#888888] font-sans font-medium text-xs">Assigned Club:</span>
                <span className="font-bold text-[#202020] font-sans">{createdCredentials.clubName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-2">
                <span className="text-[#888888] font-sans font-medium text-xs">Club Admin ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#202020] bg-white px-2 py-0.5 rounded border border-[#E5E1DC]">
                    {createdCredentials.clubAdminId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.clubAdminId)
                      toast.success('Club Admin ID copied to clipboard!')
                    }}
                    className="p-1 hover:bg-[#E5E1DC] rounded text-xs cursor-pointer text-[#666666]"
                    title="Copy Club Admin ID"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#888888] font-sans font-medium text-xs">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#12B76A] bg-white px-2 py-0.5 rounded border border-[#12B76A]/40 text-sm">
                    {createdCredentials.temporaryPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.temporaryPassword)
                      toast.success('Temporary password copied to clipboard!')
                    }}
                    className="p-1 hover:bg-[#E5E1DC] rounded text-xs cursor-pointer text-[#666666]"
                    title="Copy Temporary Password"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0BA5EC]/10 border border-[#0BA5EC]/20 rounded-xl text-xs text-[#026AA2] flex items-start gap-2">
              <span className="text-base leading-none">ℹ️</span>
              <p className="text-[11px] leading-relaxed">
                The lecturer will be required to change this temporary password to a private password upon their first login before accessing the Club Admin dashboard.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const copyText = `EventOrbit Lecturer Club Admin Credentials:\nFaculty: ${createdCredentials.facultyName}\nClub: ${createdCredentials.clubName}\nClub Admin ID: ${createdCredentials.clubAdminId}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: /login/admin\n*You will be prompted to set a new password on first login.`
                  navigator.clipboard.writeText(copyText)
                  toast.success('All credentials copied to clipboard!')
                }}
                className="px-4 py-2 bg-[#F7F6F3] hover:bg-[#E5E1DC] text-[#202020] text-xs font-bold rounded-xl border border-[#E5E1DC] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📋</span> Copy Full Credentials
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="px-6 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={async () => {
          if (confirmState.action) await confirmState.action()
          setConfirmState({ isOpen: false, title: '', message: '', action: null })
        }}
        onCancel={() => setConfirmState({ isOpen: false, title: '', message: '', action: null })}
      />
    </div>
  )
}
