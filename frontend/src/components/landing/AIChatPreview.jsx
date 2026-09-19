import React from 'react'
import { motion } from 'framer-motion'

export default function AIChatPreview() {
  return (
    <section id="ai-chat" className="w-full max-w-6xl mx-auto px-6 py-16 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center select-none">
      <div className="lg:col-span-5 flex flex-col gap-4 text-center lg:text-left">
        <span className="text-xs font-bold text-[#F28D1E] uppercase tracking-widest bg-[#F28D1E]/10 border border-[#F28D1E]/20 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
          Intelligent Assistant
        </span>
        <h2 className="text-3xl sm:text-4xl font-headings font-extrabold text-[#202020] tracking-tight leading-tight">
          Instant Verified Campus Answers
        </h2>
        <p className="text-sm text-[#666666] leading-relaxed">
          Ask questions about contest schedules, campus locations, club coordinators, scholarship steps, or your personal winnings. Receive verified, hallucination-free answers backed by college databases.
        </p>
      </div>

      <div className="lg:col-span-7 flex justify-center mt-4 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg academic-card rounded-2xl overflow-hidden shadow-lg flex flex-col h-[320px] bg-[#F7F6F3]"
        >
          {/* Header */}
          <div className="bg-white border-b border-[#E5E1DC] py-3.5 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 bg-[#287A4B] rounded-full animate-pulse" />
              <span className="text-xs font-headings font-bold text-[#202020] tracking-wide">
                EventOrbit AI Assistant
              </span>
            </div>
            <span className="text-[10px] text-[#F28D1E] font-bold font-mono">
              [KNOWLEDGE + DB]
            </span>
          </div>

          {/* Bubbles */}
          <div className="flex-1 p-5 flex flex-col gap-3.5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-1 max-w-[85%]"
            >
              <div className="bg-white py-2.5 px-4 rounded-xl rounded-tl-none text-xs text-[#202020] border border-[#E5E1DC] shadow-sm">
                Where is the CG department located and who is the coordinator?
              </div>
              <span className="text-[10px] text-[#888888] ml-1">Student Inquiry</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-1 max-w-[85%] self-end items-end"
            >
              <div className="bg-[#F28D1E] text-white py-2.5 px-4 rounded-xl rounded-tr-none text-xs leading-relaxed shadow-sm font-medium">
                The CG (Computer Graphics & Engineering) department is located in the New Building on the 2nd Floor.
              </div>
              <div className="flex items-center gap-1.5 mr-1">
                <span className="text-[9px] font-mono font-bold text-[#7B1113] bg-[#7B1113]/10 px-1.5 py-0.2 rounded border border-[#7B1113]/25">
                  [KNOWLEDGE: CG]
                </span>
                <span className="text-[10px] text-[#888888]">EventOrbit Bot</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}