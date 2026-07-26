import React from 'react'

export default function SectionHeader({ title, subtitle, icon, rightElement }) {
  return (
    <div className="flex items-center justify-between w-full mb-6 select-none">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  )
}
