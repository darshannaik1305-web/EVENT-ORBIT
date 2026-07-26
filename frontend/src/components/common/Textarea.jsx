import React from 'react'

export default function Textarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  rows = 3,
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
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none focus:ring-2 ${
          error 
            ? 'border-danger focus:ring-danger/30 focus:border-danger' 
            : 'border-white/10 focus:ring-primary/30 focus:border-primary'
        }`}
        {...props}
      />
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
