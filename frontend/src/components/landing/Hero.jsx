import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import HeroCard from './HeroCard'
import { ROUTES } from '@/config/routes'

export default function Hero() {
  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-100px)] overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/20 blur-[160px] rounded-full -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/15 blur-[160px] rounded-full -z-10 animate-pulse duration-[6000ms]" />

      {/* Left side text */}
      <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
        <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
          🎉 Campus Event Universe
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
          Discover Events.<br />
          Meet People.<br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent-orange bg-clip-text text-transparent">Create Memories.</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
          EventOrbit is your daily college gateway. Find hackathons, fests, matching codes, and coordinate registrations with our smart chatbot.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mt-2 w-full sm:w-auto">
          <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
            <Button variant="primary" className="shadow-lg shadow-primary/20 w-full sm:px-8">
              Get Started
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:px-8 border-white/10 hover:bg-white/5">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Right side floating fests cards */}
      <div className="lg:col-span-6 h-[460px] relative flex items-center justify-center select-none mt-12 lg:mt-0">
        {/* Decorative dynamic background concentric rings */}
        <div className="absolute h-80 w-80 rounded-full border border-white/5 border-dashed animate-[spin_60s_linear_infinite]" />
        <div className="absolute h-56 w-56 rounded-full border border-white/5 animate-[spin_30s_linear_infinite_reverse]" />
        
        <HeroCard
          title="Coding Club Hackathon"
          subtitle="Aug 18 • Seminar Hall"
          badge="Technical"
          icon="💻"
          initialX={-30}
          initialY={-120}
          duration={3.5}
          className="left-4 lg:left-8"
        />

        <HeroCard
          title="Karan Sharma Wins 1st!"
          subtitle="Dance Auditions podium"
          badge="Winner Board"
          icon="🏆"
          initialX={40}
          initialY={120}
          duration={4}
          className="right-4 lg:right-8"
        />

        <HeroCard
          title="Futsal League Match"
          subtitle="Aug 01 • Main Field"
          badge="Sports"
          icon="⚽"
          initialX={-50}
          initialY={60}
          duration={3}
          className="left-8 lg:left-12"
        />

        <HeroCard
          title="Acoustic Jam Session"
          subtitle="Jul 30 • Quadrangle"
          badge="Music"
          icon="🎵"
          initialX={60}
          initialY={-60}
          duration={4.5}
          className="right-8 lg:right-12"
        />
      </div>
    </section>
  )
}