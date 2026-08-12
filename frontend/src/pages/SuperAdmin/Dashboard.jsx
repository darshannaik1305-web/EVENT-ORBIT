import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import adminService from '@/services/adminService'
import clubService from '@/services/clubService'
import eventService from '@/services/eventService'
import { ROUTES } from '@/config/routes'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    clubAdmins: 0,
    totalClubs: 0,
    totalEvents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [usersRes, clubsRes, eventsRes] = await Promise.all([
        adminService.listUsers(),
        clubService.getAllClubs(),
        eventService.getAllEvents()
      ])

      const usersList = usersRes.data || []
      const clubAdminsList = usersList.filter(u => u.role === 'CLUB_ADMIN')

      setStats({
        totalUsers: usersList.length,
        clubAdmins: clubAdminsList.length,
        totalClubs: (clubsRes.data || []).length,
        totalEvents: (eventsRes.data || []).length
      })
    } catch (err) {
      console.error('Failed to load super admin stats:', err)
      toast.error('Could not fetch overview metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupWinners = async () => {
    try {
      const res = await adminService.cleanupWinners()
      toast.success(res.data?.message || 'Cleaned up orphaned winners')
    } catch (err) {
      toast.error('Cleanup failed')
    }
  }

  const handleCleanupEvents = async () => {
    try {
      const res = await adminService.cleanupEvents()
      toast.success(res.data?.message || 'Cleaned up orphaned events')
    } catch (err) {
      toast.error('Cleanup failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>👑</span> Super Admin Control Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          System overview, club & user administration, data maintenance.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-white/10 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Registered Users</div>
          <div className="text-3xl font-extrabold text-white mt-2">{loading ? '...' : stats.totalUsers}</div>
          <div className="text-xs text-slate-500 mt-1">Includes students & admins</div>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/20 p-5 rounded-xl">
          <div className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Assigned Club Admins</div>
          <div className="text-3xl font-extrabold text-purple-300 mt-2">{loading ? '...' : stats.clubAdmins}</div>
          <div className="text-xs text-purple-400/60 mt-1">Active club managers</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 p-5 rounded-xl">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Active Clubs</div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2">{loading ? '...' : stats.totalClubs}</div>
          <div className="text-xs text-emerald-400/60 mt-1">College campus clubs</div>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/20 p-5 rounded-xl">
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Total Events</div>
          <div className="text-3xl font-extrabold text-blue-300 mt-2">{loading ? '...' : stats.totalEvents}</div>
          <div className="text-xs text-blue-400/60 mt-1">Events created across clubs</div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> Quick Management
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              to={ROUTES.SUPERADMIN.USERS}
              className="p-4 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-primary transition-colors">User & Admin Directory</div>
                <div className="text-xs text-slate-400">View user list, assign Club Admin privileges, or ban accounts</div>
              </div>
              <span className="text-slate-500 group-hover:text-primary">→</span>
            </Link>

            <Link
              to={ROUTES.SUPERADMIN.CLUBS}
              className="p-4 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-primary transition-colors">Manage College Clubs</div>
                <div className="text-xs text-slate-400">Add new clubs, edit club details, or delete clubs</div>
              </div>
              <span className="text-slate-500 group-hover:text-primary">→</span>
            </Link>
          </div>
        </div>

        {/* Database Maintenance Tools */}
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧹</span> System Maintenance
          </h2>
          <p className="text-xs text-slate-400">
            Execute safe database cleanup tasks for orphaned data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCleanupEvents}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              Cleanup Orphaned Events
            </button>
            <button
              onClick={handleCleanupWinners}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              Cleanup Orphaned Winners
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
