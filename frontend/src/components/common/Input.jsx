import React from 'react'

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
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
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-3 bg-[#12182B]/60 border border-white/8 rounded-2xl text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:ring-2 focus:border-primary/50 ${
          error 
            ? 'border-danger focus:ring-danger/30' 
            : 'border-white/8 focus:ring-primary/30'
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