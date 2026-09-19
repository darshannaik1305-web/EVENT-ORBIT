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
          className="text-xs font-semibold text-[#555555] tracking-wide select-none"
        >
          {label} {required && <span className="text-[#B42318]">*</span>}
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
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-[#202020] text-sm transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer shadow-sm ${
            error 
              ? 'border-[#B42318] focus:ring-[#B42318]/20 focus:border-[#B42318]' 
              : 'border-[#E5E1DC] focus:ring-[#F28D1E]/20 focus:border-[#F28D1E]'
          }`}
          {...props}
        >
          <option value="" disabled className="text-[#888888] bg-white">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#202020]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#888888]">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <span 
          id={`${id}-error`} 
          className="text-xs text-[#B42318] font-medium mt-0.5"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  )
}