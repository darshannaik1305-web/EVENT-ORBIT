import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import eventService from '@/services/eventService'
import winnerService from '@/services/winnerService'
import { ROUTES } from '@/config/routes'
import EventDetailsModal, { getEventStatus, formatDateString } from '@/components/events/EventDetailsModal'

export default function StudentHome() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [winners, setWinners] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [myWinnings, setMyWinnings] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [selectedModalEvent, setSelectedModalEvent] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [eventsRes, winnersRes] = await Promise.all([
        eventService.getAllEvents().catch(() => ({ data: [] })),
        winnerService.getAllWinners().catch(() => ({ data: [] }))
      ])

      const allEvents = eventsRes.data || []
      setEvents(allEvents)
      setWinners(winnersRes.data || [])

      if (user?.username) {
        const [myRegsRes, myWinsRes] = await Promise.all([
          eventService.getMyRegistrations(user.username).catch(() => ({ data: [] })),
          winnerService.getWinnersByUser(user.username).catch(() => ({ data: [] }))
        ])
        setMyRegistrations(myRegsRes.data || [])
        setMyWinnings(myWinsRes.data || [])
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterConfirm = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId)
      toast.success('Successfully registered for event!')
      setSelectedModalEvent(null)
      fetchDashboardData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const isClubAdmin = Boolean(user?.roles && user.roles.includes('CLUB_ADMIN'))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-primary font-bold animate-pulse">
          <span className="text-2xl">⚡</span> Loading Dashboard...
        </div>
      </div>
    )
  }

  const displayEvents = events.slice(0, 4)

  return (
    <div className="space-y-8 select-none">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
              <span>👋 Welcome Back</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Hello, {user?.fullName || user?.username || 'Student'}!
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              Explore college events, track active participations, and view competition results.
            </p>
          </div>

          {isClubAdmin && (
            <Link
              to={ROUTES.ADMIN.DASHBOARD}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <span>⚡</span> Go to Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* 2. Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl text-2xl border border-blue-500/20">
            🎟️
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Events Joined</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{myRegistrations.length}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 p-5 rounded-xl flex items-center gap-4">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl text-2xl border border-amber-500/20">
            🏆
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Total Wins</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-0.5">{myWinnings.length}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 p-5 rounded-xl flex items-center gap-4">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-2xl border border-emerald-500/20">
            🎯
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Participation Count</div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-0.5">{myRegistrations.length}</div>
          </div>
        </div>
      </div>

      {/* 3. Upcoming & Featured Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📅</span> Featured & Upcoming Events
            </h2>
            <p className="text-xs text-slate-400">Discover active contests and claim your slot</p>
          </div>
          <Link to={ROUTES.STUDENT.EVENTS} className="text-xs font-semibold text-primary hover:underline">
            View All Events →
          </Link>
        </div>

        {displayEvents.length === 0 ? (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No active events available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayEvents.map((evt) => {
              const status = getEventStatus(evt)
              const isRegistered = myRegistrations.some((r) => r.eventId === evt.id)

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedModalEvent(evt)}
                  className="bg-slate-900 border border-white/10 hover:border-primary/50 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${status.style}`}>
                        {status.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Capacity: {evt.capacity || '∞'}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors leading-snug">{evt.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{evt.description || 'Join this exciting campus contest!'}</p>
                    </div>

                    {/* Registration Dates Information Box */}
                    <div className="bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-xl space-y-1 text-[11px]">
                      {status.code === 'UPCOMING' ? (
                        <>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Reg Starts:</span>
                            <span className="font-semibold text-blue-300">{formatDateString(evt.regStart) || 'TBA'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Reg Ends (Last Date):</span>
                            <span className="font-semibold text-purple-300">{formatDateString(evt.regEnd) || 'TBA'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Last Date to Register:</span>
                          <span className="font-bold text-amber-300">{formatDateString(evt.regEnd) || 'N/A'}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Date & Venue Info */}
                    <div className="bg-slate-950/60 border border-white/5 p-2.5 rounded-xl space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>📅 Event Date:</span>
                        {evt.eventDate ? (
                          <span className="text-slate-200 font-semibold">{formatDateString(evt.eventDate)}</span>
                        ) : (
                          <span className="text-amber-400/90 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
                            Event date is not declared
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>📍 Venue:</span>
                        {evt.venue ? (
                          <span className="text-slate-200 font-semibold">{evt.venue}</span>
                        ) : (
                          <span className="text-amber-400/90 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
                            Venue is not declared
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-primary font-semibold group-hover:underline">
                      View Details →
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedModalEvent(evt)
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isRegistered
                          ? 'bg-slate-800 text-emerald-400 cursor-not-allowed border border-emerald-500/20'
                          : status.code === 'ENDED'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                          : 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20'
                      }`}
                    >
                      {isRegistered ? '✓ Registered' : status.code === 'ENDED' ? 'Ended' : 'Register Now'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Integrated Winners */}
      <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🏆</span> Recent Winners & Top Performers
            </h2>
            <p className="text-xs text-slate-400">Hall of fame for recent event champions</p>
          </div>
        </div>

        {winners.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No winners declared yet. Check back after events finish!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {winners.slice(0, 6).map((w, idx) => (
              <div key={w.id || idx} className="bg-slate-950/80 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                <div className="text-2xl">
                  {w.position === 'FIRST' ? '🥇' : w.position === 'SECOND' ? '🥈' : '🥉'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{w.fullName || w.username}</div>
                  <div className="text-[10px] text-amber-400 font-semibold">{w.eventName || 'Campus Event'}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{w.positionDisplayName || w.position}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EVENT DETAILS MODAL WITH REGISTRATION CONFIRMATION */}
      <EventDetailsModal
        event={selectedModalEvent}
        isOpen={Boolean(selectedModalEvent)}
        onClose={() => setSelectedModalEvent(null)}
        isRegistered={Boolean(selectedModalEvent && myRegistrations.some((r) => r.eventId === selectedModalEvent.id))}
        onRegisterConfirm={handleRegisterConfirm}
      />
    </div>
  )
}
