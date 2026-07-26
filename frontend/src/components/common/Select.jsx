import React from 'react'

export default function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-bold text-slate-400 tracking-wider uppercase select-none"
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
            error 
              ? 'border-danger focus:ring-danger/30 focus:border-danger' 
              : 'border-white/10 focus:ring-primary/30 focus:border-primary'
          }`}
          {...props}
        >
          <option value="" disabled className="text-slate-500">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <span 
          id={`${id}-error`} 
          className="text-xs text-danger font-medium mt-0.5"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  )
}
