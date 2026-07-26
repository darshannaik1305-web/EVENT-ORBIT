import React from 'react'

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-white py-2 px-4 text-xs font-bold tracking-wide select-none text-center relative z-50 shadow-md">
      <span className="inline-block mr-2 bg-white/20 px-2 py-0.5 rounded-full uppercase text-[9px] animate-pulse">
        New Update
      </span>
      <span>EventOrbit 2.0 is live! Explore campus hackathons, technical clubs, and register instantly.</span>
    </div>
  )
}
