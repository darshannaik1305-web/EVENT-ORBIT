import React from 'react'

export default function Logo({ size = 'md', variant = 'primary', className = '' }) {
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const selectedIconSize = iconSizes[size] || iconSizes.md
  const selectedTextSize = textSizes[size] || textSizes.md

  const colorClass = variant === 'primary' 
    ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent' 
    : 'text-slate-200'

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary p-1.5 text-white shadow-lg shadow-primary/20`}>
        <svg 
          className={selectedIconSize}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={`font-extrabold tracking-tight ${selectedTextSize} ${colorClass}`}>
        EventOrbit
      </span>
    </div>
  )
}
