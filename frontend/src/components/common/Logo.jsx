import React from 'react'
import logoImg from '@/assets/logo.png'

export default function Logo({ size = 'md', variant = 'primary', showText = true, className = '' }) {
  const imageSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }

  const selectedImageSize = imageSizes[size] || imageSizes.md
  const selectedTextSize = textSizes[size] || textSizes.md

  const colorClass = variant === 'primary' 
    ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent' 
    : 'text-white'

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img 
          src={logoImg} 
          alt="EventOrbit Logo" 
          className={`${selectedImageSize} object-contain filter drop-shadow-[0_0_12px_rgba(236,72,153,0.5)] transition-transform hover:scale-105`} 
        />
      </div>
      {showText && (
        <span className={`font-black tracking-tight ${selectedTextSize} ${colorClass}`}>
          EventOrbit
        </span>
      )}
    </div>
  )
}
