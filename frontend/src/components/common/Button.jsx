import React from 'react'
import { motion } from 'framer-motion'
import Loader from './Loader'

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#F28D1E]/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer gap-2 select-none'

  const variants = {
    primary: 'bg-[#F28D1E] hover:bg-[#D97706] text-white shadow-sm shadow-[#F28D1E]/25 active:bg-[#C26707]',
    secondary: 'bg-white text-[#7B1113] border border-[#7B1113] hover:bg-[#7B1113] hover:text-white active:bg-[#6F0F11]',
    maroon: 'bg-[#7B1113] hover:bg-[#6F0F11] text-white shadow-sm shadow-[#7B1113]/25 active:bg-[#6F0F11]',
    outline: 'bg-white border border-[#E5E1DC] text-[#202020] hover:bg-[#F1EFEB] hover:border-[#D5D0C9]',
    ghost: 'bg-transparent text-[#555555] hover:text-[#F28D1E] hover:bg-[#F28D1E]/10',
    danger: 'bg-[#B42318] text-white hover:bg-[#901c13] shadow-sm shadow-[#B42318]/20',
    success: 'bg-[#287A4B] text-white hover:bg-[#1f5f3a] shadow-sm shadow-[#287A4B]/20',
    link: 'bg-transparent p-0 text-[#F28D1E] hover:text-[#D97706] hover:underline font-semibold',
  }

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base font-semibold',
  }

  const selectedVariant = variants[variant] || variants.primary
  const selectedSize = sizes[size] || sizes.md

  return (
    <motion.button
      whileTap={variant === 'link' || disabled || loading ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${selectedVariant} ${variant === 'link' ? '' : selectedSize} ${className}`}
      {...props}
    >
      {loading && <Loader className="h-4 w-4" />}
      {!loading && icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  )
}
