import React from 'react'
import { motion } from 'framer-motion'
import mockTestimonials from '@/mock/landing/testimonials'

export default function Testimonials() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Testimonials
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Student Experiences</h2>
        <p className="text-sm text-slate-400 font-medium">Hear how students and club coordinators manage fests on EventOrbit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockTestimonials.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
            className="flex flex-col justify-between bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-xl hover:border-primary/20 transition-all duration-300"
          >
            <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
              "{test.content}"
            </p>
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
              <img 
                src={test.avatar} 
                alt={test.name} 
                className="h-10 w-10 rounded-full object-cover border border-white/10" 
              />
              <div>
                <h4 className="text-xs font-bold text-white">{test.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">{test.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}