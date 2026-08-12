import React from 'react'
import useAuth from '@/hooks/useAuth'

export default function Profile() {
  const { user } = useAuth()

  // Mandatory Fix 1: array role check
  const isClubAdmin = Boolean(user?.roles && user.roles.includes('CLUB_ADMIN'))

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <span>👤</span> Student Profile
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          View your registered campus identity, assigned permissions, and contact info.
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center gap-5 border-b border-white/10 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary/20">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.fullName || user?.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                {user?.username}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isClubAdmin
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {isClubAdmin ? 'Club Admin' : 'Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">USN / Username</div>
            <div className="text-sm font-semibold text-white font-mono">{user?.username}</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</div>
            <div className="text-sm font-semibold text-white">{user?.fullName || 'N/A'}</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</div>
            <div className="text-sm font-semibold text-white">{user?.email || 'N/A'}</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</div>
            <div className="text-sm font-semibold text-white">{user?.mobile || 'N/A'}</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1 md:col-span-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Roles</div>
            <div className="flex gap-2 pt-1">
              {(user?.roles || [user?.role || 'STUDENT']).map((r, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-primary/20 text-primary border border-primary/30 uppercase"
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
