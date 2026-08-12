import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import clubService from '@/services/clubService'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClub, setEditingClub] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'TECH',
    imageUrl: '',
    bannerUrl: ''
  })

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    setLoading(true)
    try {
      const res = await clubService.getAllClubs()
      setClubs(res.data || [])
    } catch (err) {
      console.error('Error loading clubs:', err)
      toast.error('Failed to load clubs')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingClub(null)
    setForm({
      name: '',
      description: '',
      category: 'TECH',
      imageUrl: '',
      bannerUrl: ''
    })
    setShowModal(true)
  }

  const handleOpenEdit = (club) => {
    setEditingClub(club)
    setForm({
      name: club.name || '',
      description: club.description || '',
      category: club.category || 'TECH',
      imageUrl: club.imageUrl || '',
      bannerUrl: club.bannerUrl || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this club? Associated events will also be cleaned up.')) return
    try {
      await clubService.deleteClub(id)
      toast.success('Club deleted successfully')
      fetchClubs()
    } catch (err) {
      toast.error('Failed to delete club')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Club Name is required')
      return
    }

    try {
      if (editingClub) {
        await clubService.updateClub(editingClub.id, form)
        toast.success('Club updated successfully')
      } else {
        await clubService.createClub(form)
        toast.success('Club created successfully')
      }
      setShowModal(false)
      fetchClubs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving club')
    }
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop'

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-white/10 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>🏫</span> College Club Directory Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Add new campus clubs, update descriptions and visual cover images, or remove existing clubs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start md:self-auto"
        >
          <span>➕</span> Add New Club
        </button>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">Loading clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-white/5 rounded-2xl">
          No clubs registered yet. Click "Add New Club" to create your first club!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
              {/* Cover Image with Fallback & OnError (Mandatory Fix 3) */}
              <div className="h-40 w-full bg-slate-950 relative">
                <img
                  src={c.imageUrl || fallbackImage}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = fallbackImage
                  }}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-slate-950/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 uppercase border border-white/10">
                  {c.category || 'TECH'}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {c.description || 'College club for student workshops and competitions.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form: Add / Edit Club */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏫</span> {editingClub ? 'Edit Club' : 'Add New Club'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Club Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Coding Club"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category (Optional)</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- None / Optional --</option>
                  <option value="TECH">TECH</option>
                  <option value="CULTURAL">CULTURAL</option>
                  <option value="DANCE">DANCE</option>
                  <option value="MUSIC">MUSIC</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="LITERARY">LITERARY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  placeholder="Brief overview of club activities..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Club Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/club-cover.jpg"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Club Header Banner URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/club-banner.jpg"
                  value={form.bannerUrl}
                  onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/30"
                >
                  {editingClub ? 'Save Changes' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
