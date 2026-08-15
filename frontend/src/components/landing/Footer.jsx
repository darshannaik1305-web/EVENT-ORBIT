import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/config/routes'

export default function Footer() {
  return (
    <footer className="bg-[#070B19] border-t border-white/10 pt-16 pb-12 select-none relative z-10">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission Statement Column */}
          <div className="lg:col-span-5 space-y-4">
            <Link to={ROUTES.LANDING} className="inline-block">
              <Logo size="sm" variant="primary" />
            </Link>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              EventOrbit is your daily campus portal. Discover departmental hackathons, cultural fests, team code registrations, AI assistant guidance, and live victory podium standings.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Event Universe Portal</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  About Platform
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-white transition-colors">
                  Key Features
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

          {/* Legal Information */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Campus Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Access */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>
                <Link to={ROUTES.STUDENT.AI_ASSISTANT} className="hover:text-white transition-colors">
                  AI Assistant Chat
                </Link>
              </li>
              <li>
                <a href="mailto:support@eventorbit.edu" className="hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Club Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <div>&copy; 2026 EventOrbit. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  )
}