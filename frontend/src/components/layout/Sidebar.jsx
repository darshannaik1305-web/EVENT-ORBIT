import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'
import logoImg from '@/assets/logo.png'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const isClubAdmin = Boolean(user?.roles && user.roles.includes('CLUB_ADMIN'))

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${isActive
      ? 'bg-[#F28D1E]/10 text-[#F28D1E] font-bold border-l-4 border-[#F28D1E] shadow-sm'
      : 'text-[#555555] hover:bg-[#F28D1E]/5 hover:text-[#F28D1E]'
    }`

  return (
    <aside className="w-64 bg-white border-r border-[#E5E1DC] flex flex-col justify-between p-4 sticky top-0 h-screen z-40 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Brand & Main Nav */}
      <div className="space-y-6">
        <Link to={ROUTES.STUDENT.HOME} className="flex items-center gap-3 px-2 pt-2 group">
          <img
            src={logoImg}
            alt="EventOrbit Logo"
            className="h-9 w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <div className="font-headings font-extrabold text-lg text-[#202020] leading-tight tracking-tight flex items-center gap-1.5">
              EventOrbit
              <span className="h-1.5 w-1.5 rounded-full bg-[#F28D1E]" />
            </div>
            <div className="text-[10px] text-[#888888] font-semibold tracking-wider uppercase">MVJCE Event Portal</div>
          </div>
        </Link>

        {/* Sidebar Nav List */}
        <nav className="space-y-1 pt-3">
          <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#888888]">
            Main Menu
          </div>

          <NavLink to={ROUTES.STUDENT.HOME} className={navLinkClass}>
            <span className="text-base">🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.CLUBS} className={navLinkClass}>
            <span className="text-base">🏛️</span>
            <span>Clubs</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.MY_EVENTS} className={navLinkClass}>
            <span className="text-base">🎟️</span>
            <span>My Participation</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.RESULTS} className={navLinkClass}>
            <span className="text-base">🏆</span>
            <span>Winners & Results</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.AI_ASSISTANT} className={navLinkClass}>
            <span className="text-base">🤖</span>
            <span>AI Assistant</span>
          </NavLink>

          <NavLink to={ROUTES.STUDENT.PROFILE} className={navLinkClass}>
            <span className="text-base">👤</span>
            <span>Profile</span>
          </NavLink>

          {/* Conditional Admin Panel for Club Admins */}
          {isClubAdmin && (
            <div className="pt-4 mt-2 border-t border-[#E5E1DC]">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#7B1113]">
                Club Administration
              </div>
              <NavLink
                to={ROUTES.ADMIN.DASHBOARD}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${isActive
                    ? 'bg-[#F28D1E] text-white shadow-sm'
                    : 'bg-[#F7F6F3] text-[#7B1113] border border-[#E5E1DC] hover:bg-[#F28D1E]/10 hover:text-[#F28D1E]'
                  }`
                }
              >
                <span className="text-base">⚡</span>
                <span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-[#E5E1DC] pt-3.5 space-y-3">
        <div className="flex items-center justify-between px-2 bg-[#F7F6F3] p-2.5 rounded-xl border border-[#E5E1DC]">
          <div className="overflow-hidden pr-2">
            <div className="text-xs font-bold text-[#202020] truncate">
              {user?.fullName || user?.username || 'Student User'}
            </div>
            <div className="text-[11px] text-[#888888] font-mono truncate">{user?.username}</div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${isClubAdmin
                ? 'bg-[#F28D1E]/10 text-[#F28D1E] border border-[#F28D1E]/30'
                : 'bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25'
              }`}
          >
            {isClubAdmin ? 'Club Admin' : 'Student'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-[#B42318]/5 hover:bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
