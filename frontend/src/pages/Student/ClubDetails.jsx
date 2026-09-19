import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import clubService from '@/services/clubService'
import eventService from '@/services/eventService'
import winnerService from '@/services/winnerService'
import { ROUTES } from '@/config/routes'
import EventDetailsModal, { getEventStatus, formatDateString } from '@/components/events/EventDetailsModal'

export default function ClubDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [events, setEvents] = useState([])
  const [winners, setWinners] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [selectedModalEvent, setSelectedModalEvent] = useState(null)

  useEffect(() => {
    fetchClubDetails()
  }, [id, user])

  const fetchClubDetails = async () => {
    setLoading(true)
    try {
      const [clubRes, eventsRes, winnersRes] = await Promise.all([
        clubService.getClubById(id).catch(() => ({ data: null })),
        eventService.getEventsByClub(id).catch(() => ({ data: [] })),
        winnerService.getWinnersByClub(id).catch(() => ({ data: [] }))
      ])

      setClub(clubRes.data)
      setEvents(eventsRes.data || [])
      setWinners(winnersRes.data || [])

      if (user?.username) {
        const myRegsRes = await eventService.getMyRegistrations(user.username).catch(() => ({ data: [] }))
        setMyRegistrations(myRegsRes.data || [])
      }
    } catch (err) {
      console.error('Error loading club details:', err)
      toast.error('Failed to load club information')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterConfirm = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId)
      toast.success('Successfully registered!')
      setSelectedModalEvent(null)
      fetchClubDetails()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop'
  const fallbackBanner = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#F28D1E] font-bold animate-pulse flex items-center gap-2">
          <span>🏛️</span> Loading Club Information...
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="academic-card p-12 text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-xl font-headings font-bold text-[#202020]">Club Not Found</h2>
        <p className="text-xs text-[#666666]">The requested club record could not be retrieved.</p>
        <Link to={ROUTES.STUDENT.CLUBS} className="inline-block text-[#F28D1E] font-bold hover:underline">
          ← Back to Clubs Directory
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">
      {/* Back Navigation */}
      <Link
        to={ROUTES.STUDENT.CLUBS}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#F28D1E] hover:underline"
      >
        <span>←</span> Back to All Clubs
      </Link>

      {/* Restored Original Club Hero Banner & Header */}
      <div className="academic-card overflow-hidden shadow-md">
        <div className="h-60 sm:h-72 w-full bg-[#202020] relative overflow-hidden">
          <img
            src={club.bannerUrl || club.imageUrl || fallbackBanner}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = fallbackBanner
            }}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
            <div className="flex items-center gap-4">
              <img
                src={club.imageUrl || fallbackImage}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = fallbackImage
                }}
                alt={club.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F28D1E] shadow-xl bg-white shrink-0"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#F28D1E] uppercase tracking-wider">
                  {club.category || 'OFFICIAL CLUB'}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-headings font-extrabold text-white mt-1 leading-snug">
                  {club.name}
                </h1>
                <div className="text-xs text-white/80 font-medium">MVJCE Student Community</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white space-y-2">
          <h2 className="text-xs font-bold text-[#7B1113] uppercase tracking-wider">About This Club</h2>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-3xl">
            {club.description || 'Official college club organizing workshops, hackathons, competitions, and technical showcases throughout the academic year.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Hosted Events vs Side Section Winners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Hosted Events List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-2.5">
            <h2 className="text-xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
              <span>📅</span> Contests Hosted by {club.name}
            </h2>
            <span className="text-xs font-bold text-[#F28D1E]">
              {events.length} Events Total
            </span>
          </div>

          {events.length === 0 ? (
            <div className="academic-card p-8 text-center text-[#888888] text-sm">
              No events registered under this club at the moment.
            </div>
          ) : (
            <div className="space-y-5">
              {events.map((evt) => {
                const status = getEventStatus(evt)
                const isRegistered = myRegistrations.some((r) => r.eventId === evt.id)

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
                    className="academic-card p-6 space-y-4 cursor-pointer hover:border-[#F28D1E]/40 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${badgeStyle}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-[#888888] font-mono">Capacity: {evt.capacity || 'Unlimited'}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-headings font-bold text-[#202020] group-hover:text-[#F28D1E] transition-colors leading-snug">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-[#666666] mt-1 line-clamp-2 leading-relaxed">
                        {evt.description || 'Join this exciting contest hosted by ' + club.name}
                      </p>
                    </div>

                    {/* Registration Schedule */}
                    <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3 rounded-xl space-y-1 text-xs">
                      {status.code === 'UPCOMING' ? (
                        <>
                          <div className="flex items-center justify-between text-[#555555]">
                            <span>Reg Opens:</span>
                            <span className="font-semibold text-[#2563A6]">{formatDateString(evt.regStart) || 'TBA'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#555555]">
                            <span>Reg Closes:</span>
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

                    {/* Date & Venue Box */}
                    <div className="bg-white border border-[#E5E1DC] p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666]">📅 Event Date:</span>
                        {evt.eventDate ? (
                          <span className="text-[#202020] font-semibold">{formatDateString(evt.eventDate)}</span>
                        ) : (
                          <span className="text-[#B7791F] font-bold bg-[#B7791F]/10 px-2 py-0.5 rounded text-[10px]">
                            Date to be declared
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666]">📍 Venue:</span>
                        {evt.venue ? (
                          <span className="text-[#202020] font-semibold">{evt.venue}</span>
                        ) : (
                          <span className="text-[#888888] italic text-[11px]">
                            Venue TBA
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E1DC] flex items-center justify-between">
                      <span className="text-xs text-[#F28D1E] font-bold group-hover:underline">
                        View Details →
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

        {/* Side Section: Club Winners List */}
        <div className="lg:col-span-4 academic-card p-6 space-y-4">
          <h2 className="text-lg font-headings font-bold text-[#202020] flex items-center gap-2 border-b border-[#E5E1DC] pb-3">
            <span>🏆</span> Club Hall of Fame
          </h2>

          {winners.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#888888]">
              No winners announced for this club yet.
            </div>
          ) : (
            <div className="space-y-3">
              {winners.map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="bg-[#F7F6F3] border border-[#E5E1DC] p-3.5 rounded-xl flex items-center gap-3 hover:border-[#F28D1E]/30 transition-all"
                >
                  <div className="text-2xl">
                    {w.position === 'FIRST' ? '🥇' : w.position === 'SECOND' ? '🥈' : '🥉'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#202020] truncate">{w.fullName || w.username}</div>
                    <div className="text-[11px] text-[#7B1113] font-semibold truncate">{w.eventName}</div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">{w.positionDisplayName || w.position} Place</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EVENT DETAILS MODAL WITH REGISTRATION CONFIRMATION */}
      <EventDetailsModal
        event={selectedModalEvent}
        isOpen={Boolean(selectedModalEvent)}
        onClose={() => setSelectedModalEvent(null)}
        isRegistered={Boolean(selectedModalEvent && myRegistrations.some((r) => r.eventId === selectedModalEvent.id))}
        onRegisterConfirm={handleRegisterConfirm}
        clubName={club.name}
      />
    </div>
  )
}
