import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth()

  // Display a loading state while authentication is being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-primary font-semibold text-lg animate-pulse">Loading Session...</div>
      </div>
    )
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Enforce role checks if configured
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <Outlet />
}
