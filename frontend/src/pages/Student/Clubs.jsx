import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import clubService from '@/services/clubService'

export default function StudentClubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    setLoading(true)
    try {
      const res = await clubService.getAllClubs()
      setClubs(res.data || [])
    } catch (err) {
      console.error('Error fetching clubs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(search.toLowerCase()))
  )

  const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#F28D1E] font-bold animate-pulse flex items-center gap-2">
          <span>🏛️</span> Loading College Clubs Directory...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">
      {/* Header Banner with Primary Orange Header */}
      <div className="bg-[#F28D1E] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold mb-1">
          <span>🏛️ Student Societies & Technical Clubs</span>
          <span>•</span>
          <span>MVJCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-headings font-extrabold text-white tracking-tight">
          College Clubs Directory
        </h1>
        <p className="text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Explore all recognized student clubs at MVJ College of Engineering. View hosted technical contests, cultural events, hackathons, and membership guidelines.
        </p>

        {/* Search Input */}
        <div className="pt-2 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clubs by name or category (e.g. TECH, ART, CODING)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-[#202020] placeholder-[#777777] border border-white/80 rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-black/10 focus:border-white transition-all shadow-sm"
            />
            <span className="absolute left-3 top-2.5 text-xs text-[#666666]">🔍</span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-[#888888] hover:text-[#202020] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="academic-card p-12 rounded-2xl text-center text-[#888888] space-y-2">
          <div className="text-3xl">🏛️</div>
          <div className="font-semibold text-[#555555]">No clubs found matching your search query.</div>
          <p className="text-xs text-[#888888]">Try searching by different keywords or clear your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              onClick={() => navigate(`/clubs/${club.id}`)}
              className="academic-card overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:border-[#F28D1E]/40 group flex flex-col justify-between"
            >
              {/* Restored Original Club Image Background */}
              <div className="h-44 w-full bg-[#F1EFEB] relative overflow-hidden">
                <img
                  src={club.imageUrl || fallbackImage}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = fallbackImage
                  }}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#F28D1E] uppercase border border-[#E5E1DC] shadow-sm">
                  {club.category || 'CAMPUS'}
                </div>
              </div>

              {/* Info Container */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-headings font-bold text-[#202020] group-hover:text-[#F28D1E] transition-colors leading-snug">
                    {club.name}
                  </h3>
                  <p className="text-xs text-[#666666] line-clamp-3 leading-relaxed">
                    {club.description || 'Official college club organizing technical, academic, and cultural activities throughout the year.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E1DC] flex items-center justify-between text-xs font-bold text-[#F28D1E]">
                  <span>View Club & Contests</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
