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
            <Button variant="outline" className="w-full sm:px-8 py-3 text-sm font-bold bg-white text-primary border-white hover:bg-slate-50 transition-all duration-300 shadow-lg">
              Create Account
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:px-8 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all duration-300">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}