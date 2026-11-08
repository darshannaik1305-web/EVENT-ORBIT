import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import eventService from '@/services/eventService'
import { ROUTES } from '@/config/routes'

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClubEvents()
  }, [])

  const fetchClubEvents = async () => {
    setLoading(true)
    try {
      const res = await eventService.getAllEvents()
      setEvents(res.data || [])
    } catch (err) {
      console.error('Error loading events for club admin:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Title & Banner */}
      <div className="academic-card p-6 sm:p-8 space-y-2 border-l-4 border-l-[#F28D1E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F28D1E]/10 border border-[#F28D1E]/20 text-[#F28D1E] text-xs font-bold mb-1">
              <span>⚡ Faculty Console</span>
              <span>•</span>
              <span>MVJCE EventOrbit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
              <span>🛡️</span> Club Administration Hub
            </h1>
            <p className="text-[#666666] text-xs sm:text-sm mt-1">
              Welcome, <strong className="text-[#202020]">{user?.fullName || user?.username}</strong> ({user?.username})! Manage your club activities, track participant entry passes, and declare official podium winners.
            </p>
          </div>
          <Link
            to={ROUTES.ADMIN.PROFILE}
            className="px-4 py-2 bg-[#F28D1E]/10 hover:bg-[#F28D1E]/20 text-[#F28D1E] font-bold text-xs rounded-xl border border-[#F28D1E]/25 transition-all self-start sm:self-auto shrink-0 shadow-sm flex items-center gap-2"
          >
            <span>👤</span> Security & Profile
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="academic-card p-5">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Total Campus Events</div>
          <div className="text-3xl font-headings font-extrabold text-[#202020] mt-1.5">{loading ? '...' : events.length}</div>
        </div>

        <div className="academic-card p-5 border-l-4 border-l-[#F28D1E]">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Registration Channels</div>
          <div className="text-3xl font-headings font-extrabold text-[#F28D1E] mt-1.5">{loading ? '...' : 'Live & Active'}</div>
        </div>

        <div className="academic-card p-5 border-l-4 border-l-[#7B1113]">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Winner Standings</div>
          <div className="text-3xl font-headings font-extrabold text-[#7B1113] mt-1.5">Podium Ready</div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to={ROUTES.ADMIN.EVENTS}
          className="academic-card p-6 hover:border-[#F28D1E]/40 transition-all space-y-2 group"
        >
          <div className="text-3xl">📅</div>
          <div className="font-headings font-bold text-base text-[#202020] group-hover:text-[#F28D1E] transition-colors">
            Manage Club Events
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Create new contests, update venues and dates, extend registration schedules, or delete events.
          </p>
        </Link>

        <Link
          to={ROUTES.ADMIN.PARTICIPANTS}
          className="academic-card p-6 hover:border-[#F28D1E]/40 transition-all space-y-2 group"
        >
          <div className="text-3xl">👥</div>
          <div className="font-headings font-bold text-base text-[#202020] group-hover:text-[#F28D1E] transition-colors">
            Review Participants
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Verify student registrations, view group team rosters, and track confirmed entry passes.
          </p>
        </Link>

        <Link
          to={ROUTES.ADMIN.RESULTS}
          className="academic-card p-6 hover:border-[#F28D1E]/40 transition-all space-y-2 group"
        >
          <div className="text-3xl">🏆</div>
          <div className="font-headings font-bold text-base text-[#202020] group-hover:text-[#F28D1E] transition-colors">
            Declare Winners
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Assign 1st, 2nd, and 3rd place champions and publish verified victory certificates.
          </p>
        </Link>
      </div>
    </div>
  )
}
