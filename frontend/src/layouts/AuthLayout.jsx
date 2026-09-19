import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/landing/Navbar'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#202020] relative overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar />

      {/* Subtle academic background radial gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7B1113]/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D6A84F]/10 blur-[120px] rounded-full -z-10" />

      {/* Centered Auth Viewport */}
      <main className="flex-1 flex items-center justify-center p-6 pt-28 pb-12 w-full">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}