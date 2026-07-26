import React from 'react'
import { motion } from 'framer-motion'
import { weeklyEvents } from '@/mock/landing/events'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function HappeningThisWeek() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-12 relative select-none">
      <div className="flex flex-col gap-2 mb-12 text-left">
        <span className="text-xs font-extrabold text-secondary tracking-wider uppercase">
          📅 Weekly Calendar
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Happening This Week</h2>
        <p className="text-sm text-slate-500 font-medium">Catch these sessions and matchups hosted over the next few days.</p>
      </div>

      <div className="flex flex-col gap-6">
        {weeklyEvents.map((evt, index) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ x: 6, transition: { duration: 0.2 } }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl bg-white/60 border border-slate-200/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-secondary/20 transition-all duration-300 gap-6"
          >
            {/* Left day badge */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-secondary/10 text-secondary flex flex-col items-center justify-center font-bold">
                <span className="text-[10px] uppercase leading-none">{evt.day}</span>
                <span className="text-lg font-black leading-none mt-1">{evt.date.split(' ')[1]}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{evt.club}</span>
                <h3 className="text-base font-bold text-slate-800 leading-snug">{evt.title}</h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-1">
                  <span>🕒 {evt.time}</span>
                  <span>📍 {evt.location}</span>
                </div>
              </div>
            </div>

            {/* CTA action */}
            <Link to={ROUTES.LOGIN} className="w-full md:w-auto">
              <Button variant="outline" size="sm" className="w-full md:w-auto border-slate-200 text-slate-600 hover:text-secondary font-bold">
                Save Spot
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}