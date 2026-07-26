import React from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1020] text-white p-6 relative overflow-hidden font-sans">
      {/* Subtle back orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[150px] rounded-full -z-10" />

      {/* Main container */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Render Form views inside glass wrappers */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}