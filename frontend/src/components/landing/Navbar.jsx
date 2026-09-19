import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import Button from '@/components/common/Button'
import { ROUTES } from '@/config/routes'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (location.pathname === ROUTES.LANDING && location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location])

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    if (location.pathname === ROUTES.LANDING) {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setIsOpen(false)
    } else {
      navigate(`/#${targetId}`)
      setIsOpen(false)
    }
  }

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
  ]

  return (
    <nav className="fixed top-3 inset-x-0 z-40 transition-all duration-300 px-4 sm:px-6 select-none">
      <div
        className={`max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between rounded-2xl transition-all duration-300 bg-[#F28D1E] text-white ${scrolled ? 'shadow-lg bg-[#F28D1E]/95 backdrop-blur-md' : 'shadow-md'
          }`}
      >
        <Link to={ROUTES.LANDING} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo size="sm" variant="light" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`/#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="text-sm font-semibold text-white/90 hover:text-white transition-colors relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <button className="px-4 py-1.5 text-xs font-bold rounded-xl bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all cursor-pointer">
              Sign In
            </button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <button className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#7B1113] hover:bg-[#6F0F11] text-white shadow-sm transition-all cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-white/80 transition-colors p-2 cursor-pointer"
          aria-label="Toggle menu"
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
        <div className="md:hidden absolute top-full inset-x-4 sm:inset-x-6 mt-2 bg-[#F28D1E] border border-[#D97706] flex flex-col p-6 gap-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 text-white font-semibold text-sm">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`/#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="text-white/90 hover:text-white transition-colors cursor-pointer py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="h-px bg-white/20 my-1" />
          <Link to={ROUTES.LOGIN} onClick={() => setIsOpen(false)}>
            <button className="w-full py-2 text-xs font-bold rounded-xl bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all">
              Sign In
            </button>
          </Link>
          <Link to={ROUTES.REGISTER} onClick={() => setIsOpen(false)}>
            <button className="w-full py-2 text-xs font-bold rounded-xl bg-[#7B1113] hover:bg-[#6F0F11] text-white shadow-sm transition-all">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </nav>
  )
}