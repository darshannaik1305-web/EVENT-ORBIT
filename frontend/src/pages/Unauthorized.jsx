import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import Button from '@/components/common/Button'
import redirectByRole from '@/utils/redirectByRole'

export default function Unauthorized() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (user?.role) {
      navigate(redirectByRole(user.role))
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
      <h1 className="text-6xl font-extrabold text-danger mb-2 select-none">403</h1>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Access Forbidden</h2>
      <p className="text-slate-400 mb-6 max-w-sm text-sm">
        You do not have the required permissions to view this resource.
      </p>
      <Button onClick={handleGoBack} variant="primary">
        Return to Dashboard
      </Button>
    </div>
  )
}
