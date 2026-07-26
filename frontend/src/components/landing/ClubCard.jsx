import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function ClubCard({ name, category, members, upcoming, logo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="flex flex-col justify-between bg-white/60 border border-slate-200/50 backdrop-blur-md p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {logo}
          </span>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
            {category}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="mt-3 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Next Event:</span>
          <span className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-1">
            {upcoming}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-500 font-bold">{members} members</span>
        <Link to={ROUTES.LOGIN}>
          <Button variant="link" size="sm" className="font-bold text-xs">
            Join Club &rarr;
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}