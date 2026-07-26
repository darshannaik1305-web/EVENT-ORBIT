import React from 'react'

export default function Checkbox({
  label,
  id,
  checked,
  onChange,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="inline-flex items-center gap-3 cursor-pointer select-none text-sm text-slate-300 font-medium">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="h-5 w-5 rounded-md border border-white/10 bg-white/5 flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-primary/40 peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:border-transparent text-white font-bold text-xs select-none">
          {checked && (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        {label && <span>{label}</span>}
      </label>
      {error && (
        <span className="text-xs text-danger font-medium mt-0.5" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
