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
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer gap-2'

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:brightness-110 active:brightness-95',
    secondary: 'bg-slate-800 text-slate-200 border border-white/5 hover:bg-slate-700',
    outline: 'bg-transparent border border-white/10 text-slate-200 hover:bg-white/5',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
    danger: 'bg-danger text-white hover:bg-danger-hover shadow-lg shadow-danger/20',
    link: 'bg-transparent p-0 text-primary hover:text-primary-hover hover:underline',
  }

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
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
