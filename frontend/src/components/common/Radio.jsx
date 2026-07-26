import React from 'react'

export default function Radio({
  label,
  id,
  name,
  value,
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
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="h-5 w-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-primary/40 peer-checked:border-primary text-white select-none">
          {checked && (
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-primary to-secondary" />
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
