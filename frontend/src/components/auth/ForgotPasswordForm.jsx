import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import AuthFormContainer from './AuthFormContainer'
import { ROUTES } from '@/config/routes'

export default function ForgotPasswordForm() {
  const [usn, setUsn] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!usn.trim()) nextErrors.usn = 'USN is required'
    if (!email.trim()) {
      nextErrors.email = 'Email address is required'
    } else if (!emailRegex.test(email)) {
      nextErrors.email = 'Please enter a valid email address'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Reset link sent! (Demo Mode)')
      navigate(ROUTES.LOGIN)
    }, 1500)
  }

  const footer = (
    <p>
      Remembered your password?{' '}
      <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary-hover font-semibold transition-colors">
        Sign In
      </Link>
    </p>
  )

  return (
    <AuthFormContainer
      title="Reset Password"
      description="Enter your USN and registered email to receive a recovery code link."
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="USN"
          id="usn"
          placeholder="e.g. 1MJ23CS001"
          value={usn}
          onChange={(e) => setUsn(e.target.value)}
          error={errors.usn}
          required
        />
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="e.g. name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          Send Reset Link
        </Button>
      </form>
    </AuthFormContainer>
  )
}
