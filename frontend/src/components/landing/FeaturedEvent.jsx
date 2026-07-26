import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import { featuredEvent } from '@/mock/landing/events'
import { ROUTES } from '@/config/routes'

export default function FeaturedEvent() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-12 relative select-none">
      <div className="flex flex-col gap-2 mb-10 text-left">
        <span className="text-xs font-extrabold text-primary tracking-wider uppercase">
          ⭐️ Spotlight Event
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Featured Event</h2>
        <p className="text-sm text-slate-500 font-medium">The most anticipated college celebration this semester.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row rounded-3xl bg-white/60 border border-slate-200/50 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
      >
        {/* Banner image */}
        <div className="h-64 lg:h-auto lg:w-1/2 overflow-hidden relative bg-slate-100">
          <img 
            src={featuredEvent.image} 
            alt={featuredEvent.title} 
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
          />
          <span className="absolute top-4 left-4 bg-primary text-[10px] font-black text-white tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
            {featuredEvent.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-primary tracking-wide uppercase">
              {featuredEvent.clubName}
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mt-2 group-hover:text-primary transition-colors leading-tight">
              {featuredEvent.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-4 leading-relaxed">
              {featuredEvent.description}
            </p>

            <div className="flex flex-col gap-2 mt-6 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-2">
                📅 {featuredEvent.date}
              </span>
              <span className="flex items-center gap-2">
                📍 {featuredEvent.location}
              </span>
              <span className="flex items-center gap-2 text-orange-600">
                🎟️ {featuredEvent.seatsLeft} slots left
              </span>
            </div>
          </div>

          <Link to={ROUTES.LOGIN} className="block w-full">
            <Button variant="primary" className="w-full shadow-md shadow-primary/20">
              Register Festival Ticket
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}