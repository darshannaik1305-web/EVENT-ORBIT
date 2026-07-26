import React from 'react'

export default function EmptyState({ message = 'No data available', icon = '🔍' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#12182B] border border-white/5 rounded-3xl select-none">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm font-semibold text-slate-400 max-w-xs">{message}</p>
    </div>
  )
}