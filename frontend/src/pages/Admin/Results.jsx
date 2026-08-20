import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import eventService from '@/services/eventService'
import winnerService from '@/services/winnerService'
import teamService from '@/services/teamService'
import ConfirmModal from '@/components/common/ConfirmModal'

export default function AdminResults() {
  const { myClubs, selectedClubId, loadingClubs } = useOutletContext() || { myClubs: [], selectedClubId: '', loadingClubs: false }

  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [winners, setWinners] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingWinners, setLoadingWinners] = useState(false)

  // Form Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [winnerPosition, setWinnerPosition] = useState('FIRST')
  const [selectedParticipantUsername, setSelectedParticipantUsername] = useState('')
  const [deleteTargetWinner, setDeleteTargetWinner] = useState(null)

  useEffect(() => {
    if (!loadingClubs) {
      fetchEvents()
    }
  }, [selectedClubId, myClubs, loadingClubs])

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId)
    } else {
      setWinners([])
      setRegistrations([])
      setTeams([])
    }
  }, [selectedEventId])

  const fetchEvents = async () => {
    if (loadingClubs) return

    setLoadingEvents(true)
    try {
      let list = []
      if (selectedClubId) {
        const res = await eventService.getEventsByClub(selectedClubId)
        const raw = res.data || []
        list = raw.filter((e) => e.clubId === selectedClubId)
      } else if (myClubs.length > 0) {
        const res = await eventService.getAllEvents()
        const allList = res.data || []
        list = allList.filter((e) => myClubs.some((c) => c.id === e.clubId))
      }
      setEvents(list)
      if (list.length > 0) {
        setSelectedEventId((prev) => (list.some((e) => e.id === prev) ? prev : list[0].id))
      } else {
        setSelectedEventId('')
      }
    } catch (err) {
      console.error('Error fetching events for results view:', err)
      toast.error('Failed to load events')
    } finally {
      setLoadingEvents(false)
    }
  }

  const fetchEventData = async (eventId) => {
    setLoadingWinners(true)
    try {
      const [winRes, regRes, teamsRes] = await Promise.all([
        winnerService.getWinnersByEvent(eventId).catch(() => ({ data: [] })),
        eventService.listRegistrations(eventId).catch(() => ({ data: [] })),
        teamService.getTeamsByEvent(eventId).catch(() => ({ data: [] })),
      ])
      setWinners(winRes.data || [])
      setRegistrations(regRes.data || [])
      setTeams(teamsRes.data || [])
    } catch (err) {
      console.error('Error loading winners data:', err)
      toast.error('Failed to load event winners')
    } finally {
      setLoadingWinners(false)
    }
  }

  const handleAddWinner = async (e) => {
    e.preventDefault()
    if (!selectedEventId) {
      toast.error('Please select an event')
      return
    }
    if (!selectedParticipantUsername) {
      toast.error('Please select a candidate or team')
      return
    }

    try {
      const payload = {
        username: selectedParticipantUsername,
        position: winnerPosition,
      }

      await winnerService.addWinner(selectedEventId, payload)
      toast.success('Winner declared successfully!')
      setShowAddModal(false)
      setSelectedParticipantUsername('')
      fetchEventData(selectedEventId)
    } catch (err) {
      console.error('Error declaring winner:', err)
      toast.error(err.response?.data?.message || 'Failed to declare winner')
    }
  }

  const handleConfirmDeleteWinner = async () => {
    if (!deleteTargetWinner) return
    try {
      await winnerService.deleteWinner(deleteTargetWinner.id)
      toast.success('Winner record deleted')
      setDeleteTargetWinner(null)
      fetchEventData(selectedEventId)
    } catch (err) {
      console.error('Error deleting winner:', err)
      toast.error(err.response?.data?.message || 'Failed to delete winner')
    }
  }

  const currentEvent = events.find((e) => e.id === selectedEventId)
  const activeClubObj = myClubs.find((c) => c.id === selectedClubId)
  const isGroupEvent = currentEvent?.type === 'GROUP'

  // Positions map
  const positionBadge = {
    FIRST: { label: '🥇 1st Place (Winner)', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    SECOND: { label: '🥈 2nd Place (Runner-up)', style: 'bg-slate-300/20 text-slate-200 border-slate-300/40' },
    THIRD: { label: '🥉 3rd Place (2nd Runner-up)', style: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-slate-900 border border-purple-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>🏆</span> Publish Event Winners
            </h1>
            {activeClubObj && (
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-full">
                {activeClubObj.name}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Declare 1st, 2nd, and 3rd place champions from event participants and publish results.
          </p>
        </div>

        {selectedEventId && (
          <button
            onClick={() => {
              setSelectedParticipantUsername('')
              setWinnerPosition('FIRST')
              setShowAddModal(true)
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <span>👑</span> Declare Winner
          </button>
        )}
      </div>

      {/* Event Selection Bar */}
      <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap">
            Select Event:
          </span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={loadingEvents || events.length === 0}
            className="w-full sm:w-80 bg-slate-950 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-bold text-purple-300 outline-none focus:border-purple-500 cursor-pointer"
          >
            {events.length === 0 ? (
              <option value="">No events available</option>
            ) : (
              events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-slate-900 text-white">
                  {evt.name} ({evt.type === 'GROUP' ? 'GROUP TEAM' : 'INDIVIDUAL'})
                </option>
              ))
            )}
          </select>
        </div>

        {currentEvent && (
          <div className="text-xs text-slate-400">
            Registered {isGroupEvent ? 'Teams' : 'Candidates'}:{' '}
            <span className="text-purple-300 font-bold">{isGroupEvent ? teams.length : registrations.length}</span>
          </div>
        )}
      </div>

      {/* Winners Podium Display */}
      {!selectedEventId ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center text-slate-400">
          Select an event above to view and declare winners.
        </div>
      ) : loadingWinners ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-amber-400 font-bold animate-pulse flex items-center gap-2">
            <span>👑</span> Loading Winners Podium...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {winners.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-xl">
              <div className="text-4xl">🏆</div>
              <div className="text-lg font-bold text-white">No Winners Declared Yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No victory positions have been assigned for "{currentEvent?.name}". Select registered {isGroupEvent ? 'teams' : 'participants'} and assign podium places!
              </p>
              <button
                onClick={() => {
                  setSelectedParticipantUsername('')
                  setWinnerPosition('FIRST')
                  setShowAddModal(true)
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                Declare 1st Place Winner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['FIRST', 'SECOND', 'THIRD'].map((posKey) => {
                const w = winners.find((win) => win.position === posKey)
                const badge = positionBadge[posKey]

                return (
                  <div
                    key={posKey}
                    className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden ${
                      w ? 'border-amber-500/40' : 'border-white/5 opacity-70'
                    }`}
                  >
                    <div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase border ${badge.style} mb-4`}>
                        {badge.label}
                      </div>

                      {w ? (
                        <div className="space-y-3">
                          {isGroupEvent || w.teamName ? (
                            /* Group Event Winner Layout */
                            <div className="space-y-3">
                              {/* Team Name FIRST */}
                              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                                <div className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                                  🛡️ Winning Team
                                </div>
                                <h3 className="text-base font-black text-white mt-0.5 leading-snug">
                                  {w.teamName || 'Group Team'}
                                </h3>
                              </div>

                              {/* Team Members List (Scrollable if many members) */}
                              <div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                                  <span>👥 Team Members</span>
                                </div>
                                <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-purple-500/30">
                                  {(() => {
                                    const matchedTeam = teams.find(
                                      (t) =>
                                        t.leaderId?.toUpperCase() === w.username?.toUpperCase() ||
                                        t.teamName?.toUpperCase() === w.teamName?.toUpperCase()
                                    )
                                    const mList = w.teamMembers || matchedTeam?.members || []
                                    if (mList.length > 0) {
                                      return mList.map((m, mIdx) => (
                                        <div
                                          key={m.userId || m.id || mIdx}
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
                                    }
                                    return (
                                      <div className="bg-slate-950/80 border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2">
                                        <span className="font-bold text-slate-200 truncate">
                                          {w.fullName || w.username}
                                        </span>
                                        <span className="font-mono text-[11px] font-extrabold text-amber-300 shrink-0">
                                          USN: {w.username}
                                        </span>
                                      </div>
                                    )
                                  })()}
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
                                {w.fullName || w.username}
                              </h3>
                              <div className="text-xs font-mono text-purple-300 font-bold">
                                USN: {w.username}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                          <div>Position Vacant</div>
                          <button
                            onClick={() => {
                              setWinnerPosition(posKey)
                              setSelectedParticipantUsername('')
                              setShowAddModal(true)
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                          >
                            Assign {posKey} Place
                          </button>
                        </div>
                      )}
                    </div>

                    {w && (
                      <div className="pt-3 border-t border-white/5 flex justify-end">
                        <button
                          onClick={() => setDeleteTargetWinner({ id: w.id, name: w.fullName || w.username })}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/30 transition-all"
                        >
                          Remove Winner
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* DECLARE WINNER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>👑</span> Assign Winner Position
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Select position and candidate for {currentEvent?.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddWinner} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Position Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Victory Position *</label>
                <select
                  value={winnerPosition}
                  onChange={(e) => setWinnerPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="FIRST">🥇 1st Place (FIRST)</option>
                  <option value="SECOND">🥈 2nd Place (SECOND)</option>
                  <option value="THIRD">🥉 3rd Place (THIRD)</option>
                </select>
              </div>

              {/* Candidate / Team Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isGroupEvent ? 'Select Registered Team *' : 'Select Candidate *'}
                </label>
                {isGroupEvent ? (
                  teams.length === 0 ? (
                    <div className="text-amber-400 text-xs py-2">
                      No registered teams found for this group event. Teams must register first before winners can be assigned.
                    </div>
                  ) : (
                    <select
                      value={selectedParticipantUsername}
                      onChange={(e) => setSelectedParticipantUsername(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">-- Choose Registered Team --</option>
                      {teams.map((t) => (
                        <option key={t.id || t.teamName} value={t.leaderId}>
                          🛡️ {t.teamName} (Leader USN: {t.leaderId}) - {t.members ? t.members.length : 1} Members
                        </option>
                      ))}
                    </select>
                  )
                ) : registrations.length === 0 ? (
                  <div className="text-amber-400 text-xs py-2">
                    No registered participants found for this event. Participants must register first before winners can be assigned.
                  </div>
                ) : (
                  <select
                    value={selectedParticipantUsername}
                    onChange={(e) => setSelectedParticipantUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose Registered Participant --</option>
                    {registrations.map((reg) => (
                      <option key={reg.id || reg.username} value={reg.username}>
                        {reg.fullName} ({reg.username}) - {reg.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </form>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddWinner}
                disabled={isGroupEvent ? teams.length === 0 : registrations.length === 0}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                Save Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE WINNER MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetWinner)}
        title="Remove Winner?"
        message={`Are you sure you want to remove the winner declaration for "${deleteTargetWinner?.name}"?`}
        confirmText="Yes, Remove Winner"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteWinner}
        onClose={() => setDeleteTargetWinner(null)}
      />
    </div>
  )
}
