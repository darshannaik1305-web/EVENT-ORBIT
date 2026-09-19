import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/config/routes'

export default function Footer() {
  return (
    <footer className="bg-[#6F0F11] text-white border-t-2 border-[#7B1113] pt-16 pb-12 select-none relative z-10">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission Statement Column */}
          <div className="lg:col-span-5 space-y-4">
            <Link to={ROUTES.LANDING} className="inline-block">
              <Logo size="sm" variant="light" />
            </Link>
            <p className="text-xs text-[#F1EFEB]/80 font-medium leading-relaxed max-w-sm">
              EventOrbit is the official campus event portal for MVJ College of Engineering. Discover departmental contests, cultural fests, team registrations, AI assistant guidance, and live victory podium standings.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D6A84F]" />
              <span>MVJCE Campus Event Portal</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase text-[#D6A84F] tracking-wider font-headings">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#F1EFEB]/70 font-medium">
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  About EventOrbit
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-white transition-colors">
                  Key Capabilities
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to={ROUTES.STUDENT.EVENTS} className="hover:text-white transition-colors">
                  Events Catalog
                </Link>
              </li>
              <li>
                <Link to={ROUTES.STUDENT.RESULTS} className="hover:text-white transition-colors">
                  Champion Standings
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Guidelines */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase text-[#D6A84F] tracking-wider font-headings">
              Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-[#F1EFEB]/70 font-medium">
              <li>
                <span className="text-white/60">MVJCE Guidelines</span>
              </li>
              <li>
                <span className="text-white/60">Event Participation Rules</span>
              </li>
              <li>
                <span className="text-white/60">Club Registration Codes</span>
              </li>
            </ul>
          </div>

          {/* Support & Access */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase text-[#D6A84F] tracking-wider font-headings">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs text-[#F1EFEB]/70 font-medium">
              <li>
                <Link to={ROUTES.STUDENT.AI_ASSISTANT} className="hover:text-white transition-colors">
                  AI Campus Assistant
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Club Admin Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F1EFEB]/60 font-medium">
          <div>&copy; 2026 EventOrbit — MVJ College of Engineering. All rights reserved.</div>
          <div className="flex items-center gap-4 text-[#D6A84F]/90">
            <span>Engineering Major Project</span>
            <span>·</span>
            <span>RAG-Powered Event Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}