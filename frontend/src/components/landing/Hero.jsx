import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'
import logoImg from '@/assets/logo.png'

export default function Hero() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 pt-4 pb-12 select-none">
      {/* Institutional Hero Banner Container with pure CSS Primary Orange gradient */}
      <div className="hero-gradient rounded-3xl border border-[#D97706] p-8 sm:p-12 lg:p-14 shadow-xl relative overflow-hidden">
        {/* Subtle top maroon accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7B1113] via-[#8A1416] to-[#7B1113]" />

        {/* Abstract CSS decorative shapes */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full border border-[#7B1113]/30 pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-60 h-60 rounded-full bg-white/10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold w-max mx-auto lg:mx-0 tracking-wide">
              <span>🏛️ MVJ College of Engineering</span>
              <span>•</span>
              <span>EventOrbit Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-headings font-extrabold tracking-tight leading-[1.15] text-white">
              Events. Connect. <br className="hidden sm:inline" />
              <span className="text-white drop-shadow-sm underline decoration-[#7B1113] decoration-4">
                Participate.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/90 font-normal max-w-xl leading-relaxed mx-auto lg:mx-0">
              The official centralized campus event management and intelligent RAG assistant platform for MVJCE. Discover departmental hackathons, cultural fests, team registrations, and real-time victory podiums.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start pt-2 w-full sm:w-auto">
              <Link to={ROUTES.STUDENT.EVENTS} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="bg-white text-[#F28D1E] border-white hover:bg-[#F1EFEB] font-bold shadow-md w-full sm:px-7"
                >
                  Explore Events →
                </Button>
              </Link>
              <Link to={ROUTES.STUDENT.AI_ASSISTANT} className="w-full sm:w-auto">
                <Button
                  variant="maroon"
                  className="w-full sm:px-7 font-bold border border-white/20"
                >
                  Ask AI Assistant 🤖
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Floating Institutional Feature Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-[#E5E1DC] text-[#202020]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5E1DC] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <img src={logoImg} alt="EventOrbit Logo" className="h-6 w-6 object-contain" />
                  <span className="text-xs font-headings font-bold text-[#202020] tracking-wide uppercase">
                    Campus Event Portal
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#287A4B] bg-[#287A4B]/10 border border-[#287A4B]/20 px-2 py-0.5 rounded-full">
                  ● ACTIVE
                </span>
              </div>

              {/* Feature Modules */}
              <div className="space-y-2.5">
                <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#7B1113]/10 text-[#7B1113] text-lg">
                    🎟️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202020]">Smart Registrations</div>
                    <div className="text-[11px] text-[#666666]">Individual & group team entries</div>
                  </div>
                </div>

                <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F28D1E]/10 text-[#F28D1E] text-lg">
                    🤖
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202020]">RAG AI Campus Assistant</div>
                    <div className="text-[11px] text-[#666666]">Instant answers for venues, dates & rules</div>
                  </div>
                </div>

                <div className="bg-[#F7F6F3] border border-[#E5E1DC] p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563A6]/10 text-[#2563A6] text-lg">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202020]">Champion Standings</div>
                    <div className="text-[11px] text-[#666666]">Official podium declarations by club admins</div>
                  </div>
                </div>
              </div>

              {/* Footer Badge */}
              <div className="pt-2 border-t border-[#E5E1DC] flex items-center justify-between text-[10px] text-[#888888] font-mono">
                <span>MVJCE Verified Portal</span>
                <span className="font-bold text-[#F28D1E]">v2.0 Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}