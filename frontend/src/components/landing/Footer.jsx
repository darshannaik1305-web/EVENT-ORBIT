import React from 'react'
import Logo from '@/components/common/Logo'

export default function Footer() {
  return (
    <footer className="bg-[#0B1020] border-t border-white/5 py-12 select-none relative z-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-4">
          <Logo size="sm" variant="primary" />
          <span>&copy; 2026 EventOrbit. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="mailto:support@eventorbit.edu" className="hover:text-primary transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  )
}