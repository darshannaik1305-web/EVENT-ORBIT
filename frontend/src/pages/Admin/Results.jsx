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

    const payload = {
      eventId: selectedEventId,
      username: selectedParticipantUsername,
      position: winnerPosition,
    }

    try {
      await winnerService.declareWinner(payload)
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
      await winnerService.removeWinner(deleteTargetWinner.id)
      toast.success('Winner removed successfully')
      setDeleteTargetWinner(null)
      fetchEventData(selectedEventId)
    } catch (err) {
      console.error('Error removing winner:', err)
      toast.error(err.response?.data?.message || 'Failed to remove winner')
    }
  }

  const currentEvent = events.find((e) => e.id === selectedEventId)
  const activeClubObj = myClubs.find((c) => c.id === selectedClubId)
  const isGroupEvent = currentEvent?.type === 'GROUP'

  // Positions map
  const positionBadge = {
    FIRST: { label: '🥇 1st Place (Winner)', style: 'bg-[#D6A84F]/15 text-[#B7791F] border-[#D6A84F]/40' },
    SECOND: { label: '🥈 2nd Place (Runner-up)', style: 'bg-[#F1EFEB] text-[#555555] border-[#E5E1DC]' },
    THIRD: { label: '🥉 3rd Place (2nd Runner-up)', style: 'bg-[#B7791F]/15 text-[#B7791F] border-[#B7791F]/30' },
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#F28D1E]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
              <span>🏆</span> Publish Event Winners
            </h1>
            {activeClubObj && (
              <span className="px-3 py-1 bg-[#7B1113]/10 border border-[#7B1113]/25 text-[#7B1113] text-xs font-bold rounded-full">
                {activeClubObj.name}
              </span>
            )}
          </div>
          <p className="text-[#666666] text-xs sm:text-sm mt-1">
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
            className="px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold text-xs rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>👑</span> Declare Winner
          </button>
        )}
      </div>

      {/* Event Selection Bar */}
      <div className="academic-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#555555] uppercase tracking-wider whitespace-nowrap">
            Select Event:
          </span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={loadingEvents || events.length === 0}
            className="w-full sm:w-80 bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-xs font-bold text-[#202020] outline-none focus:border-[#F28D1E] cursor-pointer shadow-sm"
          >
            {events.length === 0 ? (
              <option value="">No events available</option>
            ) : (
              events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.type === 'GROUP' ? 'GROUP TEAM' : 'INDIVIDUAL'})
                </option>
              ))
            )}
          </select>
        </div>

        {currentEvent && (
          <div className="text-xs text-[#666666]">
            Registered {isGroupEvent ? 'Teams' : 'Candidates'}:{' '}
            <span className="text-[#F28D1E] font-bold">{isGroupEvent ? teams.length : registrations.length}</span>
          </div>
        )}
      </div>

      {/* Winners Podium Display */}
      {!selectedEventId ? (
        <div className="academic-card p-12 text-center text-[#888888]">
          Select an event above to view and declare winners.
        </div>
      ) : loadingWinners ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-[#F28D1E] font-bold animate-pulse flex items-center gap-2">
            <span>👑</span> Loading Winners Podium...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {winners.length === 0 ? (
            <div className="academic-card p-12 text-center space-y-4">
              <div className="text-4xl">🏆</div>
              <div className="text-lg font-headings font-bold text-[#202020]">No Winners Declared Yet</div>
              <p className="text-xs text-[#666666] max-w-md mx-auto">
                No victory positions have been assigned for "{currentEvent?.name}". Select registered {isGroupEvent ? 'teams' : 'participants'} and assign podium places!
              </p>
              <button
                onClick={() => {
                  setSelectedParticipantUsername('')
                  setWinnerPosition('FIRST')
                  setShowAddModal(true)
                }}
                className="px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
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
                    className={`academic-card p-6 flex flex-col justify-between space-y-4 ${
                      w ? 'border-2 border-[#D6A84F]/50 shadow-md' : 'opacity-70'
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
                              <div className="bg-[#D6A84F]/10 border border-[#D6A84F]/30 p-3 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-[#B7791F] tracking-wider">
                                  🛡️ Winning Team
                                </div>
                                <h3 className="text-base font-headings font-bold text-[#202020] mt-0.5 leading-snug">
                                  {w.teamName || 'Group Team'}
                                </h3>
                              </div>

                              {/* Team Members List */}
                              <div>
                                <div className="text-[10px] uppercase font-bold text-[#888888] mb-1.5 flex items-center justify-between">
                                  <span>👥 Team Members</span>
                                </div>
                                <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
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
                                          className="bg-[#F7F6F3] border border-[#E5E1DC] px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2"
                                        >
                                          <span className="font-bold text-[#202020] truncate">
                                            {m.fullName || 'Member'}
                                          </span>
                                          <span className="font-mono text-[11px] font-bold text-[#F28D1E] shrink-0">
                                            USN: {m.userId}
                                          </span>
                                        </div>
                                      ))
                                    }
                                    return (
                                      <div className="bg-[#F7F6F3] border border-[#E5E1DC] px-3 py-2 rounded-xl flex items-center justify-between text-xs gap-2">
                                        <span className="font-bold text-[#202020] truncate">
                                          {w.fullName || w.username}
                                        </span>
                                        <span className="font-mono text-[11px] font-bold text-[#F28D1E] shrink-0">
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
                            <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3.5 rounded-xl space-y-1">
                              <div className="text-[10px] uppercase font-bold text-[#F28D1E] tracking-wider">
                                👤 Participant
                              </div>
                              <h3 className="text-base font-headings font-bold text-[#202020] leading-snug">
                                {w.fullName || w.username}
                              </h3>
                              <div className="text-xs font-mono text-[#F28D1E] font-bold">
                                USN: {w.username}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-[#888888] space-y-2">
                          <div>Position Vacant</div>
                          <button
                            onClick={() => {
                              setWinnerPosition(posKey)
                              setSelectedParticipantUsername('')
                              setShowAddModal(true)
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-[#F1EFEB] text-[#202020] text-[11px] font-bold rounded-lg border border-[#E5E1DC] transition-all cursor-pointer shadow-sm"
                          >
                            Assign {posKey} Place
                          </button>
                        </div>
                      )}
                    </div>

                    {w && (
                      <div className="pt-3 border-t border-[#E5E1DC] flex justify-end">
                        <button
                          onClick={() => setDeleteTargetWinner({ id: w.id, name: w.fullName || w.username })}
                          className="px-3 py-1 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] text-xs font-semibold rounded-lg border border-[#B42318]/20 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E1DC] rounded-3xl p-6 md:p-8 max-w-lg w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
                  <span>👑</span> Assign Winner Position
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">Select position and candidate for {currentEvent?.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#888888] hover:text-[#202020] text-xl font-bold p-1 rounded-lg hover:bg-[#F1EFEB] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddWinner} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Position Selector */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Victory Position *</label>
                <select
                  value={winnerPosition}
                  onChange={(e) => setWinnerPosition(e.target.value)}
                  className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E]"
                >
                  <option value="FIRST">🥇 1st Place (FIRST)</option>
                  <option value="SECOND">🥈 2nd Place (SECOND)</option>
                  <option value="THIRD">🥉 3rd Place (THIRD)</option>
                </select>
              </div>

              {/* Candidate / Team Selector */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">
                  {isGroupEvent ? 'Select Registered Team *' : 'Select Candidate *'}
                </label>
                {isGroupEvent ? (
                  teams.length === 0 ? (
                    <div className="text-[#B7791F] text-xs py-2">
                      No registered teams found for this group event. Teams must register first before winners can be assigned.
                    </div>
                  ) : (
                    <select
                      value={selectedParticipantUsername}
                      onChange={(e) => setSelectedParticipantUsername(e.target.value)}
                      required
                      className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E] cursor-pointer"
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
                  <div className="text-[#B7791F] text-xs py-2">
                    No registered participants found for this event. Participants must register first before winners can be assigned.
                  </div>
                ) : (
                  <select
                    value={selectedParticipantUsername}
                    onChange={(e) => setSelectedParticipantUsername(e.target.value)}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E] cursor-pointer"
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
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E1DC] shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white border border-[#E5E1DC] text-[#555555] font-semibold rounded-xl hover:bg-[#F1EFEB] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddWinner}
                disabled={isGroupEvent ? teams.length === 0 : registrations.length === 0}
                className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all disabled:opacity-50 cursor-pointer"
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
