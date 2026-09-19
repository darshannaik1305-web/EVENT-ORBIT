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
  if (!event) return { label: 'ONGOING', style: 'bg-[#287A4B]/10 text-[#287A4B] border-[#287A4B]/30', code: 'ONGOING' }
  const now = new Date()
  const start = parseEventDate(event.regStart)
  const end = parseEventDate(event.regEnd)

  if (start && now < start) {
    return { label: 'UPCOMING', style: 'bg-[#7B1113]/10 text-[#7B1113] border-[#7B1113]/30', code: 'UPCOMING' }
  }
  if (end && now > end) {
    return { label: 'ENDED', style: 'bg-[#888888]/10 text-[#888888] border-[#888888]/30', code: 'ENDED' }
  }
  return { label: 'ONGOING', style: 'bg-[#287A4B]/10 text-[#287A4B] border-[#287A4B]/30', code: 'ONGOING' }
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

    const totalTeamSize = 1 + filteredMembers.length

    if (totalTeamSize < minMembers) {
      toast.error(`Team must have at least ${minMembers} members (including leader)`)
      return
    }
    if (totalTeamSize > maxMembers) {
      toast.error(`Team cannot exceed ${maxMembers} members`)
      return
    }

    const leaderUsn = (user?.username || '').trim().toUpperCase()
    if (filteredMembers.includes(leaderUsn)) {
      toast.error('Leader USN should not be re-entered in member list')
      return
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-sm select-none">
      <div className="bg-white border border-[#E5E1DC] rounded-2xl p-6 md:p-8 max-w-xl w-full flex flex-col max-h-[85vh] shadow-2xl relative text-[#202020]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E1DC] pb-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${status.style}`}>
                {status.label}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${isGroup ? 'bg-[#D6A84F]/15 text-[#B7791F] border-[#D6A84F]/30' : 'bg-[#2563A6]/10 text-[#2563A6] border-[#2563A6]/20'}`}>
                {isGroup ? `Team (${minMembers}-${maxMembers} Members)` : 'Individual Event'}
              </span>
              {clubName && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#7B1113] bg-[#7B1113]/10 border border-[#7B1113]/25">
                  {clubName}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-headings font-bold text-[#202020] leading-snug">{event.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#202020] text-xl font-bold p-1 rounded-lg hover:bg-[#F1EFEB] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Registration Window Highlight */}
          <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-4 rounded-xl space-y-2">
            <div className="text-xs font-bold text-[#F28D1E] uppercase tracking-wider flex items-center gap-1.5">
              <span>⏰</span> Registration Schedule
            </div>
            {status.code === 'UPCOMING' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#555555]">
                <div>
                  <span className="text-[#888888]">Registration Starts:</span>
                  <div className="font-semibold text-[#2563A6]">{regStartFormatted || 'TBA'}</div>
                </div>
                <div>
                  <span className="text-[#888888]">Registration Closes:</span>
                  <div className="font-semibold text-[#F28D1E]">{regEndFormatted || 'TBA'}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#555555]">
                <div>
                  <span className="text-[#888888]">Registration Opened:</span>
                  <div className="font-medium text-[#202020]">{regStartFormatted || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[#888888]">Last Date to Register:</span>
                  <div className="font-bold text-[#B7791F]">{regEndFormatted || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Date, Venue & Capacity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#E5E1DC] p-3 rounded-xl space-y-1 shadow-sm">
              <div className="text-[#888888] text-[10px] font-semibold">📅 Event Date</div>
              {eventDateFormatted ? (
                <div className="text-[#202020] font-bold text-xs">{eventDateFormatted}</div>
              ) : (
                <div className="text-[#B7791F] font-bold text-[10px] bg-[#B7791F]/10 px-2 py-0.5 rounded">
                  Date to be declared
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E1DC] p-3 rounded-xl space-y-1 shadow-sm">
              <div className="text-[#888888] text-[10px] font-semibold">📍 Venue</div>
              {event.venue ? (
                <div className="text-[#202020] font-bold text-xs">{event.venue}</div>
              ) : (
                <div className="text-[#888888] italic text-[11px]">
                  Venue TBA
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E1DC] p-3 rounded-xl space-y-1 shadow-sm">
              <div className="text-[#888888] text-[10px] font-semibold">👥 Capacity</div>
              <div className="text-[#F28D1E] font-bold text-xs font-mono">
                {event.capacity ? `${event.capacity} ${isGroup ? 'Teams' : 'Slots'}` : 'Unlimited (∞)'}
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-white border border-[#E5E1DC] p-4 rounded-xl space-y-2 shadow-sm">
            <div className="text-xs font-bold text-[#202020] uppercase tracking-wider">Event Overview</div>
            <p className="text-[#555555] leading-relaxed text-xs whitespace-pre-wrap">
              {event.description || 'No detailed description added for this event.'}
            </p>
          </div>
        </div>

        {/* Footer & Action Buttons */}
        <div className="pt-4 border-t border-[#E5E1DC] flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E1DC] hover:bg-[#F1EFEB] text-[#555555] font-semibold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>

          {isRegistered ? (
            <button
              disabled
              className="px-5 py-2 bg-[#287A4B]/10 border border-[#287A4B]/30 text-[#287A4B] font-bold rounded-xl cursor-not-allowed"
            >
              ✓ Registered
            </button>
          ) : status.code === 'ENDED' ? (
            <button
              disabled
              className="px-5 py-2 bg-[#F1EFEB] border border-[#E5E1DC] text-[#888888] font-bold rounded-xl cursor-not-allowed"
            >
              Registration Ended
            </button>
          ) : status.code === 'UPCOMING' ? (
            <button
              disabled
              className="px-5 py-2 bg-[#F28D1E]/10 border border-[#F28D1E]/30 text-[#F28D1E] font-bold rounded-xl cursor-not-allowed"
            >
              Opens Soon
            </button>
          ) : (
            <button
              onClick={handleRegisterClick}
              className="px-6 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all cursor-pointer"
            >
              {isGroup ? 'Register Team →' : 'Register Now'}
            </button>
          )}
        </div>

        {/* INDIVIDUAL REGISTRATION CONFIRMATION OVERLAY */}
        {showConfirm && !isGroup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border border-[#E5E1DC] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="text-3xl text-center">🎯</div>
              <h3 className="text-lg font-headings font-bold text-[#202020] text-center">Confirm Registration</h3>
              <p className="text-xs text-[#555555] text-center leading-relaxed">
                Are you sure you want to register for <span className="text-[#7B1113] font-bold">"{event.name}"</span>? Your student details will be verified by the organizers.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-white border border-[#E5E1DC] text-[#555555] text-xs font-semibold rounded-xl hover:bg-[#F1EFEB] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIndividualRegister}
                  className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Confirm & Register
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GROUP TEAM REGISTRATION OVERLAY */}
        {showGroupForm && isGroup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border border-[#E5E1DC] rounded-2xl p-6 md:p-8 max-w-lg w-full flex flex-col max-h-[85vh] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-3 shrink-0">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#F28D1E]">
                    Group Team Registration
                  </div>
                  <h3 className="text-lg font-headings font-bold text-[#202020]">{event.name}</h3>
                </div>
                <button
                  onClick={() => setShowGroupForm(false)}
                  className="text-[#888888] hover:text-[#202020] text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Scroll Area */}
              <form onSubmit={handleGroupSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
                {/* Team Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#555555]">
                    Team Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Code Warriors"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3.5 py-2 text-[#202020] outline-none focus:border-[#F28D1E] focus:ring-2 focus:ring-[#F28D1E]/20"
                  />
                </div>

                {/* Team Members Inputs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-1.5">
                    <span className="font-bold text-[#202020]">Team Members USNs</span>
                    <span className="text-[11px] text-[#888888]">
                      Min: {minMembers} | Max: {maxMembers}
                    </span>
                  </div>

                  {/* Leader USN */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#888888]">
                      Member 1 (Team Leader):
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="w-full bg-[#F7F6F3] border border-[#E5E1DC] rounded-xl px-3.5 py-2 text-[#888888] font-mono cursor-not-allowed"
                    />
                  </div>

                  {/* Dynamic Other Member Inputs */}
                  {teamMemberInputs.map((val, idx) => {
                    const memberNumber = idx + 2
                    const isRequired = memberNumber <= minMembers

                    return (
                      <div key={idx} className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#555555]">
                          Member {memberNumber} USN: {isRequired && <span className="text-danger">*</span>}
                        </label>
                        <input
                          type="text"
                          placeholder={`e.g. 1MJ23CG0${10 + memberNumber}`}
                          value={val}
                          onChange={(e) => handleMemberInputChange(idx, e.target.value)}
                          required={isRequired}
                          className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3.5 py-2 text-[#202020] uppercase font-mono outline-none focus:border-[#F28D1E] focus:ring-2 focus:ring-[#F28D1E]/20"
                        />
                      </div>
                    )
                  })}
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E1DC] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="px-4 py-2 bg-white border border-[#E5E1DC] text-[#555555] text-xs font-semibold rounded-xl hover:bg-[#F1EFEB] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleGroupSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
