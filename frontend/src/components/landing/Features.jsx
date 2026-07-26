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
      title: 'Global Announcements',
      description: 'Broadcast notifications and timing changes directly from club leaders to student portals.',
      icon: '📢'
    }
  ]

  return (
    <section id="features" className="w-full max-w-5xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Features
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">Everything you need to compete</h2>
        <p className="text-sm text-slate-400 font-medium">A single ecosystem built for campus life activities.</p>
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