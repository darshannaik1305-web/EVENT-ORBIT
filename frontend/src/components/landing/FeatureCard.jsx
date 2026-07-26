import React from 'react'
import { motion } from 'framer-motion'

export default function FeatureCard({ title, description, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:border-primary/30 transition-colors duration-300 shadow-xl group flex flex-col gap-4 select-none"
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">{description}</p>
      </div>
    </motion.div>
  )
}