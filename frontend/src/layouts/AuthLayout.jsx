import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/landing/Navbar'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070B19] text-white relative overflow-hidden font-sans select-none">
      {/* Floating Pill Navbar - Identical to Landing Page */}
      <Navbar />

      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[160px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[160px] rounded-full -z-10" />

      {/* Centered Auth Viewport */}
      <main className="flex-1 flex items-center justify-center p-6 pt-28 pb-12 w-full">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
