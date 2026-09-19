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
      console.error('Error saving club:', err)
      toast.error(err.response?.data?.message || 'Failed to save club')
    }
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop'

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#F28D1E]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F28D1E]/10 border border-[#F28D1E]/20 text-[#F28D1E] text-xs font-bold mb-1">
            <span>🏛️ Club Directory</span>
            <span>•</span>
            <span>Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-[#202020] flex items-center gap-2">
            <span>🏛️</span> Manage Campus Clubs
          </h1>
          <p className="text-[#666666] text-xs sm:text-sm mt-1">
            Register new technical societies, cultural clubs, upload branding banners, and manage existing entities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>✨</span> Add New Club
        </button>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#F28D1E] font-bold animate-pulse">Loading clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="academic-card p-12 text-center text-[#888888]">
          No clubs registered yet. Click "Add New Club" to create your first club!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c) => (
            <div key={c.id} className="academic-card overflow-hidden flex flex-col justify-between hover:border-[#F28D1E]/40 transition-all">
              {/* Cover Image with Fallback */}
              <div className="h-40 w-full bg-[#F1EFEB] relative overflow-hidden">
                <img
                  src={c.imageUrl || fallbackImage}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = fallbackImage
                  }}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#F28D1E] uppercase border border-[#E5E1DC] shadow-sm">
                  {c.category || 'TECH'}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-headings font-bold text-[#202020]">{c.name}</h3>
                  <p className="text-xs text-[#666666] line-clamp-2 mt-1 leading-relaxed">
                    {c.description || 'College club for student workshops and competitions.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E1DC] flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="px-3 py-1.5 bg-white hover:bg-[#F1EFEB] text-[#202020] text-xs font-bold rounded-lg border border-[#E5E1DC] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="px-3 py-1.5 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] text-xs font-bold rounded-lg border border-[#B42318]/20 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E1DC] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E1DC] pb-3">
              <h3 className="text-lg font-headings font-bold text-[#202020] flex items-center gap-2">
                <span>🏫</span> {editingClub ? 'Edit Club' : 'Add New Club'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-[#202020] cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#555555] mb-1">Club Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Coding Club"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] focus:outline-none focus:border-[#F28D1E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555555] mb-1">Category (Optional)</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] focus:outline-none focus:border-[#F28D1E] cursor-pointer"
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
                <label className="block text-xs font-bold text-[#555555] mb-1">Description</label>
                <textarea
                  placeholder="Brief overview of club activities..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] focus:outline-none focus:border-[#F28D1E] h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555555] mb-1">Club Cover Image (URL or Browse File)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste image URL or browse local file..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] focus:outline-none focus:border-[#F28D1E]"
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
                      className="h-16 w-24 object-cover rounded-lg border border-[#E5E1DC] shadow-md"
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
                <label className="block text-xs font-bold text-[#555555] mb-1">Club Header Banner Image (Optional)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste banner URL or browse local file..."
                    value={form.bannerUrl}
                    onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-[#E5E1DC] rounded-xl text-xs text-[#202020] focus:outline-none focus:border-[#F28D1E]"
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
                      className="h-14 w-36 object-cover rounded-lg border border-[#E5E1DC] shadow-md"
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

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DC]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#E5E1DC] hover:bg-[#F1EFEB] text-[#555555] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28D1E] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F28D1E]/25 cursor-pointer"
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
