import React from 'react'
import { motion } from 'framer-motion'

export default function AIChatPreview() {
  return (
    <section id="ai-chat" className="w-full max-w-5xl mx-auto px-6 py-20 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center select-none">
      <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
          AI Chat Assistant
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Instant Campus Guidelines
        </h2>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          Ask questions about rules, active coordinators, registration options, or contest schedules. Get responses instantly.
        </p>
      </div>

      <div className="lg:col-span-7 flex justify-center mt-6 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg bg-[#12182B]/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[320px] backdrop-blur-md"
        >
          {/* Header */}
          <div className="bg-slate-900/60 border-b border-white/5 py-4 px-6 flex items-center gap-3">
            <div className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-extrabold text-white tracking-wide">EventOrbit Bot</span>
          </div>

          {/* Bubbles */}
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-1 max-w-[85%]"
            >
              <div className="bg-white/5 py-3 px-4 rounded-3xl rounded-tl-none text-xs text-slate-200 font-semibold border border-white/5">
                When is the Coding Club Hackathon?
              </div>
              <span className="text-[9px] text-slate-500 font-bold ml-2">Student (1MJ23CS012)</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-1 max-w-[85%] self-end items-end"
            >
              <div className="bg-gradient-to-tr from-primary to-secondary py-3 px-4 rounded-3xl rounded-tr-none text-xs text-white font-semibold shadow-md shadow-primary/10">
                The Coding Club Hackathon starts on August 18 at 9:00 AM in the Main Seminar Hall. Remember to register before Aug 15!
              </div>
              <span className="text-[9px] text-slate-500 font-bold mr-2">AI Assistant</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}