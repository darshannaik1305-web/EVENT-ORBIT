import React from 'react'
import FeatureCard from './FeatureCard'

export default function Features() {
  const items = [
    {
      title: 'AI Smart Assistant',
      description: 'Ask questions about guidelines, active coordinators, registration options, or event dates instantly.',
      icon: '🤖',
    },
    {
      title: 'Club Management',
      description: 'Admins can post schedules, control capacities, and manage coordinator approvals seamlessly.',
      icon: '🏛️',
    },
    {
      title: 'Smart Registrations',
      description: 'Single-tap registrations for students. Creates dynamic entries automatically.',
      icon: '📝',
    },
    {
      title: 'Group Team Codes',
      description: 'Generate team codes for group hackathons. Share codes so peers join automatically.',
      icon: '👥',
    },
    {
      title: 'Winner Tracking',
      description: 'Admins assign FIRST, SECOND, and THIRD place winner podiums instantly after conclusion.',
      icon: '🏆',
    },
    {
      title: 'Dynamic Statistics',
      description: 'Get deep campus statistics: counts of registrations, events hosted, and active users.',
      icon: '📊',
    }
  ]

  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 relative">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16 select-none">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Features
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Manage College Activities on a Sleek Framework
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          Say goodbye to emails and excel grids. EventOrbit connects technical clubs and students seamlessly.
        </p>
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
