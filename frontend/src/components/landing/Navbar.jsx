import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-4 inset-x-0 z-40 transition-all duration-300 px-6 select-none">
      <div className={`max-w-5xl mx-auto px-6 py-3 flex items-center justify-between rounded-full border transition-all duration-300 ${
        scrolled 
          ? 'bg-[#12182B]/80 border-white/8 backdrop-blur-md shadow-lg shadow-black/40' 
          : 'bg-[#12182B]/20 border-transparent'
      }`}>
        <Link to={ROUTES.LANDING}>
          <Logo size="sm" variant="primary" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors relative group">
            About
          </a>
          <a href="#features" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors relative group">
            Features
          </a>
          <a href="#previews" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors relative group">
            Platform Preview
          </a>
          <a href="#how-it-works" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors relative group">
            How It Works
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white font-bold">
              Sign In
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-white transition-colors p-2"
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full inset-x-6 mt-2 bg-[#12182B]/95 border border-white/8 backdrop-blur-lg flex flex-col p-6 gap-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-5 duration-200 text-white font-semibold text-sm">
          <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">About</a>
          <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">Features</a>
          <a href="#previews" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">Platform Preview</a>
          <a href="#how-it-works" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">How It Works</a>
          <div className="h-px bg-white/5 my-1" />
          <Link to={ROUTES.LOGIN} onClick={() => setIsOpen(false)}>
            <Button variant="outline" className="w-full">Sign In</Button>
          </Link>
          <Link to={ROUTES.REGISTER} onClick={() => setIsOpen(false)}>
            <Button variant="primary" className="w-full">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}