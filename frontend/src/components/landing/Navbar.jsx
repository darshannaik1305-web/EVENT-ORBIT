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
    <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3 shadow-lg' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to={ROUTES.LANDING}>
          <Logo size="sm" variant="primary" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="#events" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Events
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="#clubs" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Clubs
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="#faqs" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            FAQs
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-white transition-colors p-2"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full inset-x-0 bg-slate-950/95 border-b border-white/5 backdrop-blur-lg flex flex-col p-6 gap-4 select-none animate-in fade-in slide-in-from-top-5 duration-200">
          <a href="#features" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#events" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Events</a>
          <a href="#clubs" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Clubs</a>
          <a href="#faqs" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">FAQs</a>
          <div className="h-px bg-white/5 my-2" />
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