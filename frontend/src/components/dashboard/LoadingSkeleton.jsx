import React from 'react'

export default function LoadingSkeleton({ variant = 'card', className = '' }) {
  if (variant === 'banner') {
    return (
      <div className={`w-full h-32 rounded-3xl bg-white/5 animate-pulse border border-white/5 ${className}`} />
    )
  }
  
  return (
    <div className={`bg-panel border border-white/5 rounded-3xl p-6 flex flex-col gap-4 animate-pulse ${className}`}>
      <div className="h-32 w-full bg-white/5 rounded-2xl" />
      <div className="h-4 w-2/3 bg-white/5 rounded" />
      <div className="h-3 w-1/2 bg-white/5 rounded" />
      <div className="h-8 w-full bg-white/5 rounded-xl mt-2" />
    </div>
  )
}