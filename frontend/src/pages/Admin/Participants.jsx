import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import eventService from '@/services/eventService'
import teamService from '@/services/teamService'
import { ROUTES } from '@/config/routes'
import ConfirmModal from '@/components/common/ConfirmModal'

export default function AdminParticipants() {
  const { myClubs, selectedClubId } = useOutletContext() || { myClubs: [], selectedClubId: '' }
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [removeTargetReg, setRemoveTargetReg] = useState(null)
  const [removeTargetTeam, setRemoveTargetTeam] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [selectedClubId, myClubs])

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId)
    } else {
      setRegistrations([])
      setTeams([])
    }
  }, [selectedEventId])

  const fetchEvents = async () => {
    setLoadingEvents(true)
    try {
      let res
      if (selectedClubId) {
        res = await eventService.getEventsByClub(selectedClubId)
      } else {
        res = await eventService.getAllEvents()
      }
      let list = res.data || []
      if (selectedClubId) {
        list = list.filter((e) => e.clubId === selectedClubId)
      } else if (myClubs.length > 0) {
        list = list.filter((e) => myClubs.some((c) => c.id === e.clubId))
      }
      setEvents(list)
      if (list.length > 0) {
        setSelectedEventId(list[0].id)
      } else {
        setSelectedEventId('')
      }
    } catch (err) {
      console.error('Error fetching events for participants view:', err)
      toast.error('Failed to load events')
    } finally {
      setLoadingEvents(false)
    }
  }

  const fetchRegistrations = async (eventId) => {
    setLoadingRegistrations(true)
    try {
      const [regRes, teamsRes] = await Promise.all([
        eventService.listRegistrations(eventId).catch(() => ({ data: [] })),
        teamService.getTeamsByEvent(eventId).catch(() => ({ data: [] })),
      ])
      setRegistrations(regRes.data || [])
      setTeams(teamsRes.data || [])
    } catch (err) {
      console.error('Error fetching registrations & teams:', err)
      toast.error('Failed to load participants for event')
    } finally {
      setLoadingRegistrations(false)
    }
  }

  const handleConfirmRemove = async () => {
    if (!removeTargetReg) return
    try {
      await eventService.removeRegistration(selectedEventId, removeTargetReg.id)
      toast.success('Participant removed')
      setRemoveTargetReg(null)
      fetchRegistrations(selectedEventId)
    } catch (err) {
      console.error('Error removing participant:', err)
      toast.error(err.response?.data?.message || 'Failed to remove participant')
    }
  }

  const handleConfirmRemoveTeam = async () => {
    if (!removeTargetTeam) return
    try {
      await teamService.deleteTeam(removeTargetTeam.id)
      toast.success(`Team "${removeTargetTeam.name}" removed`)
      setRemoveTargetTeam(null)
      fetchRegistrations(selectedEventId)
    } catch (err) {
      console.error('Error removing team:', err)
      toast.error(err.response?.data?.message || 'Failed to remove team')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const currentEvent = events.find((e) => e.id === selectedEventId)
  const activeClubObj = myClubs.find((c) => c.id === selectedClubId)
  const isGroupEvent = currentEvent?.type === 'GROUP'

  // Filter individual registrations by search term
  const filteredRegistrations = registrations.filter((r) => {
    const term = searchTerm.toLowerCase()
    return (
      (r.fullName && r.fullName.toLowerCase().includes(term)) ||
      (r.username && r.username.toLowerCase().includes(term)) ||
      (r.email && r.email.toLowerCase().includes(term)) ||
      (r.mobile && r.mobile.includes(term))
    )
  })

  // Filter teams by search term
  const filteredTeams = teams.filter((t) => {
    const term = searchTerm.toLowerCase()
    const matchesTeamName = t.teamName && t.teamName.toLowerCase().includes(term)
    const matchesLeader = t.leaderId && t.leaderId.toLowerCase().includes(term)
    const matchesMember = (t.members || []).some(
      (m) =>
        (m.fullName && m.fullName.toLowerCase().includes(term)) ||
        (m.userId && m.userId.toLowerCase().includes(term)) ||
        (m.email && m.email.toLowerCase().includes(term)) ||
        (m.mobile && m.mobile.includes(term))
    )
    return matchesTeamName || matchesLeader || matchesMember
  })

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-slate-900 border border-purple-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>📋</span> Event Registration Review
            </h1>
            {activeClubObj && (
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-full">
                {activeClubObj.name}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            View participant rosters, team member USNs, student details, and registration history.
          </p>
        </div>

        {selectedEventId && (
          <button
            onClick={() => navigate(ROUTES.ADMIN.RESULTS)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <span>🏆</span> Declare Event Winners
          </button>
        )}
      </div>

      {/* Select Event Bar */}
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
          <div className="flex items-center gap-4 text-xs text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
            <div>
              <span className="text-slate-500">Type:</span>{' '}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isGroupEvent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                {isGroupEvent ? `Team (${currentEvent.minMembers || 1}-${currentEvent.maxMembers || 4} Members)` : 'Individual'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Venue:</span>{' '}
              {currentEvent.venue ? (
                <span className="text-slate-200 font-semibold">{currentEvent.venue}</span>
              ) : (
                <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                  Venue is not declared
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Participant Roster Table / List */}
      {!selectedEventId ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center text-slate-400">
          Select an event above to view registered participants.
        </div>
      ) : loadingRegistrations ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-purple-400 font-bold animate-pulse flex items-center gap-2">
            <span>⚡</span> Loading Participants & Team Rosters...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls & Search Bar */}
          <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isGroupEvent ? '👥 Registered Teams' : '👤 Registered Participants'}</span> ({isGroupEvent ? teams.length : registrations.length})
              </h2>
              <p className="text-xs text-slate-400">
                {isGroupEvent ? `Total registered teams for ${currentEvent?.name}` : `Total registered students for ${currentEvent?.name}`}
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search team, USN, name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* GROUP EVENT TEAM ROSTER VIEW */}
          {isGroupEvent ? (
            teams.length === 0 ? (
              <div className="bg-slate-900 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-sm space-y-2">
                <div className="text-3xl">👥</div>
                <div className="text-slate-300 font-bold">No Teams Registered Yet</div>
                <p className="text-xs text-slate-500">Students registering for {currentEvent?.name} will create their teams here.</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="bg-slate-900 border border-white/5 p-8 rounded-2xl text-center text-slate-500 text-xs">
                No teams matching search term "{searchTerm}".
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTeams.map((t, tIdx) => {
                  const membersList = t.members || []
                  const leaderMember = membersList.find((m) => m.userId?.toUpperCase() === t.leaderId?.toUpperCase())

                  return (
                    <div
                      key={t.id || tIdx}
                      className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                    >
                      {/* Team Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-2xl">
                            🛡️
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-white">{t.teamName}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                TEAM #{tIdx + 1} ({membersList.length} Members)
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>👑 Leader USN: <span className="text-purple-300 font-bold font-mono">{t.leaderId}</span></span>
                              {leaderMember && <span>({leaderMember.fullName})</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setRemoveTargetTeam({ id: t.id, name: t.teamName })}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all"
                          >
                            Remove Team
                          </button>
                        </div>
                      </div>

                      {/* Team Members List */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
                              <th className="p-2.5">Role</th>
                              <th className="p-2.5">Student USN</th>
                              <th className="p-2.5">Full Name</th>
                              <th className="p-2.5">Email Address</th>
                              <th className="p-2.5">Mobile Number</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {membersList.map((m, mIdx) => {
                              const isLeader = m.userId?.toUpperCase() === t.leaderId?.toUpperCase()

                              return (
                                <tr key={m.id || mIdx} className="hover:bg-white/[0.02]">
                                  <td className="p-2.5">
                                    {isLeader ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-max">
                                        👑 Leader
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-white/5 w-max">
                                        Member #{mIdx + 1}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-purple-300">{m.userId}</td>
                                  <td className="p-2.5 font-bold text-white">{m.fullName || 'Registered Student'}</td>
                                  <td className="p-2.5 text-slate-300">{m.email || 'N/A'}</td>
                                  <td className="p-2.5 text-slate-300 font-mono">{m.mobile || 'N/A'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            /* INDIVIDUAL EVENT PARTICIPANTS TABLE */
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
              {registrations.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No participants have registered for this event yet.
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No participants matching "{searchTerm}".
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/50">
                        <th className="p-3">#</th>
                        <th className="p-3">USN / Username</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Mobile Number</th>
                        <th className="p-3">Registered On</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRegistrations.map((reg, idx) => (
                        <tr key={reg.id || idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3 font-bold text-purple-300 font-mono">{reg.username}</td>
                          <td className="p-3 font-bold text-white">{reg.fullName}</td>
                          <td className="p-3 text-slate-300">{reg.email}</td>
                          <td className="p-3 text-slate-300 font-mono">{reg.mobile}</td>
                          <td className="p-3 text-slate-400">{formatDate(reg.registrationTime) || 'Registered'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setRemoveTargetReg({ id: reg.id, name: reg.fullName })}
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[11px] font-semibold transition-all"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM REMOVE PARTICIPANT MODAL */}
      <ConfirmModal
        isOpen={Boolean(removeTargetReg)}
        title="Remove Participant?"
        message={`Are you sure you want to remove "${removeTargetReg?.name}" from this event? Their registration record will be deleted.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveTargetReg(null)}
      />

      {/* CONFIRM REMOVE TEAM MODAL */}
      <ConfirmModal
        isOpen={Boolean(removeTargetTeam)}
        title="Remove Team?"
        message={`Are you sure you want to remove team "${removeTargetTeam?.name}" and all its members from this event?`}
        confirmText="Yes, Remove Team"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmRemoveTeam}
        onClose={() => setRemoveTargetTeam(null)}
      />
    </div>
  )
}
