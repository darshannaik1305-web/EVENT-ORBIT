import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import HeroCard from './HeroCard'
import { ROUTES } from '@/config/routes'

export default function Hero() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-100px)]">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/20 blur-[150px] rounded-full -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/15 blur-[150px] rounded-full -z-10 animate-pulse duration-[6000ms]" />

      {/* Left side text */}
      <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
          One Platform.<br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Every Club.</span><br />
          Every Event.
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
          Discover college hackathons, connect with campus technical clubs, coordinate team codes, check dynamic winner boards, and talk to your personal AI college assistant.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mt-2">
          <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
            <Button variant="primary" className="shadow-lg hover:shadow-primary/30 w-full">
              Get Started
            </Button>
          </Link>
          <a href="#events" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Explore Events
            </Button>
          </a>
        </div>
      </div>

      {/* Right side orbit visuals */}
      <div className="lg:col-span-6 h-[500px] relative flex items-center justify-center select-none mt-12 lg:mt-0">
        {/* Central Core Pulsing Orb */}
        <div className="absolute h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-base font-black shadow-lg shadow-primary/30 z-20">
          EO
        </div>

        {/* Orbit Ring 1 - Outer */}
        <motion.div
          className="absolute h-96 w-96 rounded-full border border-dashed border-primary/25 z-0"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
        >
          <div className="absolute -top-1.5 left-[calc(50%-6px)] h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary" />
          <div className="absolute -bottom-1.5 right-[calc(50%-6px)] h-3 w-3 rounded-full bg-secondary shadow-lg shadow-secondary" />
        </motion.div>

        {/* Orbit Ring 2 - Inner */}
        <motion.div
          className="absolute h-64 w-64 rounded-full border border-dashed border-secondary/30 z-0"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        >
          <div className="absolute -top-1 left-[calc(50%-4px)] h-2 w-2 rounded-full bg-secondary shadow-lg shadow-secondary" />
        </motion.div>

        {/* Floating Preview Cards */}
        <HeroCard
          title="Nexus Hackathon 2026"
          subtitle="Coding Club • Seats Left: 14"
          badge="Upcoming Event"
          icon="💻"
          initialX={-20}
          initialY={-140}
          duration={3.5}
          className="left-4 lg:left-12"
        />

        <HeroCard
          title="Team registration success!"
          subtitle="Team Code: NEX-880"
          badge="Registration"
          icon="✓"
          initialX={60}
          initialY={140}
          duration={4}
          className="right-4 lg:right-12"
        />

        <HeroCard
          title="Karan Sharma wins 1st!"
          subtitle="Auditions • Rhythm Fest"
          badge="Podium Winner"
          icon="🏆"
          initialX={-50}
          initialY={70}
          duration={3}
          className="left-8 lg:left-20"
        />

        <HeroCard
          title="Ask about Hackathon rules..."
          subtitle="AI Bot: Responding..."
          badge="AI Assistant"
          icon="🤖"
          initialX={80}
          initialY={-80}
          duration={4.5}
          className="right-8 lg:right-20"
        />
      </div>
    </section>
  )
}
