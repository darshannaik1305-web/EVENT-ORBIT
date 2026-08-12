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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-primary font-bold animate-pulse flex items-center gap-2">
          <span>🏛️</span> Loading Clubs Directory...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl space-y-3">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <span>🏛️</span> College Clubs
        </h1>
        <p className="text-slate-400 text-xs md:text-sm max-w-xl">
          Explore all official student clubs, view hosted events, and connect with club champions.
        </p>

        {/* Search Input */}
        <div className="pt-2">
          <input
            type="text"
            placeholder="Search clubs by name or category (e.g. TECH, ART, DANCE)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="bg-slate-900 border border-white/5 p-12 rounded-3xl text-center text-slate-500">
          No clubs found matching your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop'

            return (
              <div
                key={club.id}
                onClick={() => navigate(`/clubs/${club.id}`)}
                className="bg-slate-900 border border-white/10 hover:border-primary/50 rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between"
              >
                {/* Image Container with Fallback (Mandatory Fix 3) */}
                <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
                  <img
                    src={club.imageUrl || fallbackImage}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = fallbackImage
                    }}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-primary uppercase border border-white/10">
                    {club.category || 'CAMPUS'}
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {club.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {club.description || 'Official college club organizing technical & cultural activities throughout the year.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Explore Hosted Events</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
