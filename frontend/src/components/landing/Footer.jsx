import React from 'react'
import Logo from '@/components/common/Logo'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 select-none relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Branding */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Logo size="sm" variant="primary" />
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed font-medium">
            Campus Club & Event Management Ecosystem powered by AI. Connecting college clubs and students.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Links</h4>
          <a href="#features" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#events" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Upcoming Events</a>
          <a href="#clubs" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Clubs & Communities</a>
          <a href="#faqs" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">FAQs</a>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Resources</h4>
          <a href="#" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Support Center</a>
          <a href="#" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Terms of Service</a>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contact & Socials</h4>
          <span className="text-xs font-medium text-slate-400">support@eventorbit.edu</span>
          <span className="text-xs font-medium text-slate-400">+91 98765 43210</span>
          {/* GitHub mock link */}
          <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mt-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub Repository
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs gap-4 font-semibold">
        <span>&copy; 2026 EventOrbit. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}