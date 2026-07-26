import React from 'react'
import { motion } from 'framer-motion'

export default function QuickActionCard({ label, description, icon, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 text-left w-full transition-all cursor-pointer select-none"
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg select-none">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white leading-snug">{label}</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">{description}</p>
      </div>
    </motion.button>
  )
}