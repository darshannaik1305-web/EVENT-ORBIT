import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function CTASection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20 select-none relative overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/15 rounded-3xl p-8 md:p-16 text-center flex flex-col gap-6 items-center relative overflow-hidden shadow-2xl">
        {/* Orbital decorative background */}
        <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full border border-dashed border-white/5 animate-[spin_60s_linear_infinite]" />
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-xl relative z-10">
          Ready to Join the Event Universe?
        </h2>
        <p className="text-sm md:text-base text-slate-300 font-medium max-w-md leading-relaxed relative z-10">
          Create your student profile today, join technical communities, and track your contest achievements.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center relative z-10 mt-4 w-full sm:w-auto">
          <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
            <Button variant="primary" className="shadow-lg hover:shadow-primary/30 w-full">
              Create Account
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}