import React from 'react'
import { motion } from 'framer-motion'

export default function OrbitLoader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
  }
  const selectedSize = sizes[size] || sizes.md

  return (
    <div className={`relative flex items-center justify-center ${selectedSize} ${className}`}>
      {/* Outer revolving container */}
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
      >
        <div className="absolute -top-1 left-[calc(50%-4px)] h-2.5 w-2.5 rounded-full bg-primary shadow-md shadow-primary" />
      </motion.div>

      {/* Inner revolving container (counter-clockwise) */}
      <motion.div
        className="absolute inset-3 rounded-full border border-dashed border-secondary/40"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      >
        <div className="absolute -top-1 left-[calc(50%-3px)] h-2 w-2 rounded-full bg-secondary shadow-md shadow-secondary" />
      </motion.div>

      {/* Core pulsing orb */}
      <motion.div
        className="h-4 w-4 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/40"
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      />
    </div>
  )
}