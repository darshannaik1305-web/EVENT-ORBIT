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
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="bg-slate-900 border border-purple-500/20 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span>🛡️</span> Club Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-purple-300 font-semibold">{user?.fullName || user?.username}</span>! Manage your club events, registrations, and declare event winners.
            </p>
          </div>
          <Link
            to={ROUTES.STUDENT.HOME}
            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-semibold text-xs rounded-xl border border-blue-500/30 transition-all self-start sm:self-auto"
          >
            Switch to Student View
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-white/10 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Events</div>
          <div className="text-3xl font-extrabold text-white mt-2">{loading ? '...' : events.length}</div>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/20 p-5 rounded-xl">
          <div className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Active Registrations</div>
          <div className="text-3xl font-extrabold text-purple-300 mt-2">{loading ? '...' : 'Available'}</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 p-5 rounded-xl">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Published Results</div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2">Ready</div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to={ROUTES.ADMIN.EVENTS}
          className="p-5 bg-slate-900 hover:bg-slate-800/80 border border-white/10 rounded-2xl transition-all space-y-2 group"
        >
          <div className="text-2xl">📅</div>
          <div className="font-bold text-white group-hover:text-purple-400 transition-colors">Manage Events</div>
          <p className="text-xs text-slate-400">Create, edit, or extend registration dates for club events.</p>
        </Link>

        <Link
          to={ROUTES.ADMIN.PARTICIPANTS}
          className="p-5 bg-slate-900 hover:bg-slate-800/80 border border-white/10 rounded-2xl transition-all space-y-2 group"
        >
          <div className="text-2xl">📋</div>
          <div className="font-bold text-white group-hover:text-purple-400 transition-colors">View Participants</div>
          <p className="text-xs text-slate-400">Check registrations and export participant lists.</p>
        </Link>

        <Link
          to={ROUTES.ADMIN.RESULTS}
          className="p-5 bg-slate-900 hover:bg-slate-800/80 border border-white/10 rounded-2xl transition-all space-y-2 group"
        >
          <div className="text-2xl">🏆</div>
          <div className="font-bold text-white group-hover:text-purple-400 transition-colors">Publish Winners</div>
          <p className="text-xs text-slate-400">Declare 1st, 2nd, and 3rd place winners for events.</p>
        </Link>
      </div>
    </div>
  )
}
