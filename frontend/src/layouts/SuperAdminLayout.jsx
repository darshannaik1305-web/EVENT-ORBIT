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
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="super-admin-layout min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="bg-slate-900/90 border-b border-emerald-500/20 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to={ROUTES.SUPERADMIN.DASHBOARD} className="font-extrabold text-xl text-emerald-400 flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 p-1 rounded-lg">👑</span>
              Super Admin Control Center
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to={ROUTES.SUPERADMIN.DASHBOARD} className={navLinkClass}>Control Center</NavLink>
              <NavLink to={ROUTES.SUPERADMIN.CLUBS} className={navLinkClass}>Clubs</NavLink>
              <NavLink to={ROUTES.SUPERADMIN.USERS} className={navLinkClass}>User Directory</NavLink>
              <NavLink to={ROUTES.SUPERADMIN.REQUESTS} className={navLinkClass}>Admin Requests</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{user?.fullName || user?.username}</div>
              <div className="text-xs text-emerald-400 font-bold uppercase">Super Admin</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}
