import React from 'react'

export default function ThemeToggle({ className = '' }) {
  return (
    <button 
      type="button" 
      disabled 
      className={`h-9 w-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 bg-white/5 opacity-50 cursor-not-allowed select-none ${className}`}
      title="Theme toggle coming soon"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  )
}
