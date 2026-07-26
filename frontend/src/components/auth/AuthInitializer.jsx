import React from 'react'
import useAuth from '@/hooks/useAuth'

export default function AuthInitializer({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-slate-400 text-sm font-semibold tracking-wide animate-pulse">Initializing Session...</p>
        </div>
      </div>
    )
  }

  return children
}
