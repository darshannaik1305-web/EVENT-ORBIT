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

  const positionBadge = {
    FIRST: {
      title: '1st Place Winner',
      medal: '🥇',
      border: 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textColor: 'text-amber-300',
      glow: 'shadow-amber-500/10',
    },
    SECOND: {
      title: '2nd Place Runner-Up',
      medal: '🥈',
      border: 'border-slate-300/40 bg-gradient-to-b from-slate-300/10 via-slate-900 to-slate-900',
      badge: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
      textColor: 'text-slate-200',
      glow: 'shadow-slate-300/10',
    },
    THIRD: {
      title: '3rd Place 2nd Runner-Up',
      medal: '🥉',
      border: 'border-orange-500/40 bg-gradient-to-b from-orange-500/10 via-slate-900 to-slate-900',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      textColor: 'text-orange-300',
      glow: 'shadow-orange-500/10',
    },
  }

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
              <span>🏆 Official Declarations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Event Results & Champion Hall of Fame
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Explore verified event winners, victory podiums, and top performers across all clubs and competitions.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="text-3xl">👑</div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Champions</div>
              <div className="text-xl font-extrabold text-amber-300">{filteredWinners.length} Winners</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters & Controls */}
      <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>🔍</span> Filter & Search Results
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SEPARATE CLUB FILTER */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>🏫 Separate Club Filter:</span>
              {selectedClubId && (
                <button
                  onClick={() => handleClubChange('')}
                  className="text-[10px] text-purple-400 hover:underline font-normal"
                >
                  Clear
                </button>
              )}
            </label>
            <select
              value={selectedClubId}
              onChange={(e) => handleClubChange(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">🏛️ All Clubs ({clubs.length})</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SEPARATE EVENT FILTER */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>📅 Separate Event Filter:</span>
              {selectedEventId && (
                <button
                  onClick={() => setSelectedEventId('')}
                  className="text-[10px] text-purple-400 hover:underline font-normal"
                >
                  Clear
                </button>
              )}
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">🎯 All Events ({availableEvents.length})</option>
              {availableEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH FIELD */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              <span>🔎 Search Winner or USN:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, USN, event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Results Section */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-amber-400 font-bold animate-pulse flex items-center gap-3 text-sm">
            <span className="text-2xl">🏆</span> Loading Official Results...
          </div>
        </div>
      ) : groupedByEvent.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="text-5xl">🏆</div>
          <h3 className="text-lg font-bold text-white">No Results Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {selectedClubId || selectedEventId || searchQuery
              ? 'No declared winners match your selected filter criteria. Try clearing or adjusting your filters.'
              : 'No winner results have been published yet. Please check back after events complete!'}
          </p>
          {(selectedClubId || selectedEventId || searchQuery) && (
            <button
              onClick={() => {
                setSelectedClubId('')
                setSelectedEventId('')
                setSearchQuery('')
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30"
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
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl"
            >
              {/* Event Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold uppercase">
                      🏛️ {clubName}
                    </span>
                    {event.type && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-extrabold uppercase">
                        {event.type}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>🎯</span> {eventName}
                  </h2>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Declared Champions: <span className="text-amber-400 font-bold">{items.length}</span>
                </div>
              </div>

              {/* Victory Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {['FIRST', 'SECOND', 'THIRD'].map((posKey) => {
                  const winner = items.find((w) => w.position === posKey)
                  const cfg = positionBadge[posKey]

                  if (!winner && items.length < 3 && !selectedEventId) {
                    // Render vacant position subtle placeholder
                    return (
                      <div
                        key={posKey}
                        className="bg-slate-950/40 border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2 opacity-50"
                      >
                        <div className="text-2xl">{cfg.medal}</div>
                        <div className="text-xs font-bold text-slate-400">{cfg.title}</div>
                        <div className="text-[10px] text-slate-600">Position Not Declared</div>
                      </div>
                    )
                  }

                  if (!winner) return null

                  const isGroup = Boolean(winner.teamName || (event && event.type === 'GROUP') || winner.eventType === 'GROUP')
                  const members = winner.teamMembers || []

                  return (
                    <div
                      key={winner.id || posKey}
                      className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all hover:scale-[1.01] ${cfg.border} ${cfg.glow}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${cfg.badge}`}
                          >
                            {cfg.title}
                          </span>
                          <span className="text-3xl">{cfg.medal}</span>
                        </div>

                        {isGroup ? (
                          /* Group Event Winner Layout */
                          <div className="space-y-3">
                            {/* Team Name FIRST */}
                            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                              <div className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                                🛡️ Winning Team
                              </div>
                              <h3 className="text-base font-black text-white mt-0.5 leading-snug">
                                {winner.teamName || 'Group Team'}
                              </h3>
                            </div>

                            {/* Team Members List (Scrollable if many members) */}
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                                <span>👥 Team Members</span>
                                {members.length > 0 && (
                                  <span className="text-slate-500 font-mono">({members.length})</span>
                                )}
                              </div>
                              <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-purple-500/30">
                                {members.length > 0 ? (
                                  members.map((m, mIdx) => (
                                    <div
                                      key={m.userId || mIdx}
                                      className="bg-slate-950/80 border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2"
                                    >
                                      <span className="font-bold text-slate-200 truncate">
                                        {m.fullName || 'Member'}
                                      </span>
                                      <span className="font-mono text-[11px] font-extrabold text-amber-300 shrink-0">
                                        USN: {m.userId}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  /* Fallback to leader if team members array is not provided */
                                  <div className="bg-slate-950/80 border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2">
                                    <span className="font-bold text-slate-200 truncate">
                                      {winner.fullName || winner.username}
                                    </span>
                                    <span className="font-mono text-[11px] font-extrabold text-amber-300 shrink-0">
                                      USN: {winner.username}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Individual Event Winner Layout */
                          <div className="bg-slate-950/80 border border-white/5 p-3.5 rounded-xl space-y-1">
                            <div className="text-[10px] uppercase font-extrabold text-purple-400 tracking-wider">
                              👤 Participant
                            </div>
                            <h3 className="text-base font-extrabold text-white leading-snug">
                              {winner.fullName || winner.username}
                            </h3>
                            <div className={`text-xs font-mono font-bold mt-0.5 ${cfg.textColor}`}>
                              USN: {winner.username}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Status: Verified Champion</span>
                        <span>🏆 Result</span>
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
