import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-slate-400 mb-6 text-center max-w-sm">The page you are looking for does not exist or has been moved.</p>
      <Link to={ROUTES.STUDENT.HOME} className="px-6 py-2 bg-primary rounded-full font-bold text-white hover:bg-primary-hover transition-colors">
        Go Back Home
      </Link>
    </div>
  )
}
