import React from 'react'

export default function StatsCard({ label, value, icon, accentColor = 'primary' }) {
  const accents = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
    blue: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
    orange: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20'
  }
  const selectedAccent = accents[accentColor] || accents.primary

  return (
    <div className="bg-[#12182B] border border-white/5 p-6 rounded-3xl flex items-center justify-between shadow-sm select-none">
      <div className="flex flex-col gap-1.5">
        <span className="text-2xl md:text-3xl font-black text-white">{value}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      {icon && (
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border font-bold text-lg ${selectedAccent}`}>
          {icon}
        </div>
      )}
    </div>
  )
}