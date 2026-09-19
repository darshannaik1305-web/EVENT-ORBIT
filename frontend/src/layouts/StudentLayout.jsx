import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'

export default function StudentLayout() {
  return (
    <div className="student-layout min-h-screen flex bg-[#F7F6F3] text-[#202020]">
      <Sidebar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
