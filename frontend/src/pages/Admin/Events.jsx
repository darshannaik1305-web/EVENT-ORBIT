import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import eventService from '@/services/eventService'
import ConfirmModal from '@/components/common/ConfirmModal'

export default function AdminEvents() {
  const { myClubs, selectedClubId, setSelectedClubId, loadingClubs } = useOutletContext() || { myClubs: [], selectedClubId: '', loadingClubs: false }

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [deleteTargetEvent, setDeleteTargetEvent] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    clubId: '',
    name: '',
    description: '',
    regStart: '',
    regEnd: '',
    eventDate: '',
    venue: '',
    type: 'INDIVIDUAL',
    minMembers: 1,
    maxMembers: 4,
    capacity: '',
    bgImageUrl: '',
  })

  useEffect(() => {
    if (!loadingClubs) {
      fetchEvents()
    }
  }, [selectedClubId, myClubs, loadingClubs])

  const fetchEvents = async () => {
    if (loadingClubs) return

    setLoading(true)
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
    } catch (err) {
      console.error('Error fetching events:', err)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    const defaultClubId = selectedClubId || (myClubs.length > 0 ? myClubs[0].id : '')
    setFormData({
      clubId: defaultClubId,
      name: '',
      description: '',
      regStart: '',
      regEnd: '',
      eventDate: '',
      venue: '',
      type: 'INDIVIDUAL',
      minMembers: 1,
      maxMembers: 4,
      capacity: '',
      bgImageUrl: '',
    })
  }

  const handleOpenAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt)
    setFormData({
      clubId: evt.clubId || '',
      name: evt.name || '',
      description: evt.description || '',
      regStart: evt.regStart ? evt.regStart.substring(0, 16) : '',
      regEnd: evt.regEnd ? evt.regEnd.substring(0, 16) : '',
      eventDate: evt.eventDate ? evt.eventDate.substring(0, 16) : '',
      venue: evt.venue || '',
      type: evt.type || 'INDIVIDUAL',
      minMembers: evt.minMembers || 1,
      maxMembers: evt.maxMembers || 4,
      capacity: evt.capacity !== null && evt.capacity !== undefined ? evt.capacity : '',
      bgImageUrl: evt.bgImageUrl || '',
    })
    setShowEditModal(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Event name is required')
      return
    }
    if (!formData.regStart || !formData.regEnd) {
      toast.error('Registration start and end dates are required')
      return
    }
    if (new Date(formData.regStart) >= new Date(formData.regEnd)) {
      toast.error('Registration start date must be strictly before registration end date')
      return
    }

    const payload = {
      clubId: formData.clubId || selectedClubId || (myClubs.length > 0 ? myClubs[0].id : ''),
      name: formData.name.trim(),
      description: formData.description.trim(),
      regStart: formData.regStart.length === 16 ? formData.regStart + ':00' : formData.regStart,
      regEnd: formData.regEnd.length === 16 ? formData.regEnd + ':00' : formData.regEnd,
      eventDate: formData.eventDate ? (formData.eventDate.length === 16 ? formData.eventDate + ':00' : formData.eventDate) : null,
      venue: formData.venue.trim() || null,
      type: formData.type,
      minMembers: formData.type === 'GROUP' ? Number(formData.minMembers) : 1,
      maxMembers: formData.type === 'GROUP' ? Number(formData.maxMembers) : 1,
      capacity: formData.capacity !== '' && formData.capacity !== null ? Number(formData.capacity) : null,
      bgImageUrl: formData.bgImageUrl.trim() || null,
    }

    try {
      await eventService.createEvent(payload)
      toast.success('Event published successfully!')
      setShowAddModal(false)
      resetForm()
      fetchEvents()
    } catch (err) {
      console.error('Error creating event:', err)
      toast.error(err.response?.data?.message || 'Failed to create event')
    }
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!editingEvent) return

    if (!formData.name.trim()) {
      toast.error('Event name is required')
      return
    }
    if (!formData.regStart || !formData.regEnd) {
      toast.error('Registration start and end dates are required')
      return
    }
    if (new Date(formData.regStart) >= new Date(formData.regEnd)) {
      toast.error('Registration start date must be strictly before registration end date')
      return
    }

    const payload = {
      clubId: formData.clubId || editingEvent.clubId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      regStart: formData.regStart.length === 16 ? formData.regStart + ':00' : formData.regStart,
      regEnd: formData.regEnd.length === 16 ? formData.regEnd + ':00' : formData.regEnd,
      eventDate: formData.eventDate ? (formData.eventDate.length === 16 ? formData.eventDate + ':00' : formData.eventDate) : null,
      venue: formData.venue.trim() || null,
      type: formData.type,
      minMembers: formData.type === 'GROUP' ? Number(formData.minMembers) : 1,
      maxMembers: formData.type === 'GROUP' ? Number(formData.maxMembers) : 1,
      capacity: formData.capacity !== '' && formData.capacity !== null ? Number(formData.capacity) : null,
      bgImageUrl: formData.bgImageUrl.trim() || null,
    }

    try {
      await eventService.updateEvent(editingEvent.id, payload)
      toast.success('Event updated successfully!')
      setShowEditModal(false)
      setEditingEvent(null)
      fetchEvents()
    } catch (err) {
      console.error('Error updating event:', err)
      toast.error(err.response?.data?.message || 'Failed to update event')
    }
  }

  const handleDeleteClick = (evt) => {
    setDeleteTargetEvent(evt)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetEvent) return

    try {
      await eventService.deleteEvent(deleteTargetEvent.id)
      toast.success('Event deleted successfully')
      setDeleteTargetEvent(null)
      fetchEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
      toast.error(err.response?.data?.message || 'Failed to delete event')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', {
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

  const activeClubObj = myClubs.find((c) => c.id === selectedClubId)

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner & Multi-Club Switcher */}
      <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#F28D1E]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
              <span>📅</span> Club Events Manager
            </h1>
            {activeClubObj && (
              <span className="px-3 py-1 bg-[#7B1113]/10 border border-[#7B1113]/25 text-[#7B1113] text-xs font-bold rounded-full">
                {activeClubObj.name}
              </span>
            )}
          </div>
          <p className="text-[#666666] text-xs sm:text-sm mt-1">
            Create, update, schedule event dates & venues, and manage registration windows.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Add New Event Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>✨</span> Add New Event
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="academic-card p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Total Hosted Events</div>
            <div className="text-2xl font-headings font-extrabold text-[#202020] mt-1">{events.length}</div>
          </div>
          <div className="p-3 bg-[#F28D1E]/10 border border-[#F28D1E]/20 rounded-xl text-xl text-[#F28D1E]">
            🎪
          </div>
        </div>

        <div className="academic-card p-5 flex items-center justify-between border-l-4 border-l-[#7B1113]">
          <div>
            <div className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Club Context</div>
            <div className="text-lg font-headings font-bold text-[#7B1113] mt-1 truncate">{activeClubObj ? activeClubObj.name : 'Assigned Club'}</div>
          </div>
          <div className="p-3 bg-[#7B1113]/10 border border-[#7B1113]/25 rounded-xl text-xl text-[#7B1113]">
            🏛️
          </div>
        </div>
      </div>

      {/* Events Roster */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-[#F28D1E] font-bold animate-pulse flex items-center gap-2">
            <span>⚡</span> Loading Events...
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="academic-card p-12 text-center text-[#888888] space-y-3">
          <div className="text-4xl">🎪</div>
          <div className="text-lg font-headings font-bold text-[#202020]">No Events Found</div>
          <p className="text-xs text-[#666666] max-w-sm mx-auto">
            {selectedClubId
              ? 'No events registered for this club yet. Click "Add New Event" to launch a new competition!'
              : 'No events available. Select or assign a club to create your first event.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((evt) => {
            const clubName = myClubs.find((c) => c.id === evt.clubId)?.name || 'Club Event'
            const isGroup = evt.type === 'GROUP'

            return (
              <div
                key={evt.id}
                className="academic-card p-6 hover:border-[#F28D1E]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#7B1113]/10 text-[#7B1113] border border-[#7B1113]/25">
                      {clubName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${isGroup ? 'bg-[#D6A84F]/15 text-[#B7791F] border-[#D6A84F]/30' : 'bg-[#2563A6]/10 text-[#2563A6] border-[#2563A6]/20'}`}>
                        {isGroup ? `Team (${evt.minMembers}-${evt.maxMembers})` : 'Individual'}
                      </span>
                      <span className="text-[11px] text-[#888888] font-mono">
                        Cap: {evt.capacity ? evt.capacity : '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-headings font-bold text-[#202020] leading-snug">{evt.name}</h2>
                    <p className="text-xs text-[#666666] mt-1 line-clamp-2 leading-relaxed">
                      {evt.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Key Info Details */}
                  <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3.5 rounded-xl space-y-2 text-xs">
                    {/* Event Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] flex items-center gap-1.5 font-medium">
                        <span>📅</span> Event Date:
                      </span>
                      {evt.eventDate ? (
                        <span className="text-[#202020] font-semibold">{formatDate(evt.eventDate)}</span>
                      ) : (
                        <span className="text-[#B7791F] font-bold bg-[#B7791F]/10 px-2 py-0.5 rounded text-[11px]">
                          Event date is not declared
                        </span>
                      )}
                    </div>

                    {/* Venue */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] flex items-center gap-1.5 font-medium">
                        <span>📍</span> Venue:
                      </span>
                      {evt.venue ? (
                        <span className="text-[#202020] font-semibold">{evt.venue}</span>
                      ) : (
                        <span className="text-[#B7791F] font-bold bg-[#B7791F]/10 px-2 py-0.5 rounded text-[11px]">
                          Venue is not declared
                        </span>
                      )}
                    </div>

                    {/* Registration Windows */}
                    <div className="pt-2 border-t border-[#E5E1DC] flex flex-col gap-1 text-[11px] text-[#666666]">
                      <div><span className="text-[#888888]">Reg Starts:</span> {formatDate(evt.regStart) || 'Not set'}</div>
                      <div><span className="text-[#888888]">Reg Ends:</span> {formatDate(evt.regEnd) || 'Not set'}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E1DC]">
                  <button
                    onClick={() => handleOpenEditModal(evt)}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#F1EFEB] text-[#202020] text-xs font-bold rounded-lg border border-[#E5E1DC] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(evt)}
                    className="px-3.5 py-1.5 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] text-xs font-bold rounded-lg border border-[#B42318]/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E1DC] rounded-3xl p-6 md:p-8 max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
                  <span>✨</span> Add New Event
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">Fill in event details, schedule, venue, and team parameters</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#888888] hover:text-[#202020] text-xl font-bold p-1 rounded-lg hover:bg-[#F1EFEB] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Club Selector */}
              {myClubs.length > 1 ? (
                <div>
                  <label className="block text-[#202020] font-bold mb-1">Hosting Club *</label>
                  <select
                    value={formData.clubId}
                    onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E]"
                  >
                    {myClubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Event Name */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Event Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon 2026, CodeCraft, Robowar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide contest summary, rules, eligibility criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E] resize-none"
                />
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#202020] font-bold mb-1">Registration Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regStart}
                    onChange={(e) => setFormData({ ...formData, regStart: e.target.value })}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                </div>
                <div>
                  <label className="block text-[#202020] font-bold mb-1">Registration End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regEnd}
                    onChange={(e) => setFormData({ ...formData, regEnd: e.target.value })}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                </div>
              </div>

              {/* Event Date & Venue (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F6F3] border border-[#E5E1DC] p-4 rounded-2xl">
                <div>
                  <label className="block text-[#202020] font-bold mb-1">
                    When is Event? (Event Date)
                    <span className="text-[10px] text-[#888888] font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                  <p className="text-[10px] text-[#888888] mt-1">If unassigned, student section shows "Event date is not declared"</p>
                </div>

                <div>
                  <label className="block text-[#202020] font-bold mb-1">
                    Venue / Location
                    <span className="text-[10px] text-[#888888] font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium 1, Computer Lab 3"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                  <p className="text-[10px] text-[#888888] mt-1">If unassigned, student section shows "Venue is not declared"</p>
                </div>
              </div>

              {/* Event Type, Team Limits & Max Capacity */}
              <div className="space-y-4 bg-[#F7F6F3] border border-[#E5E1DC] p-4 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#202020] font-bold mb-1">Event Participation Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E] cursor-pointer"
                    >
                      <option value="INDIVIDUAL">Individual Participation</option>
                      <option value="GROUP">Team / Group Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#202020] font-bold mb-1">
                      {formData.type === 'GROUP' ? 'Max Teams Limit (Optional)' : 'Max Candidates Limit (Optional)'}
                    </label>
                    <input
                      type="number"
                      placeholder={formData.type === 'GROUP' ? "e.g. 20 Teams (Leave blank for ∞)" : "e.g. 50 Candidates (Leave blank for ∞)"}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                    />
                  </div>
                </div>

                {formData.type === 'GROUP' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E5E1DC]">
                    <div>
                      <label className="block text-[#202020] font-bold mb-1">Min Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minMembers}
                        onChange={(e) => setFormData({ ...formData, minMembers: e.target.value })}
                        className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#202020] font-bold mb-1">Max Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxMembers}
                        onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                        className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Poster Image URL */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Banner Image (URL or Browse File)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste banner image URL or browse local file..."
                    value={formData.bgImageUrl}
                    onChange={(e) => setFormData({ ...formData, bgImageUrl: e.target.value })}
                    className="flex-1 bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                  <label className="px-3 py-2 bg-[#F28D1E]/10 hover:bg-[#F28D1E]/20 text-[#F28D1E] border border-[#F28D1E]/30 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                    <span>📁</span> Browse...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (evt) => setFormData((prev) => ({ ...prev, bgImageUrl: evt.target.result }))
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.bgImageUrl && (
                  <div className="mt-2 relative inline-block group">
                    <img
                      src={formData.bgImageUrl}
                      alt="Banner Preview"
                      className="h-16 w-32 object-cover rounded-lg border border-[#E5E1DC] shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bgImageUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
                      title="Remove Image"
                    >
                      ✕
                    </button>
                  </div>
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
                onClick={handleCreateSubmit}
                className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all cursor-pointer"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E1DC] rounded-3xl p-6 md:p-8 max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
                  <span>✏️</span> Edit Event: {editingEvent.name}
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">Update schedule, venue, registration window or capacity</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#888888] hover:text-[#202020] text-xl font-bold p-1 rounded-lg hover:bg-[#F1EFEB] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdateSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Event Name */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2.5 text-[#202020] outline-none focus:border-[#F28D1E] resize-none"
                />
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#202020] font-bold mb-1">Registration Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regStart}
                    onChange={(e) => setFormData({ ...formData, regStart: e.target.value })}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                </div>
                <div>
                  <label className="block text-[#202020] font-bold mb-1">Registration End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regEnd}
                    onChange={(e) => setFormData({ ...formData, regEnd: e.target.value })}
                    required
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                </div>
              </div>

              {/* Event Date & Venue (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F6F3] border border-[#E5E1DC] p-4 rounded-2xl">
                <div>
                  <label className="block text-[#202020] font-bold mb-1">
                    When is Event? (Event Date)
                    <span className="text-[10px] text-[#888888] font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                  <p className="text-[10px] text-[#888888] mt-1">If blank, student section displays "Event date is not declared"</p>
                </div>

                <div>
                  <label className="block text-[#202020] font-bold mb-1">
                    Venue / Location
                    <span className="text-[10px] text-[#888888] font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium 1"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                  <p className="text-[10px] text-[#888888] mt-1">If blank, student section displays "Venue is not declared"</p>
                </div>
              </div>

              {/* Event Type, Team Limits & Max Capacity */}
              <div className="space-y-4 bg-[#F7F6F3] border border-[#E5E1DC] p-4 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#202020] font-bold mb-1">Event Participation Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E] cursor-pointer"
                    >
                      <option value="INDIVIDUAL">Individual Participation</option>
                      <option value="GROUP">Team / Group Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#202020] font-bold mb-1">
                      {formData.type === 'GROUP' ? 'Max Teams Limit (Optional)' : 'Max Candidates Limit (Optional)'}
                    </label>
                    <input
                      type="number"
                      placeholder={formData.type === 'GROUP' ? "e.g. 20 Teams (Leave blank for ∞)" : "e.g. 50 Candidates (Leave blank for ∞)"}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                    />
                  </div>
                </div>

                {formData.type === 'GROUP' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E5E1DC]">
                    <div>
                      <label className="block text-[#202020] font-bold mb-1">Min Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minMembers}
                        onChange={(e) => setFormData({ ...formData, minMembers: e.target.value })}
                        className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#202020] font-bold mb-1">Max Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxMembers}
                        onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                        className="w-full bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Image URL */}
              <div>
                <label className="block text-[#202020] font-bold mb-1">Banner Image (URL or Browse File)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste banner image URL or browse local file..."
                    value={formData.bgImageUrl}
                    onChange={(e) => setFormData({ ...formData, bgImageUrl: e.target.value })}
                    className="flex-1 bg-white border border-[#E5E1DC] rounded-xl px-3 py-2 text-[#202020] outline-none focus:border-[#F28D1E]"
                  />
                  <label className="px-3 py-2 bg-[#F28D1E]/10 hover:bg-[#F28D1E]/20 text-[#F28D1E] border border-[#F28D1E]/30 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                    <span>📁</span> Browse...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (evt) => setFormData((prev) => ({ ...prev, bgImageUrl: evt.target.result }))
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.bgImageUrl && (
                  <div className="mt-2 relative inline-block group">
                    <img
                      src={formData.bgImageUrl}
                      alt="Banner Preview"
                      className="h-16 w-32 object-cover rounded-lg border border-[#E5E1DC] shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bgImageUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
                      title="Remove Image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

            </form>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E1DC] shrink-0">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-white border border-[#E5E1DC] text-[#555555] font-semibold rounded-xl hover:bg-[#F1EFEB] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleUpdateSubmit}
                className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetEvent)}
        title="Delete Event?"
        message={`Are you sure you want to delete "${deleteTargetEvent?.name}"? All associated registrations and winners for this event will also be removed. This action cannot be undone.`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTargetEvent(null)}
      />
    </div>
  )
}
