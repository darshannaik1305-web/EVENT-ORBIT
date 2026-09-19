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

  let colorClass = 'text-[#7B1113]'
  if (variant === 'light') {
    colorClass = 'text-white'
  } else if (variant === 'dark') {
    colorClass = 'text-[#202020]'
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img 
          src={logoImg} 
          alt="EventOrbit Logo" 
          className={`${selectedImageSize} object-contain transition-transform hover:scale-105`} 
        />
      </div>
      {showText && (
        <span className={`font-headings font-black tracking-tight ${selectedTextSize} ${colorClass}`}>
          EventOrbit
        </span>
      )}
    </div>
  )
}
