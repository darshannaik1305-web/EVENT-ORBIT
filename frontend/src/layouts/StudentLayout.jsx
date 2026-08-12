import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'

export default function StudentLayout() {
  return (
    <div className="student-layout min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
