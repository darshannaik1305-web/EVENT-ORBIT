import React from 'react'

export default function PasswordStrength({ password }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2 select-none">
      <div className="flex justify-between items-center text-[#888888] text-[10px] uppercase font-bold tracking-wider">
        <span>Password Security Strength</span>
        <span>Requirement Check</span>
      </div>
      <div className="h-1.5 w-full bg-[#E5E1DC] rounded-full overflow-hidden flex gap-1">
        <div className="h-full bg-[#F28D1E] w-1/3 rounded-full opacity-80" />
        <div className="h-full bg-[#E5E1DC] w-1/3 rounded-full" />
        <div className="h-full bg-[#E5E1DC] w-1/3 rounded-full" />
      </div>
      <span className="text-[10px] text-[#888888] font-semibold tracking-wide">
        Must contain at least 8 characters, capital letters, and numbers.
      </span>
    </div>
  )
}
