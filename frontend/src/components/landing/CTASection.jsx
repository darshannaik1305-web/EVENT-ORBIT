import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function CTASection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-20 select-none relative overflow-hidden">
      <div className="bg-gradient-to-tr from-primary to-secondary border border-white/10 rounded-3xl p-8 md:p-16 text-center flex flex-col gap-6 items-center relative overflow-hidden shadow-2xl shadow-primary/10">
        <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full border border-dashed border-white/5 animate-[spin_60s_linear_infinite]" />
        
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-xl relative z-10">
          Ready to Join the Event Universe?
        </h2>
        <p className="text-sm md:text-base text-slate-200 font-medium max-w-md leading-relaxed relative z-10">
          Sign up with your student USN profile today, coordinate team registrations, and follow active fests standings.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center relative z-10 mt-4 w-full sm:w-auto">
          <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-950 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition-all hover:scale-105 cursor-pointer">
              Create Account
            </button>
          </Link>
          <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 text-white font-extrabold text-sm border border-white/25 hover:border-white/50 shadow-xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}