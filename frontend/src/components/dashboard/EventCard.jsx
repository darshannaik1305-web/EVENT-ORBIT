import React from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'

export default function EventCard({ 
  title, 
  clubName, 
  date, 
  location, 
  seatsLeft, 
  category, 
  image, 
  onAction, 
  actionLabel = 'Register' 
}) {
  const categoryAccents = {
    Technical: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    Tech: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    Coding: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    Music: 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-pink-500/10',
    Sports: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-500/10',
    Photography: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
    Creative: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
    Cultural: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
    Dance: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
    Robotics: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10'
  }
  const accent = categoryAccents[category] || 'text-primary bg-primary/10 border-primary/20 shadow-primary/10'

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex flex-col bg-[#12182B] border border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-white/10 transition-all duration-300 select-none"
    >
      <div className="h-40 w-full overflow-hidden relative bg-slate-800">
        <img 
          src={image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
        <span className={`absolute top-4 left-4 border backdrop-blur-sm text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md ${accent}`}>
          {category}
        </span>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{clubName}</span>
          <h3 className="text-sm font-bold text-white mt-1 leading-snug line-clamp-1">
            {title}
          </h3>
          <div className="flex flex-col gap-1.5 mt-3 text-[11px] font-semibold text-slate-400">
            <span>📅 {date}</span>
            <span>📍 {location}</span>
            <span className="text-orange-500">🎟️ {seatsLeft} slots left</span>
          </div>
        </div>

        {onAction && (
          <Button variant="secondary" size="sm" onClick={onAction} className="w-full text-xs py-2 shadow-sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}