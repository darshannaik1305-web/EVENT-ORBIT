import React from 'react'

export default function Card({ 
  children, 
  variant = 'glass', 
  className = '', 
  hoverLift = false,
  ...props 
}) {
  const baseClasses = 'rounded-radius transition-all duration-300'

  const variants = {
    glass: 'bg-white/5 border border-white/8 backdrop-blur-md shadow-lg p-6 md:p-8',
    solid: 'bg-panel border border-white/5 shadow-md p-6 md:p-8',
    gradient: 'bg-gradient-to-tr from-primary/20 to-secondary/20 border border-white/10 shadow-lg p-6 md:p-8',
    image: 'bg-[#12182B] border border-white/5 overflow-hidden shadow-sm hover:shadow-xl',
    widget: 'bg-panel border border-white/5 p-6 rounded-2xl shadow-sm',
    stat: 'bg-panel border border-white/5 p-6 rounded-2xl text-center shadow-sm',
    preview: 'bg-white/5 border border-white/5 backdrop-blur-lg shadow-2xl p-6'
  }

  const selectedVariant = variants[variant] || variants.glass
  const hoverClasses = hoverLift ? 'hover:-translate-y-1.5 hover:shadow-glow' : ''

  return (
    <div 
      className={`${baseClasses} ${selectedVariant} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}