import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import eventService from '@/services/eventService'
import clubService from '@/services/clubService'
import winnerService from '@/services/winnerService'
import { ROUTES } from '@/config/routes'
import EventDetailsModal, { getEventStatus, formatDateString } from '@/components/events/EventDetailsModal'

export default function StudentHome() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [myWinnings, setMyWinnings] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [selectedModalEvent, setSelectedModalEvent] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [eventsRes, clubsRes, regsRes, winsRes] = await Promise.all([
        eventService.getAllEvents().catch(() => ({ data: [] })),
        clubService.getAllClubs().catch(() => ({ data: [] })),
        user?.username ? eventService.getMyRegistrations(user.username).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        user?.username ? winnerService.getWinnersByUser(user.username).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ])

      setEvents(eventsRes.data || [])
      setClubs(clubsRes.data || [])
      setMyRegistrations(regsRes.data || [])
      setMyWinnings(winsRes.data || [])
    } catch (err) {
      console.error('Error fetching student dashboard data:', err)
      toast.error('Unable to load some campus updates')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[#F28D1E] font-bold animate-pulse">
          <span className="text-xl">🏛️</span> Loading MVJCE EventOrbit Dashboard...
        </div>
      </div>
    )
  }

  const clubMap = clubs.reduce((acc, c) => {
    acc[c.id] = c.name
    return acc
  }, {})

  // Show only ongoing and upcoming events in the dashboard
  const activeEvents = events.filter((evt) => {
    const status = getEventStatus(evt)
    return status.code === 'ONGOING' || status.code === 'UPCOMING'
  })

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">
      {/* 1. Institutional Hero / Welcome Section with Primary Orange Header */}
      <div className="bg-gradient-to-r from-[#F28D1E] via-[#FA9D38] to-[#D97706] text-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-md relative overflow-hidden">
        {/* Subtle decorative maroon and white circular accents */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="absolute -right-4 -bottom-8 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold tracking-wide">
              <span>🏛️ MVJ College of Engineering</span>
              <span>•</span>
              <span>EventOrbit Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-headings font-extrabold text-white tracking-tight leading-tight">
              Hello, {user?.fullName || user?.username || 'Student'}!
            </h1>

            <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Events. Connect. Participate. Discover departmental hackathons, cultural festivals, tech symposia, and track your active competition standing.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="academic-card p-5 flex items-center gap-4">
          <div className="bg-[#2563A6]/10 text-[#2563A6] p-3 rounded-xl text-2xl border border-[#2563A6]/20">
            🎟️
          </div>
          <div>
            <div className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Registered Events</div>
            <div className="text-2xl font-headings font-extrabold text-[#202020] mt-0.5">{myRegistrations.length}</div>
          </div>
        </div>

        <div className="academic-card p-5 flex items-center gap-4 border-l-4 border-l-[#7B1113]">
          <div className="bg-[#7B1113]/10 text-[#7B1113] p-3 rounded-xl text-2xl border border-[#7B1113]/25">
            🏆
          </div>
          <div>
            <div className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Total Award Victories</div>
            <div className="text-2xl font-headings font-extrabold text-[#7B1113] mt-0.5">{myWinnings.length}</div>
          </div>
        </div>

        <div className="academic-card p-5 flex items-center gap-4 border-l-4 border-l-[#F28D1E]">
          <div className="bg-[#F28D1E]/10 text-[#F28D1E] p-3 rounded-xl text-2xl border border-[#F28D1E]/20">
            📅
          </div>
          <div>
            <div className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Active Contests</div>
            <div className="text-2xl font-headings font-extrabold text-[#202020] mt-0.5">
              {events.filter((e) => getEventStatus(e).code !== 'ENDED').length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured & Upcoming Events */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
              <span>🏆</span> Featured Campus Events
            </h2>
            <p className="text-xs text-[#666666]">Discover active contests and register for upcoming slots</p>
          </div>
          <Link to={ROUTES.STUDENT.EVENTS} className="text-xs font-bold text-[#F28D1E] hover:underline">
            Explore Events ({events.length} Contests) →
          </Link>
        </div>

        {activeEvents.length === 0 ? (
          <div className="academic-card p-12 text-center text-[#888888] text-sm space-y-3">
            <div className="text-3xl">🎪</div>
            <div className="font-semibold text-[#202020]">No ongoing or upcoming events at the moment.</div>
            <p className="text-xs text-[#666666]">Check back soon for new announcements, or explore concluded events in the events directory.</p>
            <Link
              to={ROUTES.STUDENT.EVENTS}
              className="inline-block mt-2 px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Explore All Events Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeEvents.map((evt) => {
              const status = getEventStatus(evt)
              const isRegistered = myRegistrations.some((r) => r.eventId === evt.id)
              const clubName = clubMap[evt.clubId] || 'Campus Club'

              // Semantic badge style
              let badgeStyle = 'bg-[#287A4B]/10 text-[#287A4B] border-[#287A4B]/30'
              if (status.code === 'UPCOMING') {
                badgeStyle = 'bg-[#F28D1E]/10 text-[#F28D1E] border-[#F28D1E]/30'
              } else if (status.code === 'ENDED') {
                badgeStyle = 'bg-[#888888]/10 text-[#888888] border-[#888888]/30'
              }

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedModalEvent(evt)}
                  className="academic-card p-6 flex flex-col justify-between gap-4 cursor-pointer group hover:border-[#F28D1E]/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25">
                          {clubName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}`}>
                          {status.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#888888] font-mono">
                        Capacity: {evt.capacity || 'Unlimited'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-headings font-bold text-[#202020] group-hover:text-[#F28D1E] transition-colors leading-snug">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-[#666666] line-clamp-2 mt-1 leading-relaxed">
                        {evt.description || 'Join this exciting campus contest at MVJCE!'}
                      </p>
                    </div>

                    {/* Registration Dates Information Box */}
                    <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3 rounded-xl space-y-1 text-xs">
                      {status.code === 'UPCOMING' ? (
                        <>
                          <div className="flex items-center justify-between text-[#555555]">
                            <span>Registration Opens:</span>
                            <span className="font-semibold text-[#2563A6]">{formatDateString(evt.regStart) || 'TBA'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#555555]">
                            <span>Registration Closes:</span>
                            <span className="font-semibold text-[#F28D1E]">{formatDateString(evt.regEnd) || 'TBA'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between text-[#555555]">
                          <span>Last Date to Register:</span>
                          <span className="font-bold text-[#B7791F]">{formatDateString(evt.regEnd) || 'N/A'}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Date & Venue Info */}
                    <div className="bg-white border border-[#E5E1DC] p-2.5 rounded-xl space-y-1.5 text-xs text-[#666666]">
                      <div className="flex items-center justify-between">
                        <span>📅 Event Schedule:</span>
                        {evt.eventDate ? (
                          <span className="text-[#202020] font-semibold">{formatDateString(evt.eventDate)}</span>
                        ) : (
                          <span className="text-[#B7791F] font-bold bg-[#B7791F]/10 px-1.5 py-0.5 rounded text-[10px]">
                            Date to be declared
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>📍 Venue:</span>
                        {evt.venue ? (
                          <span className="text-[#202020] font-semibold">{evt.venue}</span>
                        ) : (
                          <span className="text-[#888888] italic text-[11px]">
                            Campus Hall / TBA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E1DC]">
                    <span className="text-xs text-[#F28D1E] font-bold group-hover:underline">
                      View Event Details →
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedModalEvent(evt)
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isRegistered
                          ? 'bg-[#287A4B]/10 text-[#287A4B] border border-[#287A4B]/30 cursor-not-allowed'
                          : status.code === 'ENDED'
                            ? 'bg-[#F1EFEB] text-[#888888] border border-[#E5E1DC] cursor-not-allowed'
                            : 'bg-[#F28D1E] hover:bg-[#D97706] text-white shadow-sm shadow-[#F28D1E]/25'
                        }`}
                    >
                      {isRegistered ? '✓ Registered' : status.code === 'ENDED' ? 'Concluded' : 'Register Now'}
                    </button>
                  </div>
                </div>
              )
            })}
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
        clubName={clubMap[selectedModalEvent?.clubId]}
      />
    </div>
  )
}
