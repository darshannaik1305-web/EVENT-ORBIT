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
      title: 'Discover Clubs',
      description: 'Explore technical, departmental, and cultural student clubs across MVJCE.',
      icon: '🏛️'
    },
    {
      step: '03',
      title: 'Register for Events',
      description: 'Join hackathons, symposia, or sports contests individually or as a registered team.',
      icon: '📝'
    },
    {
      step: '04',
      title: 'Compete & Win',
      description: 'Showcase your skills, earn validated entry passes, and climb the official victory podium.',
      icon: '🏆'
    }
  ]

  return (
    <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 py-16 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-12">
        <span className="text-xs font-bold text-[#F28D1E] uppercase tracking-widest bg-[#F28D1E]/10 border border-[#F28D1E]/20 px-4 py-1.5 rounded-full w-max mx-auto">
          Workflow Guide
        </span>
        <h2 className="text-3xl sm:text-4xl font-headings font-extrabold text-[#202020] tracking-tight">
          How EventOrbit Works
        </h2>
        <p className="text-sm text-[#666666]">Four streamlined steps from sign-in to verified competition standing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="academic-card flex flex-col gap-4 p-6 rounded-2xl border border-[#E5E1DC] hover:border-[#F28D1E]/30"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E1DC]">
              <span className="text-2xl font-headings font-extrabold text-[#F28D1E]">
                {step.step}
              </span>
              <span className="text-2xl p-1.5 rounded-xl bg-[#F7F6F3]">{step.icon}</span>
            </div>
            <div>
              <h3 className="text-base font-headings font-bold text-[#202020] mb-1.5">{step.title}</h3>
              <p className="text-xs text-[#666666] leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}