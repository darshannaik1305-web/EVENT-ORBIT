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
      <label htmlFor={id} className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#555555] font-medium">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="h-4.5 w-4.5 rounded-md border border-[#E5E1DC] bg-white flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-[#F28D1E]/20 peer-checked:bg-[#F28D1E] peer-checked:border-[#F28D1E] text-white font-bold text-xs select-none shadow-sm">
          {checked && (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        {label && <span>{label}</span>}
      </label>
      {error && (
        <span className="text-xs text-[#B42318] font-medium mt-0.5" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
