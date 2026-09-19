import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import eventService from '@/services/eventService'
import winnerService from '@/services/winnerService'
import { ROUTES } from '@/config/routes'

export default function MyEvents() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.username) {
      fetchParticipationData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchParticipationData = async () => {
    setLoading(true)
    try {
      const [regsRes, winsRes] = await Promise.all([
        eventService.getMyRegistrations(user.username).catch(() => ({ data: [] })),
        winnerService.getWinnersByUser(user.username).catch(() => ({ data: [] }))
      ])

      setRegistrations(regsRes.data || [])
      setWinnings(winsRes.data || [])
    } catch (err) {
      console.error('Error fetching participation data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Schedule TBA'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#7B1113] font-bold animate-pulse flex items-center gap-2">
          <span>🎟️</span> Loading Student Participation Records...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="academic-card p-12 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-headings font-bold text-[#202020]">Student Authentication Required</h2>
        <p className="text-xs text-[#666666]">
          Please log in with your student account to view your participation history, registered entry passes, and award victories.
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="inline-block px-6 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          Sign In to Your Account
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      {/* Header with Primary Orange Header */}
      <div className="bg-[#F28D1E] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden space-y-2">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold mb-1">
          <span>🎟️ Student Portal</span>
          <span>•</span>
          <span>MVJCE EventOrbit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-white tracking-tight">
          My Participation & Award Victories
        </h1>
        <p className="text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Track all your registered contests, contest schedules, campus venues, award victories, and confirmed entry passes.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="academic-card p-5 flex items-center gap-4">
          <div className="bg-[#2563A6]/10 text-[#2563A6] p-3 rounded-xl text-2xl border border-[#2563A6]/20">
            🎟️
          </div>
          <div>
            <div className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Registered Events</div>
            <div className="text-2xl font-headings font-extrabold text-[#202020] mt-0.5">{registrations.length}</div>
          </div>
        </div>

        <div className="academic-card p-5 flex items-center gap-4 border-l-4 border-l-[#D6A84F]">
          <div className="bg-[#D6A84F]/15 text-[#B7791F] p-3 rounded-xl text-2xl border border-[#D6A84F]/30">
            🏆
          </div>
          <div>
            <div className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Award Victories</div>
            <div className="text-2xl font-headings font-extrabold text-[#7B1113] mt-0.5">{winnings.length}</div>
          </div>
        </div>

        <div className="academic-card p-5 flex items-center gap-4">
          <div className="bg-[#287A4B]/10 text-[#287A4B] p-3 rounded-xl text-2xl border border-[#287A4B]/20">
            ✅
          </div>
          <div>
            <div className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Verified Passes</div>
            <div className="text-2xl font-headings font-extrabold text-[#202020] mt-0.5">{registrations.length}</div>
          </div>
        </div>
      </div>

      {/* Winnings & Awards Section */}
      <div className="academic-card p-6 md:p-8 space-y-4 border-l-4 border-l-[#D6A84F]">
        <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-3">
          <h2 className="text-xl font-headings font-bold text-[#202020] flex items-center gap-2">
            <span>🏆</span> My Award Victories ({winnings.length})
          </h2>
          <span className="text-xs text-[#7B1113] font-bold">Official Records</span>
        </div>

        {winnings.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#888888]">
            No victory records recorded yet. Register for campus contests and compete for the podium!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {winnings.map((w, idx) => (
              <div 
                key={w.id || idx} 
                className="bg-[#F7F6F3] border border-[#D6A84F]/40 p-4 rounded-xl flex items-center gap-3 shadow-sm hover:border-[#7B1113]/40 transition-all"
              >
                <div className="text-3xl">
                  {w.position === 'FIRST' ? '🥇' : w.position === 'SECOND' ? '🥈' : '🥉'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202020]">{w.eventName || 'Campus Contest'}</div>
                  <div className="text-xs text-[#7B1113] font-extrabold mt-0.5">
                    {w.positionDisplayName || w.position} Place
                  </div>
                  <div className="text-[10px] text-[#888888] mt-1">Official Winner • Certificate Verified</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participated Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-2.5">
          <h2 className="text-xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
            <span>📋</span> Registered Contests & Entry Passes ({registrations.length})
          </h2>
          <Link to={ROUTES.STUDENT.EVENTS} className="text-xs font-bold text-[#7B1113] hover:underline">
            Browse More Events →
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="academic-card p-12 text-center text-[#888888] text-sm space-y-2">
            <div>You haven't joined any events yet. Check out the Events catalog to register!</div>
            <Link
              to={ROUTES.STUDENT.EVENTS}
              className="inline-block mt-2 px-5 py-2 bg-[#7B1113] hover:bg-[#6F0F11] text-white text-xs font-bold rounded-xl transition-all"
            >
              Explore Events Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {registrations.map((item) => {
              const eventName = item.name || item.eventName || 'College Event'
              const venue = item.venue || 'Campus Main Center'
              const eventDate = item.eventDate
              const regEnd = item.regEnd
              const description = item.description

              return (
                <div 
                  key={item.id} 
                  className="academic-card p-6 space-y-4 hover:border-[#7B1113]/40 transition-all flex flex-col justify-between"
                >
                  {/* Top Badge & ID */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#287A4B] bg-[#287A4B]/10 px-3 py-1 rounded-full border border-[#287A4B]/20 uppercase tracking-wider">
                      Confirmed Entry Pass
                    </span>
                    <span className="text-[11px] text-[#888888] font-mono">
                      Ref: #{item.id ? String(item.id).substring(0, 8) : 'PASS'}
                    </span>
                  </div>

                  {/* Event Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-headings font-bold text-[#202020] leading-snug">{eventName}</h3>
                    {description && (
                      <p className="text-[#666666] text-xs line-clamp-2 leading-relaxed">{description}</p>
                    )}
                    {item.teamName && (
                      <div className="text-xs text-[#7B1113] font-bold pt-1">
                        👥 Team: {item.teamName}
                      </div>
                    )}
                  </div>

                  {/* Schedule & Venue Details */}
                  <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#555555]">
                      <span className="font-semibold text-[#888888]">📍 Venue:</span>
                      <span className="font-semibold text-[#202020]">{venue}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#555555]">
                      <span className="font-semibold text-[#888888]">📅 Event Date:</span>
                      <span className="font-semibold text-[#202020]">{formatDate(eventDate)}</span>
                    </div>

                    {regEnd && (
                      <div className="flex items-center justify-between text-[#888888] text-[11px]">
                        <span>Reg Deadline:</span>
                        <span>{formatDate(regEnd)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Account Status */}
                  <div className="pt-2.5 border-t border-[#E5E1DC] flex items-center justify-between text-xs text-[#888888]">
                    <span>Registered Student: <strong className="text-[#202020]">{user?.username}</strong></span>
                    <span className="text-[#287A4B] font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#287A4B]"></span> Valid Pass
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
