import React from 'react'

export default function WelcomeBanner({ name, role = 'Student' }) {
  return (
    <div className="w-full bg-gradient-to-tr from-primary/20 via-panel to-panel border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none relative overflow-hidden shadow-md">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-2xl rounded-full" />
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
          Hey, {name || 'Campus Student'}! 👋
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1.5 font-medium leading-relaxed max-w-lg">
          Ready to make some fests memories today? You have upcoming deadlines and registered events. Check your agenda!
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white/5 border border-white/8 px-4 py-1.5 rounded-full select-none text-xs font-bold text-slate-300">
        🛡️ <span className="uppercase tracking-wider">{role}</span>
      </div>
    </div>
  )
}
