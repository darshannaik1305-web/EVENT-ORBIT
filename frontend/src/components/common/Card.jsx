import React from 'react'

export default function Card({ 
  children, 
  variant = 'glass', 
  className = '', 
  hoverLift = false,
  ...props 
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200'

  const variants = {
    glass: 'bg-white border border-[#E5E1DC] shadow-sm p-6 md:p-8 text-[#202020]',
    solid: 'bg-white border border-[#E5E1DC] shadow-sm p-6 md:p-8 text-[#202020]',
    gradient: 'bg-gradient-to-tr from-[#7B1113]/5 via-white to-[#D6A84F]/5 border border-[#E5E1DC] shadow-sm p-6 md:p-8 text-[#202020]',
    image: 'bg-white border border-[#E5E1DC] overflow-hidden shadow-sm hover:shadow-md',
    widget: 'bg-white border border-[#E5E1DC] p-6 rounded-2xl shadow-sm text-[#202020]',
    stat: 'bg-white border border-[#E5E1DC] p-5 rounded-2xl shadow-sm text-[#202020]',
    preview: 'bg-white border border-[#E5E1DC] shadow-md p-6 rounded-2xl text-[#202020]'
  }

  const selectedVariant = variants[variant] || variants.solid
  const hoverClasses = hoverLift ? 'hover:-translate-y-1 hover:shadow-md hover:border-[#D5D0C9]' : ''

  return (
    <div 
      className={`${baseClasses} ${selectedVariant} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}