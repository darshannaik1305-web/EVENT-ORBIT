import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-100 overflow-x-hidden font-sans">
      <Navbar />
      <div className="pt-24 flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
