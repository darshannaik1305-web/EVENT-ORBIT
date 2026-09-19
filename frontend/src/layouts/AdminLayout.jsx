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
        ? 'bg-[#F28D1E] text-white shadow-sm'
        : 'text-[#555555] hover:bg-[#F28D1E]/10 hover:text-[#F28D1E]'
    }`

  const selectedClub = myClubs.find((c) => c.id === selectedClubId) || myClubs[0]

  return (
    <div className="admin-layout min-h-screen flex bg-[#F7F6F3] text-[#202020] select-none">
      {/* Fixed Left Vertical Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E1DC] flex flex-col justify-between p-5 fixed inset-y-0 left-0 z-40 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link to={ROUTES.ADMIN.EVENTS} className="flex items-center gap-3 px-1 pt-1 group">
            <img src={logoImg} alt="EventOrbit Logo" className="h-9 w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105" />
            <div>
              <div className="font-headings font-extrabold text-lg text-[#202020] leading-snug">EventOrbit</div>
              <div className="text-[10px] text-[#F28D1E] font-bold uppercase tracking-wider">Club Admin Console</div>
            </div>
          </Link>

          {/* Managed Club Context Box */}
          {myClubs.length > 1 ? (
            <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3 rounded-2xl space-y-1.5">
              <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Active Club:</div>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full bg-white border border-[#E5E1DC] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#202020] outline-none cursor-pointer"
              >
                {myClubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          ) : myClubs.length === 1 ? (
            <div className="bg-[#F28D1E]/10 border border-[#F28D1E]/20 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#F28D1E] uppercase tracking-wider">Managing Club</div>
                <div className="text-sm font-headings font-bold text-[#202020] truncate max-w-[140px]">{myClubs[0].name}</div>
              </div>
              <span className="text-xl">🏛️</span>
            </div>
          ) : null}

          {/* Main Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <div className="px-2 text-[10px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">
              Admin Navigation
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
          <div className="pt-4 border-t border-[#E5E1DC] space-y-2">
            <div className="px-2 text-[10px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">
              Student View
            </div>
            <Link
              to={ROUTES.STUDENT.HOME}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25 hover:bg-[#7B1113]/20 transition-all shadow-sm"
            >
              <span className="text-base">🎓</span>
              <span>Student Portal</span>
            </Link>
          </div>
        </div>

        {/* Admin User Profile Footer */}
        <div className="border-t border-[#E5E1DC] pt-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="overflow-hidden pr-2">
              <div className="text-sm font-bold text-[#202020] truncate">
                {user?.fullName || user?.username}
              </div>
              <div className="text-[11px] text-[#7B1113] font-semibold truncate">
                {selectedClub ? selectedClub.name : 'Club Admin'}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-[#F28D1E]/10 text-[#F28D1E] border border-[#F28D1E]/30">
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-[#B42318]/5 hover:bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area with Primary Orange Header */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Primary Orange Admin Header */}
        <header className="bg-[#F28D1E] text-white px-6 sm:px-8 py-3.5 shadow-sm flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/90">MVJCE Admin Console</div>
              <div className="text-base font-headings font-extrabold leading-tight">
                {selectedClub ? selectedClub.name : 'Club Management'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 hidden sm:inline-block">
              ● Live Admin Mode
            </span>
          </div>
        </header>

        {/* Workspace Viewport */}
        <main className="p-6 md:p-8 max-w-7xl w-full flex-1">
          <Outlet context={{ myClubs, selectedClubId, setSelectedClubId, loadingClubs }} />
        </main>
      </div>
    </div>
  )
}
