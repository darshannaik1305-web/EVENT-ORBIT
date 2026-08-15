import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import clubService from '@/services/clubService'
import ConfirmModal from '@/components/common/ConfirmModal'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClub, setEditingClub] = useState(null)
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null
  })

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

  const handleDelete = (club) => {
    setConfirmState({
      isOpen: true,
      title: `Delete '${club.name}'?`,
      message: `Are you sure you want to delete '${club.name}'? Associated events will also be cleaned up.`,
      action: async () => {
        try {
          await clubService.deleteClub(club.id)
          toast.success('Club deleted successfully')
          fetchClubs()
        } catch (err) {
          toast.error('Failed to delete club')
        }
      }
    })
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
                    onClick={() => handleDelete(c)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-colors cursor-pointer"
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
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Club Cover Image (URL or Browse File)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste image URL or browse local file..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <label className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                    <span>📁</span> Browse...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (evt) => setForm((prev) => ({ ...prev, imageUrl: evt.target.result }))
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 relative inline-block group">
                    <img
                      src={form.imageUrl}
                      alt="Cover Preview"
                      className="h-16 w-24 object-cover rounded-lg border border-white/20 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
                      title="Remove Image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Club Header Banner Image (Optional)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste banner URL or browse local file..."
                    value={form.bannerUrl}
                    onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <label className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                    <span>📁</span> Browse...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (evt) => setForm((prev) => ({ ...prev, bannerUrl: evt.target.result }))
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {form.bannerUrl && (
                  <div className="mt-2 relative inline-block group">
                    <img
                      src={form.bannerUrl}
                      alt="Banner Preview"
                      className="h-14 w-36 object-cover rounded-lg border border-white/20 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, bannerUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
                      title="Remove Image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  {editingClub ? 'Save Changes' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          if (confirmState.action) confirmState.action()
        }}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
