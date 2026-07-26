import React from 'react'
import { motion } from 'framer-motion'

export default function AISection() {
  return (
    <section id="chat" className="w-full max-w-5xl mx-auto px-6 py-12 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Description */}
      <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left select-none">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
          AI Chat Assistant
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Instant Answers on Campus Contests
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Need details about registrations, rule guides, or event dates? Send a message to our smart chatbot and get answers instantly.
        </p>
      </div>

      {/* Chat preview box */}
      <div className="lg:col-span-7 flex justify-center mt-6 lg:mt-0 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg bg-white/70 border border-slate-200/50 rounded-3xl overflow-hidden shadow-md flex flex-col h-[320px] backdrop-blur-md"
        >
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200/40 py-4 px-6 flex items-center gap-3">
            <div className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide">EventOrbit Bot</span>
          </div>

          {/* Bubbles */}
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            {/* Student query */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-1 max-w-[85%]"
            >
              <div className="bg-slate-100 py-3 px-4 rounded-3xl rounded-tl-none text-xs text-slate-700 font-semibold">
                What events are scheduled for the Sports Club this weekend?
              </div>
              <span className="text-[9px] text-slate-400 font-bold ml-2">Student (1MJ23CS012)</span>
            </motion.div>

            {/* Bot response */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-1 max-w-[85%] self-end items-end"
            >
              <div className="bg-gradient-to-tr from-primary to-secondary py-3 px-4 rounded-3xl rounded-tr-none text-xs text-white font-semibold shadow-md shadow-primary/10">
                The Sports Club is hosting the Futsal League Matches this Saturday at 09:00 AM on the Main Ground. Save your spot now!
              </div>
              <span className="text-[9px] text-slate-400 font-bold mr-2">AI Assistant</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}