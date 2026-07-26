import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import mockClubs from '@/mock/landing/clubs'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function ClubPreview() {
  return (
    <section id="clubs" className="w-full max-w-7xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Campus Communities
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Explore Our Clubs</h2>
        <p className="text-sm text-slate-400 font-medium">Join specialized departmental and cultural organizations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockClubs.map((club, index) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.05 }}
            className="flex flex-col justify-between bg-slate-900/40 border border-white/5 p-6 rounded-2xl hover:border-primary/20 transition-all duration-300 shadow-xl group"
          >
            <div>
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                {club.logo}
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{club.category}</span>
              <h3 className="text-base font-bold text-white mt-1 group-hover:text-primary transition-colors">{club.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">{club.description}</p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500 font-bold">{club.members} Members</span>
              <Link to={ROUTES.LOGIN}>
                <Button variant="link" size="sm">
                  Join Club &rarr;
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}