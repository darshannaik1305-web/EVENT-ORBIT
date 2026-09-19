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
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="academic-card p-6 sm:p-8 space-y-2 border-l-4 border-l-[#F28D1E]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F28D1E]/10 border border-[#F28D1E]/20 text-[#F28D1E] text-xs font-bold mb-1">
          <span>👑 Master Administration</span>
          <span>•</span>
          <span>MVJCE EventOrbit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
          <span>👑</span> Super Admin Control Center
        </h1>
        <p className="text-[#666666] text-xs sm:text-sm mt-1">
          System overview, club & user administration, and institutional data maintenance.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="academic-card p-5">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Total Registered Users</div>
          <div className="text-3xl font-headings font-extrabold text-[#202020] mt-1.5">{loading ? '...' : stats.totalUsers}</div>
          <div className="text-xs text-[#888888] mt-1">Includes students & admins</div>
        </div>

        <div className="academic-card p-5 border-l-4 border-l-[#F28D1E]">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Assigned Club Admins</div>
          <div className="text-3xl font-headings font-extrabold text-[#F28D1E] mt-1.5">{loading ? '...' : stats.clubAdmins}</div>
          <div className="text-xs text-[#888888] mt-1">Active club managers</div>
        </div>

        <div className="academic-card p-5 border-l-4 border-l-[#7B1113]">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Active Clubs</div>
          <div className="text-3xl font-headings font-extrabold text-[#7B1113] mt-1.5">{loading ? '...' : stats.totalClubs}</div>
          <div className="text-xs text-[#888888] mt-1">College campus clubs</div>
        </div>

        <div className="academic-card p-5 border-l-4 border-l-[#2563A6]">
          <div className="text-[#888888] text-xs font-bold uppercase tracking-wider">Total Events</div>
          <div className="text-3xl font-headings font-extrabold text-[#2563A6] mt-1.5">{loading ? '...' : stats.totalEvents}</div>
          <div className="text-xs text-[#888888] mt-1">Events created across clubs</div>
        </div>
      </div>

      {/* Database Maintenance Tools */}
      <div className="academic-card p-6 space-y-4">
        <h2 className="text-lg font-headings font-bold text-[#202020] flex items-center gap-2">
          <span>🧹</span> System Maintenance
        </h2>
        <p className="text-xs text-[#666666]">
          Execute safe database cleanup tasks for orphaned events and winner declarations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCleanupEvents}
            className="px-4 py-2.5 bg-white hover:bg-[#F1EFEB] text-[#202020] text-xs font-bold rounded-xl border border-[#E5E1DC] transition-colors cursor-pointer shadow-sm"
          >
            Cleanup Orphaned Events
          </button>
          <button
            onClick={handleCleanupWinners}
            className="px-4 py-2.5 bg-white hover:bg-[#F1EFEB] text-[#202020] text-xs font-bold rounded-xl border border-[#E5E1DC] transition-colors cursor-pointer shadow-sm"
          >
            Cleanup Orphaned Winners
          </button>
        </div>
      </div>
    </div>
  )
}
