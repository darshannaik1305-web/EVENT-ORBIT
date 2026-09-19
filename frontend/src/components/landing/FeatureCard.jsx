import React from 'react'
import { motion } from 'framer-motion'

export default function FeatureCard({ title, description, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      whileHover={{ y: -4 }}
      className="academic-card p-6 rounded-2xl hover:border-[#F28D1E]/40 shadow-sm flex flex-col gap-4 select-none"
    >
      <div className="h-11 w-11 rounded-xl bg-[#F28D1E]/10 text-[#F28D1E] border border-[#F28D1E]/20 flex items-center justify-center font-bold text-xl shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-headings font-bold text-[#202020] mb-1.5 leading-snug">{title}</h3>
        <p className="text-xs text-[#666666] leading-relaxed font-normal">{description}</p>
      </div>
    </motion.div>
  )
}