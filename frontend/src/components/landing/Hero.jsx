import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'
import logoImg from '@/assets/logo.png'

export default function Hero() {
  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 pt-4 pb-8 lg:pt-6 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center select-none">
      {/* Background neon glows */}
      <div className="absolute top-4 left-10 w-96 h-96 bg-primary/20 blur-[160px] rounded-full -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-4 right-10 w-96 h-96 bg-secondary/15 blur-[160px] rounded-full -z-10 animate-pulse duration-[6000ms]" />

      {/* Left side text */}
      <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
        <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0">
          🎉 Campus Event Universe
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
          Discover Events.<br />
          Meet People.<br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent-orange bg-clip-text text-transparent">
            Create Memories.
          </span>
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

      {/* Right side floating interactive card */}
      <div className="lg:col-span-6 flex justify-center">
        <div className="w-full max-w-md bg-[#12182B]/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="EventOrbit Logo" className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              <span className="text-xs font-black text-white tracking-wide uppercase">
                EventOrbit Campus Hub
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              LIVE PLATFORM
            </span>
          </div>

          {/* Platform Feature Modules */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/80 border border-white/5 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-primary/30 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xl text-blue-400">
                🎟️
              </div>
              <div>
                <div className="text-xs font-bold text-white">Smart Event Registrations</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Individual & group team code entry</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 border border-white/5 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-purple-500/30 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xl text-purple-400">
                🤖
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Assistant Guidance</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Instant queries for rules, dates & venues</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/80 border border-white/5 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-amber-500/30 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xl text-amber-400">
                🏆
              </div>
              <div>
                <div className="text-xs font-bold text-white">Official Champion Standings</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Verified podium declarations by club admins</div>
              </div>
            </motion.div>
          </div>

          {/* Footer Badge */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>🛡️ Verified USN System</span>
            <span className="text-emerald-400 font-bold">● Active Portal</span>
          </div>
        </div>
      </div>
    </section>
  )
}