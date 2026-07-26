import React from 'react'

export default function PasswordStrength({ password }) {
  // Reusable UI placeholder only - no scoring logic implemented in this phase
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2 select-none">
      <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold tracking-wider">
        <span>Password Security Strength</span>
        <span>Requirement Check</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
        <div className="h-full bg-primary w-1/3 rounded-full opacity-60" />
        <div className="h-full bg-white/5 w-1/3 rounded-full" />
        <div className="h-full bg-white/5 w-1/3 rounded-full" />
      </div>
      <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
        Must contain at least 8 characters, capital letters, and numbers.
      </span>
    </div>
  )
}
