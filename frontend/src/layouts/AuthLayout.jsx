import React from 'react'
import { Outlet } from 'react-router-dom'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      {/* Left Column - Premium Branding & Abstract Vector Art */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-slate-900 border-r border-white/5">
        {/* Background Gradients and mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[100px]" />
          {/* Abstract Grid Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full justify-between select-none">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-1.5 flex items-center justify-center text-white font-bold">
              EO
            </div>
            <span className="font-extrabold tracking-tight text-xl text-white">EventOrbit</span>
          </div>

          {/* Core Branding Message */}
          <div className="my-auto flex flex-col gap-6 max-w-sm">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage Campus Events,{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Explore college hackathons, technical clubs, registrations, and declare winners in a sleek SaaS ecosystem.
            </p>
            {/* Geometric artwork graphic */}
            <div className="relative h-48 w-full mt-4 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-center overflow-hidden">
              <div className="absolute h-36 w-36 rounded-full border-2 border-primary/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute h-24 w-24 rounded-full border border-secondary/35 animate-[spin_10s_linear_infinite_reverse]" />
              <div className="absolute h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-secondary opacity-80 blur-sm animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="absolute h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-black shadow-lg">
                ★
              </div>
            </div>
          </div>

          {/* Footer branding details */}
          <div className="text-slate-500 text-xs font-semibold">
            &copy; 2026 EventOrbit. Powered by React 19.
          </div>
        </div>
      </div>

      {/* Right Column - Centered Card forms */}
      <div className="col-span-1 lg:col-span-7 flex flex-col min-h-screen relative p-4 md:p-8 lg:p-12 items-center justify-center">
        {/* Floating ThemeToggle in right top corner */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
          <ThemeToggle />
        </div>

        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden block lg:hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[80px]" />
        </div>

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
