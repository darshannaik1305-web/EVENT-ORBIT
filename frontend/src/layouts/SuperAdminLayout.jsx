import React from 'react'
import { Outlet } from 'react-router-dom'

export default function SuperAdminLayout() {
  return (
    <div className="super-admin-layout min-h-screen flex flex-col">
      <header className="bg-slate-900/50 border-b border-white/10 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-extrabold text-xl text-primary">EventOrbit Super Admin</div>
          <nav className="flex gap-4">
            {/* Super Admin navigation placeholders */}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
