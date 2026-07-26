import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import mockEvents from '@/mock/landing/events'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function UpcomingPreview() {
  return (
    <section id="events" className="w-full max-w-7xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Upcoming Events
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Join Live College Contests</h2>
        <p className="text-sm text-slate-400 font-medium">Browse active technical hackathons, cultural fests, and audits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockEvents.map((evt, index) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
            className="flex flex-col rounded-2xl bg-slate-900/40 border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-xl group"
          >
            {/* Event banner image */}
            <div className="h-44 w-full overflow-hidden relative">
              <img 
                src={evt.image} 
                alt={evt.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/10">
                {evt.category}
              </span>
            </div>
            {/* Details */}
            <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary tracking-wide uppercase">{evt.clubName}</span>
                <h3 className="text-base font-bold text-white mt-1 group-hover:text-primary transition-colors">{evt.title}</h3>
                <div className="flex items-center gap-4 text-slate-400 text-xs mt-3 font-semibold">
                  <span className="flex items-center gap-1">📅 {evt.date}</span>
                  <span className="flex items-center gap-1">🎟️ {evt.seatsLeft} seats left</span>
                </div>
              </div>
              <Link to={ROUTES.LOGIN} className="mt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Register Now
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}