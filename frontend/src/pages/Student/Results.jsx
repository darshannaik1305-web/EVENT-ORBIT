import React, { useState, useEffect, useMemo } from 'react'
import winnerService from '@/services/winnerService'
import clubService from '@/services/clubService'
import eventService from '@/services/eventService'

export default function StudentResults() {
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [winners, setWinners] = useState([])

  const [selectedClubId, setSelectedClubId] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [clubsRes, eventsRes, winnersRes] = await Promise.all([
        clubService.getAllClubs().catch(() => ({ data: [] })),
        eventService.getAllEvents().catch(() => ({ data: [] })),
        winnerService.getAllWinners().catch(() => ({ data: [] })),
      ])

      setClubs(clubsRes.data || [])
      setEvents(eventsRes.data || [])
      setWinners(winnersRes.data || [])
    } catch (err) {
      console.error('Error fetching results page data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter events list dynamically based on selected club
  const availableEvents = useMemo(() => {
    if (!selectedClubId) return events
    return events.filter((e) => e.clubId === selectedClubId)
  }, [events, selectedClubId])

  // Reset event selection if selected club changes and selected event is not in that club
  const handleClubChange = (clubId) => {
    setSelectedClubId(clubId)
    if (clubId) {
      const clubEventIds = events.filter((e) => e.clubId === clubId).map((e) => e.id)
      if (selectedEventId && !clubEventIds.includes(selectedEventId)) {
        setSelectedEventId('')
      }
    }
  }

  // Filter winners list based on filters and search
  const filteredWinners = useMemo(() => {
    return winners.filter((w) => {
      // 1. Club filter
      if (selectedClubId) {
        if (w.clubId !== selectedClubId) return false
      }
      // 2. Event filter
      if (selectedEventId) {
        if (w.eventId !== selectedEventId) return false
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (w.fullName || '').toLowerCase().includes(q)
        const matchUser = (w.username || '').toLowerCase().includes(q)
        const matchEvent = (w.eventName || '').toLowerCase().includes(q)
        const matchClub = (w.clubName || '').toLowerCase().includes(q)
        const matchTeam = (w.teamName || '').toLowerCase().includes(q)
        if (!matchName && !matchUser && !matchEvent && !matchClub && !matchTeam) {
          return false
        }
      }
      return true
    })
  }, [winners, selectedClubId, selectedEventId, searchQuery])

  // Group winners by event for organized presentation
  const groupedByEvent = useMemo(() => {
    const map = new Map()
    filteredWinners.forEach((w) => {
      const eId = w.eventId || 'unknown'
      if (!map.has(eId)) {
        const evtObj = events.find((e) => e.id === eId)
        const targetClubId = evtObj?.clubId || w.clubId
        const foundClub = clubs.find((c) => c.id === targetClubId)
        const displayClubName = foundClub?.name || w.clubName || evtObj?.clubName || 'College Club'

        map.set(eId, {
          event: evtObj || {
            name: w.eventName || 'Campus Event',
            clubName: displayClubName,
          },
          eventName: w.eventName || evtObj?.name || 'Campus Event',
          clubName: displayClubName,
          items: [],
        })
      }
      map.get(eId).items.push(w)
    })
    return Array.from(map.values())
  }, [filteredWinners, events, clubs])

  // Latest declared winner from API data
  const latestWinner = winners.length > 0 ? winners[winners.length - 1] : null

  const positionBadge = {
    FIRST: {
      title: '1st Place Champion',
      medal: '🥇',
      border: 'border-[#D6A84F] bg-gradient-to-b from-[#D6A84F]/10 via-white to-white',
      badge: 'bg-[#D6A84F]/20 text-[#7B1113] border-[#D6A84F]/40 font-bold',
      textColor: 'text-[#7B1113]',
    },
    SECOND: {
      title: '2nd Place Runner-Up',
      medal: '🥈',
      border: 'border-[#E5E1DC] bg-gradient-to-b from-[#F7F6F3] via-white to-white',
      badge: 'bg-[#F1EFEB] text-[#555555] border-[#E5E1DC] font-bold',
      textColor: 'text-[#555555]',
    },
    THIRD: {
      title: '3rd Place 2nd Runner-Up',
      medal: '🥉',
      border: 'border-[#B7791F]/30 bg-gradient-to-b from-[#B7791F]/5 via-white to-white',
      badge: 'bg-[#B7791F]/15 text-[#B7791F] border-[#B7791F]/30 font-bold',
      textColor: 'text-[#B7791F]',
    },
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">
      {/* 1. Institutional Banner with Primary Orange Header */}
      <div className="bg-[#F28D1E] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold">
            <span>🏆 Official Victory Standings</span>
            <span>•</span>
            <span>MVJCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-white tracking-tight">
            Event Results & Champion Hall of Fame
          </h1>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
            Verified competition winners, victory podium positions, and official student achievements across all college clubs and technical societies.
          </p>
        </div>
      </div>

      {/* 3. Filters & Controls */}
      <div className="academic-card p-5 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#7B1113] flex items-center gap-2">
          <span>🔍</span> Filter & Search Victory Records
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Club Filter */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5 flex items-center justify-between">
              <span>Club Filter:</span>
              {selectedClubId && (
                <button
                  onClick={() => handleClubChange('')}
                  className="text-[10px] text-[#7B1113] hover:underline font-normal cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <select
              value={selectedClubId}
              onChange={(e) => handleClubChange(e.target.value)}
              className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#202020] outline-none focus:border-[#7B1113] cursor-pointer"
            >
              <option value="">All Clubs ({clubs.length})</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Filter */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5 flex items-center justify-between">
              <span>Event Filter:</span>
              {selectedEventId && (
                <button
                  onClick={() => setSelectedEventId('')}
                  className="text-[10px] text-[#7B1113] hover:underline font-normal cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#202020] outline-none focus:border-[#7B1113] cursor-pointer"
            >
              <option value="">All Events ({availableEvents.length})</option>
              {availableEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Field */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5">
              <span>Search Winner Name:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name or contest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-semibold text-[#202020] placeholder-[#888888] outline-none focus:border-[#7B1113]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-[#888888] hover:text-[#202020] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Results Section */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-[#7B1113] font-bold animate-pulse flex items-center gap-3 text-sm">
            <span className="text-2xl">🏆</span> Loading Verified Results...
          </div>
        </div>
      ) : groupedByEvent.length === 0 ? (
        <div className="academic-card p-12 text-center space-y-4">
          <div className="text-4xl">🏆</div>
          <h3 className="text-lg font-headings font-bold text-[#202020]">No Results Found</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            {selectedClubId || selectedEventId || searchQuery
              ? 'No declared winners match your selected filter criteria. Try clearing or adjusting your filters.'
              : 'No winner results have been published yet. Please check back after events conclude!'}
          </p>
          {(selectedClubId || selectedEventId || searchQuery) && (
            <button
              onClick={() => {
                setSelectedClubId('')
                setSelectedEventId('')
                setSearchQuery('')
              }}
              className="px-5 py-2.5 bg-[#7B1113] hover:bg-[#6F0F11] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByEvent.map(({ event, eventName, clubName, items }) => (
            <div
              key={event.id || eventName}
              className="academic-card p-6 md:p-8 space-y-6"
            >
              {/* Event Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1DC] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#7B1113]/10 border border-[#7B1113]/25 text-[#7B1113] text-[10px] font-bold uppercase">
                      🏛️ {clubName}
                    </span>
                    {event.type && (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#2563A6]/10 border border-[#2563A6]/20 text-[#2563A6] text-[10px] font-bold uppercase">
                        {event.type}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-headings font-bold text-[#202020] flex items-center gap-2">
                    <span>🎯</span> {eventName}
                  </h2>
                </div>
                <div className="text-xs text-[#888888] font-semibold">
                  Declared Champions: <span className="text-[#7B1113] font-bold">{items.length}</span>
                </div>
              </div>

              {/* Victory Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {['FIRST', 'SECOND', 'THIRD'].map((posKey) => {
                  const winner = items.find((w) => w.position === posKey)
                  const cfg = positionBadge[posKey]

                  if (!winner && items.length < 3 && !selectedEventId) {
                    return (
                      <div
                        key={posKey}
                        className="bg-[#F7F6F3] border border-dashed border-[#E5E1DC] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 opacity-60"
                      >
                        <div className="text-3xl">{cfg.medal}</div>
                        <div className="text-xs font-bold text-[#666666]">{cfg.title}</div>
                        <div className="text-[10px] text-[#888888]">Position Not Declared</div>
                      </div>
                    )
                  }

                  if (!winner) return null

                  const isGroup = Boolean(winner.teamName || (event && event.type === 'GROUP') || winner.eventType === 'GROUP')
                  const members = winner.teamMembers || []

                  return (
                    <div
                      key={winner.id || posKey}
                      className={`border rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm transition-all hover:-translate-y-1 ${cfg.border}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] uppercase border ${cfg.badge}`}
                          >
                            {cfg.title}
                          </span>
                          <span className="text-3xl">{cfg.medal}</span>
                        </div>

                        {isGroup ? (
                          <div className="space-y-3">
                            <div className="bg-[#D6A84F]/10 border border-[#D6A84F]/30 p-3 rounded-xl">
                              <div className="text-[10px] uppercase font-bold text-[#7B1113] tracking-wider">
                                🛡️ Winning Team
                              </div>
                              <h3 className="text-base font-headings font-extrabold text-[#202020] mt-0.5 leading-snug">
                                {winner.teamName || 'Group Team'}
                              </h3>
                            </div>

                            <div>
                              <div className="text-[10px] uppercase font-bold text-[#888888] mb-1.5 flex items-center justify-between">
                                <span>👥 Team Members</span>
                                {members.length > 0 && (
                                  <span className="text-[#888888] font-mono">({members.length})</span>
                                )}
                              </div>
                              <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
                                {members.length > 0 ? (
                                  members.map((m, mIdx) => (
                                    <div
                                      key={m.userId || mIdx}
                                      className="bg-white border border-[#E5E1DC] px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2"
                                    >
                                      <span className="font-bold text-[#202020] truncate">
                                        {m.fullName || 'Member'}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="bg-white border border-[#E5E1DC] px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2">
                                    <span className="font-bold text-[#202020] truncate">
                                      {winner.fullName || winner.username}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border border-[#E5E1DC] p-4 rounded-xl space-y-1 shadow-sm">
                            <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider">
                              👤 Victorious Participant
                            </div>
                            <h3 className="text-base font-headings font-extrabold text-[#202020] leading-snug">
                              {winner.fullName || winner.username}
                            </h3>
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-[#E5E1DC] flex items-center justify-between text-[11px] text-[#888888]">
                        <span>Status: Official Podium</span>
                        <span>🏆 Declared</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
