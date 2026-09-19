import React from 'react'
import FeatureCard from './FeatureCard'

export default function Features() {
  const items = [
    {
      title: 'AI Smart Assistant',
      description: 'Ask questions about contest guidelines, schedules, venues, and coordinators in natural language.',
      icon: '🤖'
    },
    {
      title: 'Club Management',
      description: 'Manage departmental and cultural communities. Club Admins can coordinate schedules and review rosters.',
      icon: '🏛️'
    },
    {
      title: 'Event Registration',
      description: 'Single-tap registrations for technical fests, sports match fixtures, and dance audits.',
      icon: '📝'
    },
    {
      title: 'Team Codes & Groups',
      description: 'Generate team codes for group hackathons. Share codes so peers join your team dynamically.',
      icon: '👥'
    },
    {
      title: 'Podium Winner Tracking',
      description: 'Review announcements of winners (1st, 2nd, 3rd places) updated by coordinators instantly.',
      icon: '🏆'
    },
    {
      title: 'Department Guidelines',
      description: 'Instant verified location and faculty coordination records for CS, CG, and other engineering streams.',
      icon: '🏫'
    }
  ]

  return (
    <section id="features" className="w-full max-w-6xl mx-auto px-6 py-16 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-12">
        <span className="text-xs font-bold text-[#F28D1E] uppercase tracking-widest bg-[#F28D1E]/10 border border-[#F28D1E]/20 px-4 py-1.5 rounded-full w-max mx-auto">
          Core Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-headings font-extrabold text-[#202020] tracking-tight">
          Everything You Need to Participate & Compete
        </h2>
        <p className="text-sm text-[#666666]">A unified digital ecosystem engineered for MVJCE students, clubs, and coordinators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((feat, index) => (
          <FeatureCard
            key={feat.title}
            title={feat.title}
            description={feat.description}
            icon={feat.icon}
            delay={index * 0.05}
          />
        ))}
      </div>
    </section>
  )
}