import React from 'react'
import { motion } from 'framer-motion'

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Register Profile',
      description: 'Create an account using your student USN to authenticate on the campus portal.',
      icon: '👤',
    },
    {
      step: '02',
      title: 'Join Clubs',
      description: 'Explore campus communities and technical departments that match your skillsets.',
      icon: '🔗',
    },
    {
      step: '03',
      title: 'Participate & Team Up',
      description: 'Register for live coding contests, create team codes, and check schedules.',
      icon: '🚀',
    },
    {
      step: '04',
      title: 'Win & Rise',
      description: 'Compete, earn top podium spots, and check dynamic leaderboards.',
      icon: '🥇',
    }
  ]

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Process Map
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">How EventOrbit Works</h2>
        <p className="text-sm text-slate-400 font-medium">Follow 4 simple steps to start competing in campus events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
            className="flex flex-col gap-4 bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative z-10"
          >
            <div className="flex justify-between items-center">
              <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent opacity-85">
                {step.step}
              </span>
              <span className="text-lg">{step.icon}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}