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
        <div className="text-primary font-bold animate-pulse flex items-center gap-2">
          <span>🏛️</span> Loading Club Info...
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="bg-slate-900 border border-white/10 p-12 rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Club Not Found</h2>
        <Link to={ROUTES.STUDENT.CLUBS} className="text-primary font-semibold hover:underline">
          ← Back to Clubs Directory
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none">
      {/* Back Link */}
      <Link to={ROUTES.STUDENT.CLUBS} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <span>←</span> Back to Clubs
      </Link>

      {/* Banner & Header */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-60 w-full bg-slate-950 relative">
          <img
            src={club.bannerUrl || club.imageUrl || fallbackBanner}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = fallbackBanner
            }}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={club.imageUrl || fallbackImage}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = fallbackImage
                }}
                alt={club.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary shadow-xl bg-slate-950"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary bg-primary/20 border border-primary/30 uppercase">
                  {club.category || 'OFFICIAL CLUB'}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white mt-1">{club.name}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">About the Club</h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {club.description || 'Official college club organizing workshops, hackathons, competitions, and technical showcases throughout the academic year.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Hosted Events vs Side Section Winners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Hosted Events List */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📅</span> Events Hosted by {club.name}
          </h2>

          {events.length === 0 ? (
            <div className="bg-slate-900 border border-white/5 p-8 rounded-2xl text-center text-slate-500 text-sm">
              No events hosted by this club yet.
            </div>
          ) : (
            <div className="space-y-5">
              {events.map((evt) => {
                const status = getEventStatus(evt)
                const isRegistered = myRegistrations.some((r) => r.eventId === evt.id)

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedModalEvent(evt)}
                    className="bg-slate-900 border border-white/10 hover:border-primary/50 p-5 rounded-2xl space-y-4 shadow-lg cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${status.style}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Capacity: {evt.capacity || '∞'}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{evt.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description || 'Join this exciting event!'}</p>
                    </div>

                    {/* Registration Schedule */}
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

                    {/* Date & Venue Box */}
                    <div className="bg-slate-950/60 border border-white/5 p-2.5 rounded-xl space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>📅 Event Date:</span>
                        {evt.eventDate ? (
                          <span className="text-slate-200 font-semibold">{formatDateString(evt.eventDate)}</span>
                        ) : (
                          <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                            Event date is not declared
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>📍 Venue:</span>
                        {evt.venue ? (
                          <span className="text-slate-200 font-semibold">{evt.venue}</span>
                        ) : (
                          <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                            Venue is not declared
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-primary font-semibold group-hover:underline">
                        View Details →
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedModalEvent(evt)
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

        {/* Side Section: Club Winners List */}
        <div className="lg:col-span-4 bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <span>🏆</span> Club Hall of Fame
          </h2>

          {winners.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">No winners announced for this club yet.</div>
          ) : (
            <div className="space-y-3">
              {winners.map((w, idx) => (
                <div key={w.id || idx} className="bg-slate-950/80 border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                  <div className="text-2xl">
                    {w.position === 'FIRST' ? '🥇' : w.position === 'SECOND' ? '🥈' : '🥉'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{w.fullName || w.username}</div>
                    <div className="text-[10px] text-amber-400 font-semibold truncate">{w.eventName}</div>
                    <div className="text-[9px] text-slate-500 uppercase">{w.positionDisplayName || w.position}</div>
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
