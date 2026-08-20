import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'
import clubService from '@/services/clubService'
import logoImg from '@/assets/logo.png'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [myClubs, setMyClubs] = useState([])
  const [selectedClubId, setSelectedClubId] = useState('')
  const [loadingClubs, setLoadingClubs] = useState(true)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    setLoadingClubs(true)
    try {
      const res = await clubService.getMyClubs()
      const clubs = res.data || []
      setMyClubs(clubs)
      if (clubs.length > 0) {
        setSelectedClubId((prev) => (clubs.some((c) => c.id === prev) ? prev : clubs[0].id))
      }
    } catch (err) {
      console.error('Failed to load assigned clubs:', err)
    } finally {
      setLoadingClubs(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
      isActive
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  const selectedClub = myClubs.find((c) => c.id === selectedClubId) || myClubs[0]

  return (
    <div className="admin-layout min-h-screen flex bg-slate-950 text-slate-100 select-none">
      {/* Fixed Left Vertical Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-purple-500/20 flex flex-col justify-between p-5 fixed inset-y-0 left-0 z-40">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link to={ROUTES.ADMIN.EVENTS} className="flex items-center gap-3 px-1 pt-1 group">
            <img src={logoImg} alt="EventOrbit Logo" className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-transform group-hover:scale-105" />
            <div>
              <div className="font-black text-lg text-white leading-snug">EventOrbit</div>
              <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Club Admin Console</div>
            </div>
          </Link>

          {/* Managed Club Context Box */}
          {myClubs.length > 1 ? (
            <div className="bg-slate-950 border border-purple-500/30 p-3 rounded-2xl space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Club:</div>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full bg-slate-900 text-xs font-extrabold text-purple-300 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                {myClubs.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : myClubs.length === 1 ? (
            <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Managing Club</div>
                <div className="text-sm font-black text-purple-300 truncate max-w-[140px]">{myClubs[0].name}</div>
              </div>
              <span className="text-xl">🏛️</span>
            </div>
          ) : null}

          {/* Main Navigation Links */}
          <nav className="space-y-2 pt-2">
            <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Navigation
            </div>

            <NavLink to={ROUTES.ADMIN.EVENTS} className={navLinkClass}>
              <span className="text-lg">📅</span>
              <span>Club Events</span>
            </NavLink>

            <NavLink to={ROUTES.ADMIN.PARTICIPANTS} className={navLinkClass}>
              <span className="text-lg">👥</span>
              <span>Participants</span>
            </NavLink>

            <NavLink to={ROUTES.ADMIN.RESULTS} className={navLinkClass}>
              <span className="text-lg">🏆</span>
              <span>Winner Results</span>
            </NavLink>
          </nav>

          {/* Quick Action: Switch to Student Portal */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Student View
            </div>
            <Link
              to={ROUTES.STUDENT.HOME}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all shadow-md"
            >
              <span className="text-base">🎓</span>
              <span>Student Portal</span>
            </Link>
          </div>
        </div>

        {/* Admin User Profile Footer */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="overflow-hidden pr-2">
              <div className="text-sm font-bold text-white truncate">
                {user?.fullName || user?.username}
              </div>
              <div className="text-[11px] text-purple-400 font-semibold truncate">
                {selectedClub ? selectedClub.name : 'Club Admin'}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 ml-64 p-6 md:p-8 max-w-7xl w-full min-h-screen overflow-y-auto">
        <Outlet context={{ myClubs, selectedClubId, setSelectedClubId, loadingClubs }} />
      </main>
    </div>
  )
}
