import React, { useState, useEffect } from 'react'
import useAuth from '@/hooks/useAuth'
import eventService from '@/services/eventService'
import winnerService from '@/services/winnerService'

export default function MyEvents() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.username) {
      fetchParticipationData()
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
    if (!dateStr) return 'TBD'
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
        <div className="text-primary font-bold animate-pulse flex items-center gap-2">
          <span>🎟️</span> Loading Participation History...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <span>🎟️</span> My Participation & Winnings
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Track all your registered contests, schedules, venues, award victories, and entry passes.
        </p>
      </div>

      {/* Winnings & Awards Section */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 p-6 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <span>🏆</span> My Award Victories ({winnings.length})
        </h2>

        {winnings.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No victory records yet. Register for contests and climb the podium!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {winnings.map((w, idx) => (
              <div key={w.id || idx} className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
                <div className="text-3xl">
                  {w.position === 'FIRST' ? '🥇' : w.position === 'SECOND' ? '🥈' : '🥉'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{w.eventName || 'Campus Contest'}</div>
                  <div className="text-xs text-amber-400 font-extrabold mt-0.5">
                    {w.positionDisplayName || w.position} Place
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Certificate Issued • Official Winner</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participated Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📋</span> Registered Events ({registrations.length})
        </h2>

        {registrations.length === 0 ? (
          <div className="bg-slate-900 border border-white/5 p-12 rounded-3xl text-center text-slate-500 text-sm">
            You haven't joined any events yet. Check out the Events page to sign up!
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
                  className="bg-slate-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-lg hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  {/* Top Badge & ID */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                      Confirmed Entry
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ID: #{item.id ? item.id.substring(0, 8) : 'REG'}
                    </span>
                  </div>

                  {/* Event Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-extrabold text-white leading-snug">{eventName}</h3>
                    {description && (
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{description}</p>
                    )}
                    {item.teamName && (
                      <div className="text-xs text-purple-300 font-semibold pt-1">
                        👥 Team: {item.teamName}
                      </div>
                    )}
                  </div>

                  {/* Schedule & Venue Details */}
                  <div className="bg-slate-950/70 border border-white/5 p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-primary font-bold">📍 Venue:</span>
                      <span className="font-medium text-white">{venue}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-primary font-bold">📅 Event Date:</span>
                      <span className="font-medium text-white">{formatDate(eventDate)}</span>
                    </div>

                    {regEnd && (
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span className="text-amber-400 font-bold">⏳ Reg Deadline:</span>
                        <span>{formatDate(regEnd)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Account Status */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>Registered Account: <strong className="text-slate-200">{user?.username}</strong></span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Valid Pass
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
