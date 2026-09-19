import React from 'react'
import useAuth from '@/hooks/useAuth'

export default function Profile() {
  const { user } = useAuth()

  const isClubAdmin = Boolean(user?.roles && user.roles.includes('CLUB_ADMIN'))

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto pb-12">
      {/* Institutional Header Banner with Primary Orange Header */}
      <div className="bg-[#F28D1E] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden space-y-2">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold mb-1">
          <span>👤 Student Identity</span>
          <span>•</span>
          <span>MVJCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-white tracking-tight">
          Student Profile
        </h1>
        <p className="text-white/90 text-xs sm:text-sm">
          View your registered campus credentials, assigned system permissions, and contact records.
        </p>
      </div>

      {/* User Info Card */}
      <div className="academic-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-5 border-b border-[#E5E1DC] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F28D1E] flex items-center justify-center text-2xl font-headings font-extrabold text-white shadow-sm">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-headings font-bold text-[#202020]">{user?.fullName || user?.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-[#555555] bg-[#F7F6F3] px-2 py-0.5 rounded border border-[#E5E1DC]">
                {user?.username}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isClubAdmin
                    ? 'bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/30'
                    : 'bg-[#F28D1E]/15 text-[#F28D1E] border border-[#F28D1E]/30'
                }`}
              >
                {isClubAdmin ? 'Club Admin' : 'Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#F7F6F3] p-4 rounded-xl border border-[#E5E1DC] space-y-1">
            <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">USN / Username</div>
            <div className="text-sm font-semibold text-[#202020] font-mono">{user?.username}</div>
          </div>

          <div className="bg-[#F7F6F3] p-4 rounded-xl border border-[#E5E1DC] space-y-1">
            <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Full Name</div>
            <div className="text-sm font-semibold text-[#202020]">{user?.fullName || 'N/A'}</div>
          </div>

          <div className="bg-[#F7F6F3] p-4 rounded-xl border border-[#E5E1DC] space-y-1">
            <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Email Address</div>
            <div className="text-sm font-semibold text-[#202020]">{user?.email || 'N/A'}</div>
          </div>

          <div className="bg-[#F7F6F3] p-4 rounded-xl border border-[#E5E1DC] space-y-1">
            <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Mobile Number</div>
            <div className="text-sm font-semibold text-[#202020]">{user?.mobile || 'N/A'}</div>
          </div>

          <div className="bg-[#F7F6F3] p-4 rounded-xl border border-[#E5E1DC] space-y-1 md:col-span-2">
            <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Assigned Roles</div>
            <div className="flex gap-2 pt-1">
              {(user?.roles || [user?.role || 'STUDENT']).map((r, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/30 uppercase"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
