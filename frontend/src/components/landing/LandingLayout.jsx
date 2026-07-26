import React from 'react'
import { Outlet } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      <AnnouncementBar />
      <Navbar />
      <div className="pt-24 flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
