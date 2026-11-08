import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Input from '@/components/common/Input'
import PasswordInput from '@/components/common/PasswordInput'
import Button from '@/components/common/Button'
import RememberMe from './RememberMe'
import AuthFormContainer from './AuthFormContainer'
import useAuth from '@/hooks/useAuth'
import redirectByRole from '@/utils/redirectByRole'
import { ROUTES } from '@/config/routes'

export default function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}
    if (!username.trim()) {
      nextErrors.username = 'USN or Username is required'
    }
    if (!password) {
      nextErrors.password = 'Password is required'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const userObj = await login(username, password)
      toast.success('Successfully logged in!')
      navigate(redirectByRole(userObj.role))
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <div className="space-y-2 text-center text-xs">
      <p>
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-[#F28D1E] hover:text-[#D97706] font-bold transition-colors">
          Student Sign Up
        </Link>
      </p>
      <div className="pt-2 border-t border-[#E5E1DC] text-[#666666]">
        Club Coordinator / Faculty?{' '}
        <Link to={ROUTES.CLUB_ADMIN_LOGIN} className="text-[#F28D1E] hover:text-[#D97706] font-bold transition-colors">
          Club Admin Portal →
        </Link>
      </div>
    </div>
  )

  return (
    <AuthFormContainer
      title="Welcome back"
      description="Enter your credentials to access the EventOrbit portal"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="USN / Username"
          id="username"
          placeholder="e.g. 1MJ23CS001"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          required
        />
        
        <div className="flex flex-col gap-1 w-full">
          <PasswordInput
            label="Password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <div className="flex items-center justify-between mt-2 select-none">
            <RememberMe checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <Link 
              to={ROUTES.FORGOT_PASSWORD} 
              className="text-xs text-[#F28D1E] hover:text-[#D97706] font-bold transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>
    </AuthFormContainer>
  )
}
