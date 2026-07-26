import React from 'react'

export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-radius shadow-2xl p-6 md:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
