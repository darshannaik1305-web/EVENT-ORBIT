import React from 'react'
import { motion } from 'framer-motion'

export default function HeroCard({ title, subtitle, badge, icon, className = '', initialY = 0, initialX = 0, duration = 3 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initialY + 20, x: initialX }}
      animate={{ 
        opacity: 1, 
        y: [initialY, initialY - 10, initialY],
      }}
      transition={{ 
        opacity: { duration: 0.5, ease: 'easeOut' },
        y: { repeat: Infinity, duration: duration, ease: 'easeInOut' }
      }}
      whileHover={{ y: initialY - 15, scale: 1.02, transition: { duration: 0.2 } }}
      className={`absolute bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl w-60 select-none cursor-pointer flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full">
          {badge}
        </span>
        <span className="text-sm">{icon}</span>
      </div>
      <div>
        <h4 className="text-xs font-bold text-white leading-snug">{title}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </motion.div>
  )
}