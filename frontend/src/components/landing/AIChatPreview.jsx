import React from 'react'
import { motion } from 'framer-motion'

export default function AIChatPreview() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Text column */}
      <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left select-none">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
          AI Chat Assistant
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Instant Answers with AI Chatbots
        </h2>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          Ask questions about guidelines, active coordinators, registration options, or event schedules. Our AI Assistant responds in seconds to keep you informed.
        </p>
      </div>

      {/* Chat window preview column */}
      <div className="lg:col-span-7 flex justify-center mt-6 lg:mt-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[320px]"
        >
          {/* Header */}
          <div className="bg-slate-900 border-b border-white/5 py-4 px-6 flex items-center gap-3 select-none">
            <div className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">EventOrbit Assistant</span>
          </div>

          {/* Chat bubbles */}
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            {/* Student question */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-1 max-w-[80%]"
            >
              <div className="bg-white/5 border border-white/10 py-2.5 px-4 rounded-2xl rounded-tl-none text-xs text-slate-200 font-medium">
                When is the last date to register for the Coding Club Hackathon?
              </div>
              <span className="text-[9px] text-slate-500 font-bold ml-1">Student (USN: 1MJ23CS012)</span>
            </motion.div>

            {/* AI response */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="flex flex-col gap-1 max-w-[80%] align-self-end items-end self-end"
            >
              <div className="bg-gradient-to-tr from-primary to-secondary py-2.5 px-4 rounded-2xl rounded-tr-none text-xs text-white font-medium">
                The registration for the Nexus Hackathon ends on August 15, 2026. Make sure to create a team code if registering in a group!
              </div>
              <span className="text-[9px] text-slate-500 font-bold mr-1">AI Assistant</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}