import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import eventService from '@/services/eventService'
import clubService from '@/services/clubService'
import EventDetailsModal, { getEventStatus, formatDateString } from '@/components/events/EventDetailsModal'

export default function StudentEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedClubId, setSelectedClubId] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, UPCOMING, ACTIVE, EXPIRED
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State
  const [selectedModalEvent, setSelectedModalEvent] = useState(null)

  useEffect(() => {
    fetchInitialData()
  }, [user])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        eventService.getAllEvents().catch(() => ({ data: [] })),
        clubService.getAllClubs().catch(() => ({ data: [] })),
      ])

      setEvents(eventsRes.data || [])
      setClubs(clubsRes.data || [])

      if (user?.username) {
        const myRegsRes = await eventService.getMyRegistrations(user.username).catch(() => ({ data: [] }))
        setMyRegistrations(myRegsRes.data || [])
      }
    } catch (err) {
      console.error('Error loading student events catalog:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterConfirm = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId)
      toast.success('Successfully registered for event!')
      setSelectedModalEvent(null)
      fetchInitialData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  // Filter events
  const filteredEvents = events.filter((evt) => {
    // Club filter
    if (selectedClubId && evt.clubId !== selectedClubId) {
      return false
    }

    // Status filter
    const status = getEventStatus(evt)
    if (statusFilter === 'UPCOMING' && status.code !== 'UPCOMING') return false
    if (statusFilter === 'ACTIVE' && status.code !== 'ONGOING') return false
    if (statusFilter === 'EXPIRED' && status.code !== 'ENDED') return false

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchName = evt.name && evt.name.toLowerCase().includes(term)
      const matchDesc = evt.description && evt.description.toLowerCase().includes(term)
      if (!matchName && !matchDesc) return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-primary font-bold animate-pulse flex items-center gap-2">
          <span>⚡</span> Loading Events Directory...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-white/10 p-6 md:p-8 rounded-3xl space-y-2 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-1">
          <span>🎪 College Events Catalog</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Explore & Register for Events
        </h1>
        <p className="text-slate-400 text-xs md:text-sm max-w-xl">
          Browse upcoming hackathons, technical symposia, cultural fests, and workshops. Click any event for complete details and registration!
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Club Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Club:</span>
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
              <option value="UPCOMING" className="bg-slate-900 text-white">Upcoming Only</option>
              <option value="ACTIVE" className="bg-slate-900 text-white">Ongoing / Active</option>
              <option value="EXPIRED" className="bg-slate-900 text-white">Completed / Ended</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search event name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Events Directory Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-12 text-center text-slate-500 text-sm space-y-2">
          <div className="text-3xl">🔍</div>
          <div>No events match your selected filters.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const clubObj = clubs.find((c) => c.id === evt.clubId)
            const clubName = clubObj ? clubObj.name : 'College Club'
            const status = getEventStatus(evt)
            const isRegistered = myRegistrations.some((r) => r.eventId === evt.id)

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedModalEvent(evt)}
                className="bg-slate-900 border border-white/10 hover:border-primary/50 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between space-y-5 cursor-pointer group"
              >
                <div className="space-y-3">
                  {/* Top Row Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {clubName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${status.style}`}>
                        {status.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Cap: {evt.capacity || '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-snug">{evt.name}</h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {evt.description || 'Join this exciting contest and showcase your skills!'}
                    </p>
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
                  <div className="bg-slate-950/70 border border-white/5 p-3.5 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <span>📅</span> Event Date:
                      </span>
                      {evt.eventDate ? (
                        <span className="text-slate-200 font-semibold">{formatDateString(evt.eventDate)}</span>
                      ) : (
                        <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          Event date is not declared
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <span>📍</span> Venue:
                      </span>
                      {evt.venue ? (
                        <span className="text-slate-200 font-semibold">{evt.venue}</span>
                      ) : (
                        <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          Venue is not declared
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-primary font-semibold group-hover:underline">
                    View Details →
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedModalEvent(evt)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

      {/* EVENT DETAILS MODAL WITH REGISTRATION CONFIRMATION */}
      <EventDetailsModal
        event={selectedModalEvent}
        isOpen={Boolean(selectedModalEvent)}
        onClose={() => setSelectedModalEvent(null)}
        isRegistered={Boolean(selectedModalEvent && myRegistrations.some((r) => r.eventId === selectedModalEvent.id))}
        onRegisterConfirm={handleRegisterConfirm}
        clubName={clubs.find((c) => c.id === selectedModalEvent?.clubId)?.name}
      />
    </div>
  )
}
