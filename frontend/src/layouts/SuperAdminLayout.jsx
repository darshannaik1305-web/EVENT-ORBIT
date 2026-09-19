import React from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'
import logoImg from '@/assets/logo.png'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
      isActive
        ? 'bg-[#F28D1E] text-white shadow-sm'
        : 'text-[#555555] hover:bg-[#F28D1E]/10 hover:text-[#F28D1E]'
    }`

  return (
    <div className="super-admin-layout min-h-screen flex bg-[#F7F6F3] text-[#202020] font-sans select-none">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#E5E1DC] flex flex-col justify-between p-5 sticky top-0 h-screen z-40 select-none flex-shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="space-y-6">
          <Link to={ROUTES.SUPERADMIN.DASHBOARD} className="flex items-center gap-3 px-1 pt-1 group">
            <img src={logoImg} alt="EventOrbit Logo" className="h-9 w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105" />
            <div>
              <div className="font-headings font-extrabold text-lg text-[#202020] leading-tight">EventOrbit</div>
              <div className="text-[10px] text-[#F28D1E] font-bold tracking-wider uppercase">
                Super Admin Portal
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              System Management
            </div>

            <NavLink to={ROUTES.SUPERADMIN.DASHBOARD} end className={navLinkClass}>
              <span className="text-lg">📊</span>
              <span>Control Center</span>
            </NavLink>

            <NavLink to={ROUTES.SUPERADMIN.CLUBS} className={navLinkClass}>
              <span className="text-lg">🏛️</span>
              <span>Manage Clubs</span>
            </NavLink>

            <NavLink to={ROUTES.SUPERADMIN.USERS} className={navLinkClass}>
              <span className="text-lg">👥</span>
              <span>User & Admin Directory</span>
            </NavLink>
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="border-t border-[#E5E1DC] pt-4 space-y-3">
          <div className="flex items-center justify-between px-2 bg-[#F7F6F3] p-2.5 rounded-xl border border-[#E5E1DC]">
            <div className="overflow-hidden pr-2">
              <div className="text-sm font-bold text-[#202020] truncate">
                {user?.fullName || user?.username || 'Super Admin'}
              </div>
              <div className="text-xs text-[#888888] font-mono truncate">{user?.username}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-extrabold bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25">
              ROOT
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-[#B42318]/5 hover:bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Workspace with Primary Orange Header */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Primary Orange Super Admin Header */}
        <header className="bg-[#F28D1E] text-white px-6 sm:px-8 py-3.5 shadow-sm flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/90">MVJCE Institutional Governance</div>
              <div className="text-base font-headings font-extrabold leading-tight">
                Super Admin Master Control
              </div>
            </div>
          </div>

        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
