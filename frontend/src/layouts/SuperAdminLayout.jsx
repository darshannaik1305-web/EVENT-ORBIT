import React from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
      isActive
        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  return (
    <div className="super-admin-layout min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between p-4 sticky top-0 h-screen z-40 select-none flex-shrink-0">
        {/* Brand Header */}
        <div className="space-y-6">
          <Link to={ROUTES.SUPERADMIN.DASHBOARD} className="flex items-center gap-3 px-2 pt-2">
            <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-xl font-bold border border-emerald-500/30 shadow-lg">
              👑
            </div>
            <div>
              <div className="font-extrabold text-lg text-white leading-tight">EventOrbit</div>
              <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
                Super Admin Portal
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden pr-2">
              <div className="text-sm font-bold text-white truncate">
                {user?.fullName || user?.username || 'Super Admin'}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">{user?.username}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Super Admin
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

