import React, { useState } from 'react'

export default function PasswordInput({
  label,
  id,
  placeholder = '••••••••',
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) {
  const [show, setShow] = useState(false)

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
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full pl-4 pr-11 py-2.5 bg-white border rounded-xl text-[#202020] placeholder-[#888888] text-sm transition-all focus:outline-none focus:ring-2 shadow-sm ${
            error 
              ? 'border-[#B42318] focus:ring-[#B42318]/20 focus:border-[#B42318]' 
              : 'border-[#E5E1DC] focus:ring-[#F28D1E]/20 focus:border-[#F28D1E]'
          }`}
          {...props}
        />
        <button
          type="button"
          tabIndex="-1"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#888888] hover:text-[#202020] transition-colors cursor-pointer select-none"
        >
          {show ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
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