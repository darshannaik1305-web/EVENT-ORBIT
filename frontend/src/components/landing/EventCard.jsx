import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function EventCard({ id, title, clubName, date, location, seatsLeft, category, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="flex flex-col rounded-3xl bg-white/60 border border-slate-200/50 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group select-none"
    >
      {/* Visual Image container */}
      <div className="h-48 w-full overflow-hidden relative bg-slate-100">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-800 tracking-wider uppercase px-3 py-1 rounded-full border border-slate-100 shadow-sm">
          {category}
        </span>
      </div>

      {/* Details */}
      <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
        <div>
          <span className="text-[10px] font-bold text-primary tracking-wide uppercase">{clubName}</span>
          <h3 className="text-base font-bold text-slate-800 mt-1 leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <div className="flex flex-col gap-2 mt-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              📅 {date}
            </span>
            <span className="flex items-center gap-1.5">
              📍 {location}
            </span>
            <span className="flex items-center gap-1.5 text-orange-600">
              🎟️ {seatsLeft} seats remaining
            </span>
          </div>
        </div>

        <Link to={ROUTES.LOGIN} className="mt-2 block w-full">
          <Button variant="secondary" size="sm" className="w-full shadow-sm">
            Register Event
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}