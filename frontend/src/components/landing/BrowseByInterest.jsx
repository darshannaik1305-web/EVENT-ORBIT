import React from 'react'
import { motion } from 'framer-motion'
import mockClubs from '@/mock/landing/clubs'
import ClubCard from './ClubCard'

export default function BrowseByInterest() {
  const categories = [
    { label: 'Technical', icon: '💻', color: 'from-blue-500/10 to-indigo-500/10 text-indigo-700 border-indigo-200/50' },
    { label: 'Music & Jamming', icon: '🎵', color: 'from-pink-500/10 to-rose-500/10 text-rose-700 border-rose-200/50' },
    { label: 'Sports Leagues', icon: '⚽', color: 'from-green-500/10 to-emerald-500/10 text-emerald-700 border-emerald-200/50' },
    { label: 'Cultural & Dance', icon: '💃', color: 'from-purple-500/10 to-fuchsia-500/10 text-fuchsia-700 border-fuchsia-200/50' },
    { label: 'Photography', icon: '📸', color: 'from-cyan-500/10 to-teal-500/10 text-teal-700 border-teal-200/50' },
    { label: 'Creative Arts', icon: '🎨', color: 'from-orange-500/10 to-amber-500/10 text-amber-700 border-amber-200/50' }
  ]

  return (
    <section id="clubs" className="w-full max-w-5xl mx-auto px-6 py-12 relative select-none">
      {/* Category Section */}
      <div className="flex flex-col gap-2 mb-10 text-left">
        <span className="text-xs font-extrabold text-primary tracking-wider uppercase">
          🌈 Browse by Interest
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">What are you into?</h2>
        <p className="text-sm text-slate-500 font-medium">Click category badges to filter through departmental clubs.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border bg-gradient-to-br ${cat.color} cursor-pointer shadow-sm`}
          >
            <span className="text-3xl mb-2">{cat.icon}</span>
            <span className="text-xs font-bold text-center leading-tight">{cat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Popular Clubs list */}
      <div className="flex flex-col gap-2 mb-10 text-left">
        <span className="text-xs font-extrabold text-primary tracking-wider uppercase">
          💎 Campus Communities
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Popular Clubs</h2>
        <p className="text-sm text-slate-500 font-medium">Join specialized departmental and cultural organizations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClubs.map((club) => (
          <ClubCard key={club.id} {...club} />
        ))}
      </div>
    </section>
  )
}