import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import eventService from '@/services/eventService'
import ConfirmModal from '@/components/common/ConfirmModal'

export default function AdminEvents() {
  const { myClubs, selectedClubId, setSelectedClubId } = useOutletContext() || { myClubs: [], selectedClubId: '' }

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
    fetchEvents()
  }, [selectedClubId, myClubs])

  const fetchEvents = async () => {
    setLoading(true)
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
      capacity: evt.capacity || '',
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
    if (!formData.clubId) {
      toast.error('Please select a club for this event')
      return
    }
    if (!formData.regStart || !formData.regEnd) {
      toast.error('Registration start and end dates are required')
      return
    }

    try {
      const payload = {
        clubId: formData.clubId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        regStart: formData.regStart ? new Date(formData.regStart).toISOString() : null,
        regEnd: formData.regEnd ? new Date(formData.regEnd).toISOString() : null,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
        venue: formData.venue.trim() || null,
        type: formData.type,
        minMembers: formData.type === 'GROUP' ? Number(formData.minMembers) : 1,
        maxMembers: formData.type === 'GROUP' ? Number(formData.maxMembers) : 1,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        bgImageUrl: formData.bgImageUrl.trim() || null,
      }

      await eventService.createEvent(payload)
      toast.success('Event created successfully!')
      setShowAddModal(false)
      fetchEvents()
    } catch (err) {
      console.error('Error creating event:', err)
      toast.error(err.response?.data?.message || 'Failed to create event')
    }
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!editingEvent) return

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        regStart: formData.regStart ? new Date(formData.regStart).toISOString() : null,
        regEnd: formData.regEnd ? new Date(formData.regEnd).toISOString() : null,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
        venue: formData.venue.trim() || null,
        type: formData.type,
        minMembers: formData.type === 'GROUP' ? Number(formData.minMembers) : 1,
        maxMembers: formData.type === 'GROUP' ? Number(formData.maxMembers) : 1,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        bgImageUrl: formData.bgImageUrl.trim() || null,
      }

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
      toast.success('Event deleted successfully!')
      setDeleteTargetEvent(null)
      fetchEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
      toast.error(err.response?.data?.message || 'Failed to delete event')
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

  const activeClubObj = myClubs.find((c) => c.id === selectedClubId)

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Club Switcher */}
      <div className="bg-slate-900 border border-purple-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>📅</span> Club Events Manager
            </h1>
            {activeClubObj && (
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-full">
                {activeClubObj.name}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Create, update, schedule event dates & venues, and manage registration windows.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <span>✨</span> Add New Event
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Events</div>
            <div className="text-2xl font-black text-white mt-1">{events.length}</div>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xl text-purple-400">
            📅
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Status</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">Operational</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xl text-emerald-400">
            ⚡
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Club Context</div>
            <div className="text-lg font-extrabold text-purple-300 mt-1 truncate">{activeClubObj ? activeClubObj.name : 'Assigned Club'}</div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xl text-blue-400">
            🏛️
          </div>
        </div>
      </div>

      {/* Events Roster */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-purple-400 font-bold animate-pulse flex items-center gap-2">
            <span>⚡</span> Loading Events...
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <div className="text-4xl">🎪</div>
          <div className="text-lg font-bold text-white">No Events Found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {selectedClubId
              ? 'No events registered for this club yet. Click "Add New Event" to launch a new competition!'
              : 'No events available. Select or assign a club to create your first event.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-500 transition-all"
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
                className="bg-slate-900 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {clubName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${isGroup ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-blue-500/10 text-blue-300 border-blue-500/30'}`}>
                        {isGroup ? `Team (${evt.minMembers}-${evt.maxMembers})` : 'Individual'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Cap: {evt.capacity ? evt.capacity : '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-extrabold text-white leading-snug">{evt.name}</h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {evt.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Key Info Details */}
                  <div className="bg-slate-950/70 border border-white/5 p-3 rounded-xl space-y-2 text-xs">
                    {/* Event Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <span>📅</span> Event Date:
                      </span>
                      {evt.eventDate ? (
                        <span className="text-slate-200 font-semibold">{formatDate(evt.eventDate)}</span>
                      ) : (
                        <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          Event date is not declared
                        </span>
                      )}
                    </div>

                    {/* Venue */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <span>📍</span> Venue:
                      </span>
                      {evt.venue ? (
                        <span className="text-slate-200 font-semibold">{evt.venue}</span>
                      ) : (
                        <span className="text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          Venue is not declared
                        </span>
                      )}
                    </div>

                    {/* Registration Windows */}
                    <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] text-slate-400">
                      <div><span className="text-slate-500">Reg Starts:</span> {formatDate(evt.regStart) || 'Not set'}</div>
                      <div><span className="text-slate-500">Reg Ends:</span> {formatDate(evt.regEnd) || 'Not set'}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleOpenEditModal(evt)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 transition-all flex items-center gap-1"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(evt)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/30 transition-all flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>✨</span> Add New Event
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Fill in event details, schedule, venue, and team parameters</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Club Selector */}
              {myClubs.length > 1 ? (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hosting Club *</label>
                  <select
                    value={formData.clubId}
                    onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-purple-500"
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
                <label className="block text-slate-300 font-bold mb-1">Event Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon 2026, CodeCraft, Robowar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide contest summary, rules, eligibility criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regStart}
                    onChange={(e) => setFormData({ ...formData, regStart: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regEnd}
                    onChange={(e) => setFormData({ ...formData, regEnd: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Event Date & Venue (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-950/20 border border-purple-500/20 p-3 rounded-2xl">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">
                    When is Event? (Event Date)
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If unassigned, student section shows "Event date is not declared"</p>
                </div>

                <div>
                  <label className="block text-purple-300 font-bold mb-1">
                    Venue / Location
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium 1, Computer Lab 3"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If unassigned, student section shows "Venue is not declared"</p>
                </div>
              </div>

              {/* Event Type, Team Limits & Max Capacity */}
              <div className="space-y-4 bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-300 font-bold mb-1">Event Participation Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="INDIVIDUAL">Individual Participation</option>
                      <option value="GROUP">Team / Group Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-purple-300 font-bold mb-1">
                      {formData.type === 'GROUP' ? 'Max Teams Limit (Optional)' : 'Max Candidates Limit (Optional)'}
                    </label>
                    <input
                      type="number"
                      placeholder={formData.type === 'GROUP' ? "e.g. 20 Teams (Leave blank for ∞)" : "e.g. 50 Candidates (Leave blank for ∞)"}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {formData.type === 'GROUP' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Min Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minMembers}
                        onChange={(e) => setFormData({ ...formData, minMembers: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Max Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxMembers}
                        onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Poster Image URL */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.bgImageUrl}
                  onChange={(e) => setFormData({ ...formData, bgImageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                />
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
                onClick={handleCreateSubmit}
                className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>✏️</span> Edit Event: {editingEvent.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Update schedule, venue, registration window or capacity</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdateSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Event Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regStart}
                    onChange={(e) => setFormData({ ...formData, regStart: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.regEnd}
                    onChange={(e) => setFormData({ ...formData, regEnd: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Event Date & Venue (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-950/20 border border-purple-500/20 p-3 rounded-2xl">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">
                    When is Event? (Event Date)
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If blank, student section displays "Event date is not declared"</p>
                </div>

                <div>
                  <label className="block text-purple-300 font-bold mb-1">
                    Venue / Location
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium 1"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If blank, student section displays "Venue is not declared"</p>
                </div>
              </div>

              {/* Event Type, Team Limits & Max Capacity */}
              <div className="space-y-4 bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-300 font-bold mb-1">Event Participation Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="INDIVIDUAL">Individual Participation</option>
                      <option value="GROUP">Team / Group Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-purple-300 font-bold mb-1">
                      {formData.type === 'GROUP' ? 'Max Teams Limit (Optional)' : 'Max Candidates Limit (Optional)'}
                    </label>
                    <input
                      type="number"
                      placeholder={formData.type === 'GROUP' ? "e.g. 20 Teams (Leave blank for ∞)" : "e.g. 50 Candidates (Leave blank for ∞)"}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {formData.type === 'GROUP' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Min Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minMembers}
                        onChange={(e) => setFormData({ ...formData, minMembers: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Max Members per Team *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxMembers}
                        onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Image URL */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.bgImageUrl}
                  onChange={(e) => setFormData({ ...formData, bgImageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

            </form>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleUpdateSubmit}
                className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all"
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
