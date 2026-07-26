import React from 'react'
import { motion } from 'framer-motion'

export default function AboutSection() {
  const points = [
    {
      title: 'For Students',
      description: 'Find active contests, team up using group registration codes, check schedules, and track fests wins.',
      icon: '🎓'
    },
    {
      title: 'For Clubs',
      description: 'Manage attendees lists, post announcements, extend deadlines, and announce podium placements.',
      icon: '🤝'
    },
    {
      title: 'AI Smart Assistant',
      description: 'An integrated chatbot that guides you through contest rules, locations, and coordinator names.',
      icon: '🤖'
    }
  ]

  return (
    <section id="about" className="w-full max-w-5xl mx-auto px-6 py-20 relative select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left side info */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
            About Platform
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Connecting College Clubs & Students
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            EventOrbit is a premium campus platform built to organize technical hackathons, cultural festivals, sports match fixtures, and creative workshops on a unified hub.
          </p>
        </div>

        {/* Right side list */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {points.map((pt, index) => (
            <motion.div
              key={pt.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all duration-300"
            >
              <span className="text-3xl">{pt.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{pt.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">{pt.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}