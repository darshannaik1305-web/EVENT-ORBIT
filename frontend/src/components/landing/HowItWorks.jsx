import React from 'react'
import { motion } from 'framer-motion'

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Authenticate instantly on the platform using your verified student USN.',
      icon: '👤'
    },
    {
      step: '02',
      title: 'Join Clubs',
      description: 'Explore technical and cultural departmental communities and subscribe to fests alerts.',
      icon: '🔗'
    },
    {
      step: '03',
      title: 'Register for Events',
      description: 'Join hackathons, matches, or dance workshops as an individual or via group team codes.',
      icon: '🚀'
    },
    {
      step: '04',
      title: 'Participate & Win',
      description: 'Showcase your skills on fests grounds and win top podium slots highlighted on live leaderboards.',
      icon: '🏆'
    }
  ]

  return (
    <section id="how-it-works" className="w-full max-w-5xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Workflow Map
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">How It Works</h2>
        <p className="text-sm text-slate-400 font-medium">Follow four simple steps to get started in campus events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="flex flex-col gap-4 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md relative z-10"
          >
            <div className="flex justify-between items-center">
              <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {step.step}
              </span>
              <span className="text-xl">{step.icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}