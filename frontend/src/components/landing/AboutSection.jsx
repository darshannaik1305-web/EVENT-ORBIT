import React from 'react'
import { motion } from 'framer-motion'

export default function AboutSection() {
  const points = [
    {
      title: 'For Engineering Students',
      description: 'Find active contests, team up using group registration codes, check schedules, and track verified certificate podium wins.',
      icon: '🎓'
    },
    {
      title: 'For College Clubs & Societies',
      description: 'Manage attendees lists, post announcements, extend deadlines, and announce official podium placements seamlessly.',
      icon: '🤝'
    },
    {
      title: 'RAG-Powered Campus Assistant',
      description: 'An integrated conversational AI that provides instant verified answers on rules, campus locations, and faculty coordinators.',
      icon: '🤖'
    }
  ]

  return (
    <section id="about" className="w-full max-w-6xl mx-auto px-6 py-16 relative select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left side info */}
        <div className="lg:col-span-5 flex flex-col gap-4 text-center lg:text-left">
          <span className="text-xs font-bold text-[#F28D1E] uppercase tracking-widest bg-[#F28D1E]/10 border border-[#F28D1E]/20 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
            About EventOrbit
          </span>
          <h2 className="text-3xl sm:text-4xl font-headings font-extrabold text-[#202020] tracking-tight leading-tight">
            Bridging College Clubs, Contests & Students
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed">
            EventOrbit is the institutional event management platform built specifically for MVJ College of Engineering. We streamline student participation, club governance, and campus contest visibility on one unified portal.
          </p>
        </div>

        {/* Right side list */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {points.map((pt, index) => (
            <motion.div
              key={pt.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="academic-card flex items-start gap-4 p-5 rounded-2xl border border-[#E5E1DC] hover:border-[#7B1113]/30"
            >
              <span className="text-3xl p-2 rounded-xl bg-[#F7F6F3] border border-[#E5E1DC]">{pt.icon}</span>
              <div>
                <h3 className="text-sm font-headings font-bold text-[#202020] leading-snug">{pt.title}</h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">{pt.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}