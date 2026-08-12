import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import teamService from '@/services/teamService'

export const parseEventDate = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export const formatDateString = (dateStr) => {
  if (!dateStr) return null
  const d = parseEventDate(dateStr)
  if (!d) return dateStr
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getEventStatus = (event) => {
  if (!event) return { label: 'ONGOING', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', code: 'ONGOING' }
  const now = new Date()
  const start = parseEventDate(event.regStart)
  const end = parseEventDate(event.regEnd)

  if (start && now < start) {
    return { label: 'UPCOMING', style: 'bg-blue-500/20 text-blue-300 border-blue-500/30', code: 'UPCOMING' }
  }
  if (end && now > end) {
    return { label: 'ENDED', style: 'bg-slate-700/50 text-slate-400 border-slate-600/30', code: 'ENDED' }
  }
  return { label: 'ONGOING', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', code: 'ONGOING' }
}

export default function EventDetailsModal({ event, isOpen, onClose, isRegistered, onRegisterConfirm, clubName }) {
  const { user } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showGroupForm, setShowGroupForm] = useState(false)

  // Group Registration Form state
  const [teamName, setTeamName] = useState('')
  const [memberInputs, setMemberInputs] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (event && event.type === 'GROUP') {
      const maxM = event.maxMembers || 4
      // We need maxM - 1 inputs for additional team members
      setMemberInputs(new Array(Math.max(0, maxM - 1)).fill(''))
      setTeamName('')
    }
  }, [event])

  if (!isOpen || !event) return null

  const status = getEventStatus(event)
  const isGroup = event.type === 'GROUP'
  const minMembers = event.minMembers || 1
  const maxMembers = event.maxMembers || 4

  const regStartFormatted = formatDateString(event.regStart)
  const regEndFormatted = formatDateString(event.regEnd)
  const eventDateFormatted = formatDateString(event.eventDate)

  const handleRegisterClick = () => {
    if (isGroup) {
      setShowGroupForm(true)
    } else {
      setShowConfirm(true)
    }
  }

  const handleIndividualRegister = async () => {
    setShowConfirm(false)
    if (onRegisterConfirm) {
      await onRegisterConfirm(event.id)
    }
  }

  const handleMemberInputChange = (index, value) => {
    const updated = [...memberInputs]
    updated[index] = value
    setMemberInputs(updated)
  }

  const handleGroupSubmit = async (e) => {
    e.preventDefault()
    if (!teamName.trim()) {
      toast.error('Please enter a team name')
      return
    }

    const filteredMembers = memberInputs
      .map((u) => u.trim().toUpperCase())
      .filter(Boolean)

    const totalTeamSize = 1 + filteredMembers.length // +1 for logged-in leader

    if (totalTeamSize < minMembers) {
      toast.error(`Team must have at least ${minMembers} members (including leader)`)
      return
    }
    if (totalTeamSize > maxMembers) {
      toast.error(`Team cannot exceed ${maxMembers} members`)
      return
    }

    // Check if leader USN is in member inputs
    const leaderUsn = (user?.username || '').trim().toUpperCase()
    if (filteredMembers.includes(leaderUsn)) {
      toast.error('Leader USN should not be re-entered in member list')
      return
    }

    // Check for duplicate USNs in member inputs
    const uniqueMembers = new Set(filteredMembers)
    if (uniqueMembers.size !== filteredMembers.length) {
      toast.error('Duplicate member USNs detected in your entries')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        eventId: event.id,
        teamName: teamName.trim(),
        memberUsns: filteredMembers,
      }
      await teamService.registerTeam(payload)
      toast.success(`🎉 Team "${teamName.trim()}" registered successfully!`)
      setShowGroupForm(false)
      onClose()
      if (onRegisterConfirm) {
        onRegisterConfirm(event.id)
      }
    } catch (err) {
      console.error('Team registration error:', err)
      toast.error(err.response?.data?.message || 'Team registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-xl w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${status.style}`}>
                {status.label}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${isGroup ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-blue-500/10 text-blue-300 border-blue-500/30'}`}>
                {isGroup ? `Team (${minMembers}-${maxMembers} Members)` : 'Individual Event'}
              </span>
              {clubName && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30">
                  {clubName}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-snug">{event.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Registration Window Highlight */}
          <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⏰</span> Registration Schedule
            </div>
            {status.code === 'UPCOMING' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Registration Starts:</span>
                  <div className="font-semibold text-blue-300">{regStartFormatted || 'TBA'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Registration Ends (Last Date):</span>
                  <div className="font-semibold text-purple-300">{regEndFormatted || 'TBA'}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Registration Starts:</span>
                  <div className="font-medium text-slate-300">{regStartFormatted || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Last Date to Register:</span>
                  <div className="font-bold text-amber-300">{regEndFormatted || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Date, Venue & Capacity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="text-slate-400 text-[10px]">📅 Event Date</div>
              {eventDateFormatted ? (
                <div className="text-white font-bold text-xs">{eventDateFormatted}</div>
              ) : (
                <div className="text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Event date is not declared
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="text-slate-400 text-[10px]">📍 Venue</div>
              {event.venue ? (
                <div className="text-white font-bold text-xs">{event.venue}</div>
              ) : (
                <div className="text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Venue is not declared
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="text-slate-400 text-[10px]">👥 Capacity</div>
              <div className="text-purple-300 font-bold text-xs font-mono">
                {event.capacity ? `${event.capacity} ${isGroup ? 'Teams' : 'Participants'}` : 'Unlimited (∞)'}
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">About This Event</div>
            <p className="text-slate-300 leading-relaxed text-xs whitespace-pre-wrap">
              {event.description || 'No detailed description added for this event.'}
            </p>
          </div>
        </div>

        {/* Footer & Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
          >
            Close
          </button>

          {isRegistered ? (
            <button
              disabled
              className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl cursor-not-allowed"
            >
              ✓ Registered
            </button>
          ) : status.code === 'ENDED' ? (
            <button
              disabled
              className="px-5 py-2 bg-slate-800 border border-white/5 text-slate-500 font-bold rounded-xl cursor-not-allowed"
            >
              Registration Ended
            </button>
          ) : status.code === 'UPCOMING' ? (
            <button
              disabled
              className="px-5 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold rounded-xl cursor-not-allowed"
            >
              Registration Starts Soon
            </button>
          ) : (
            <button
              onClick={handleRegisterClick}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all"
            >
              {isGroup ? 'Register Team →' : 'Register Now'}
            </button>
          )}
        </div>

        {/* INDIVIDUAL REGISTRATION CONFIRMATION OVERLAY */}
        {showConfirm && !isGroup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleUp">
              <div className="text-3xl text-center">🎯</div>
              <h3 className="text-lg font-black text-white text-center">Confirm Registration</h3>
              <p className="text-xs text-slate-300 text-center leading-relaxed">
                Are you sure you want to register for <span className="text-purple-300 font-bold">"{event.name}"</span>? Your details (USN, Name, Email, Mobile) will be submitted to the organizers.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIndividualRegister}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/30 transition-all"
                >
                  Confirm & Register
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GROUP TEAM REGISTRATION OVERLAY */}
        {showGroupForm && isGroup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-lg w-full flex flex-col max-h-[85vh] shadow-2xl animate-scaleUp">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>👥</span> Team Registration: {event.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Team Limit: <span className="text-amber-300 font-bold">{minMembers} to {maxMembers} Members</span> (including Team Leader)
                  </p>
                </div>
                <button
                  onClick={() => setShowGroupForm(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form */}
              <form onSubmit={handleGroupSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
                {/* Team Leader Banner (Auto-filled) */}
                <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <span>👑</span> Team Leader (Member #1 - You)
                  </div>
                  <div className="flex items-center justify-between text-slate-200 font-bold">
                    <span>{user?.fullName || user?.username}</span>
                    <span className="font-mono text-purple-300">USN: {user?.username}</span>
                  </div>
                </div>

                {/* Team Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Team Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tech Titans, Cyber Knights, CodeCrafters"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Team Members USNs */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold">Team Member USNs / Usernames</label>
                    <span className="text-[10px] text-slate-400">Must be registered on portal</span>
                  </div>

                  {memberInputs.map((val, idx) => {
                    const memberNumber = idx + 2
                    const isRequired = memberNumber <= minMembers

                    return (
                      <div key={idx} className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">
                          Member #{memberNumber} USN {isRequired ? <span className="text-amber-400">*</span> : <span className="text-slate-500 font-normal">(Optional)</span>}
                        </label>
                        <input
                          type="text"
                          placeholder={`e.g. 1MJ23CG0${10 + memberNumber}`}
                          value={val}
                          onChange={(e) => handleMemberInputChange(idx, e.target.value)}
                          required={isRequired}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 uppercase font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    )
                  })}
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleGroupSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Registering Team...' : 'Submit Team Registration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
