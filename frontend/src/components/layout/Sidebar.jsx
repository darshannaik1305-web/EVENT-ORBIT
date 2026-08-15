import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  // Strict check using user.roles array (Mandatory Fix 1)
  const isClubAdmin = Boolean(user?.roles && user.roles.includes('CLUB_ADMIN'))

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
      isActive
        ? 'bg-primary/20 text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  return (
    <aside className="w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between p-4 sticky top-0 h-screen z-40 select-none">
      {/* Brand & Main Nav */}
      <div className="space-y-6">
        <Link to={ROUTES.STUDENT.HOME} className="flex items-center gap-3 px-2 pt-2">
          <div className="bg-primary/20 text-primary p-2 rounded-xl text-xl font-bold border border-primary/30">
            🚀
          </div>
          <div>
            <div className="font-extrabold text-lg text-white leading-tight">EventOrbit</div>
            <div className="text-[10px] text-slate-400 font-medium">College Event Portal</div>
          </div>
        </Link>

        {/* Sidebar Nav List */}
        <nav className="space-y-1.5 pt-4">
          <NavLink to={ROUTES.STUDENT.HOME} className={navLinkClass}>
            <span className="text-lg">🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.CLUBS} className={navLinkClass}>
            <span className="text-lg">🏫</span>
            <span>Clubs</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.MY_EVENTS} className={navLinkClass}>
            <span className="text-lg">🎟️</span>
            <span>My Participation</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.RESULTS} className={navLinkClass}>
            <span className="text-lg">🏆</span>
            <span>Results</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.AI_ASSISTANT} className={navLinkClass}>
            <span className="text-lg">🤖</span>
            <span>AI Assistant</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.PROFILE} className={navLinkClass}>
            <span className="text-lg">👤</span>
            <span>Profile</span>
          </NavLink>

          {/* Conditional Admin Panel for Club Admins */}
          {isClubAdmin && (
            <div className="pt-4 border-t border-white/10">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Management
              </div>
              <NavLink
                to={ROUTES.ADMIN.DASHBOARD}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:bg-purple-900/60 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">⚡</span>
                <span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="overflow-hidden pr-2">
            <div className="text-sm font-bold text-white truncate">
              {user?.fullName || user?.username}
            </div>
            <div className="text-xs text-slate-400 font-mono truncate">{user?.username}</div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
              isClubAdmin
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {isClubAdmin ? 'Club Admin' : 'Student'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
