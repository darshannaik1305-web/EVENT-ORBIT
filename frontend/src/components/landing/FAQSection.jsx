import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mockFaqs from '@/mock/landing/faq'

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left py-2 text-slate-200 hover:text-white transition-colors cursor-pointer select-none font-bold text-sm md:text-base gap-4"
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-primary font-bold text-xs select-none"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed pb-4 pt-2">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  return (
    <section id="faqs" className="w-full max-w-3xl mx-auto px-6 py-20 relative">
      <div className="text-center flex flex-col gap-4 mb-16 select-none">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          FAQs
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
        <p className="text-sm text-slate-400 font-medium">Got questions? We have answers.</p>
      </div>

      <div className="flex flex-col border-t border-white/5">
        {mockFaqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  )
}