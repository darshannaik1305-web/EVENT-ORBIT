import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/config/routes'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1020] text-white p-6 relative overflow-hidden font-sans">
      {/* Subtle back orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[150px] rounded-full -z-10" />

      {/* Main container */}
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link to={ROUTES.LANDING} className="hover:opacity-90 transition-opacity select-none">
          <Logo size="md" variant="primary" />
        </Link>
        
        {/* Render Form views inside glass wrappers */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}