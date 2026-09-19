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
        <div className="text-[#F28D1E] font-bold animate-pulse flex items-center gap-2">
          <span>🏛️</span> Loading College Events Directory...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">
      {/* Institutional Banner with Primary Orange Header */}
      <div className="bg-[#F28D1E] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden space-y-2">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold mb-1">
          <span>🎪 Campus Events Directory</span>
          <span>•</span>
          <span>MVJCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-white tracking-tight">
          Explore & Register for Events
        </h1>
        <p className="text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Browse upcoming hackathons, technical symposia, cultural festivals, and competitive coding contests. Click any card for detailed schedules, venue information, and team registrations.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="academic-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Club Filter */}
          <div className="flex items-center gap-2 bg-[#F7F6F3] border border-[#E5E1DC] px-3.5 py-2 rounded-xl">
            <span className="text-xs text-[#666666] font-semibold">Club:</span>
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#202020] outline-none cursor-pointer"
            >
              <option value="">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#F7F6F3] border border-[#E5E1DC] px-3.5 py-2 rounded-xl">
            <span className="text-xs text-[#666666] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#202020] outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming Only</option>
              <option value="ACTIVE">Ongoing / Active</option>
              <option value="EXPIRED">Concluded / Ended</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Search event name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#202020] placeholder-[#888888] outline-none focus:border-[#F28D1E] focus:bg-white transition-all"
            />
            <span className="absolute left-3 top-2.5 text-xs text-[#888888]">🔍</span>
          </div>
        </div>
      </div>

      {/* Events Directory Grid */}
      {filteredEvents.length === 0 ? (
        <div className="academic-card p-12 text-center text-[#888888] text-sm space-y-2">
          <div className="text-3xl">🔍</div>
          <div className="font-semibold text-[#555555]">No events match your selected filters.</div>
          <p className="text-xs text-[#888888]">Try resetting your search query or selecting "All Clubs".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const clubObj = clubs.find((c) => c.id === evt.clubId)
            const clubName = clubObj ? clubObj.name : 'College Club'
            const status = getEventStatus(evt)
            const isRegistered = myRegistrations.some((r) => r.eventId === evt.id)

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
                className="academic-card p-6 flex flex-col justify-between space-y-5 cursor-pointer group hover:border-[#F28D1E]/40"
              >
                <div className="space-y-3">
                  {/* Top Row Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25">
                      {clubName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${badgeStyle}`}>
                        {status.label}
                      </span>
                      <span className="text-[11px] text-[#888888] font-mono">
                        Capacity: {evt.capacity || 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-headings font-bold text-[#202020] group-hover:text-[#F28D1E] transition-colors leading-snug">
                      {evt.name}
                    </h2>
                    <p className="text-xs text-[#666666] mt-1 line-clamp-2 leading-relaxed">
                      {evt.description || 'Join this exciting contest and showcase your skills!'}
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
                  <div className="bg-white border border-[#E5E1DC] p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] flex items-center gap-1.5 font-medium">
                        <span>📅</span> Event Schedule:
                      </span>
                      {evt.eventDate ? (
                        <span className="text-[#202020] font-semibold">{formatDateString(evt.eventDate)}</span>
                      ) : (
                        <span className="text-[#B7791F] font-bold bg-[#B7791F]/10 px-2 py-0.5 rounded text-[11px]">
                          Date to be declared
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] flex items-center gap-1.5 font-medium">
                        <span>📍</span> Venue:
                      </span>
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

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-[#E5E1DC] flex items-center justify-between">
                  <span className="text-xs text-[#F28D1E] font-bold group-hover:underline">
                    View Full Details →
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedModalEvent(evt)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isRegistered
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
