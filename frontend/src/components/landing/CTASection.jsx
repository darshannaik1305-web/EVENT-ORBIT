import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export default function CTASection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 select-none relative overflow-hidden">
      <div className="hero-gradient border border-[#D97706] rounded-3xl p-8 sm:p-12 md:p-16 text-center flex flex-col gap-5 items-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7B1113] via-[#8A1416] to-[#7B1113]" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold tracking-wide relative z-10">
          <span>🎓 MVJ College of Engineering</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-headings font-extrabold text-white leading-tight max-w-2xl relative z-10">
          Ready to Compete & Lead on Campus?
        </h2>

        <p className="text-sm sm:text-base text-white/90 font-normal max-w-lg leading-relaxed relative z-10">
          Sign in with your verified student USN to register for upcoming contests, lead group hackathon teams, and track official podium victories.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center relative z-10 mt-3 w-full sm:w-auto">
          <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-[#F28D1E] font-bold text-sm shadow-md hover:bg-[#F1EFEB] transition-all cursor-pointer">
              Create Student Account
            </button>
          </Link>
          <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#7B1113] hover:bg-[#6F0F11] text-white font-bold text-sm border border-white/20 shadow-sm transition-all cursor-pointer">
              Student / Admin Sign In
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}