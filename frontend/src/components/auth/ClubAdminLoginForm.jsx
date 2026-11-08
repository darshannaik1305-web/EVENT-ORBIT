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

export default function ClubAdminLoginForm() {
  const { login } = useAuth()
  const [clubAdminId, setClubAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}
    if (!clubAdminId.trim()) {
      nextErrors.clubAdminId = 'Club Admin ID is required (e.g. CODINGCLUB01)'
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
      const userObj = await login(clubAdminId.trim().toUpperCase(), password)
      if (userObj.role !== 'CLUB_ADMIN') {
        toast.error('This account is not a Club Admin account. Please use the Student Portal.')
        navigate(redirectByRole(userObj.role))
        return
      }
      if (userObj.mustChangePassword) {
        toast('Action Required: You are logged in with an initial temporary password. Please set your new password now.', {
          icon: '🔐',
          duration: 6000
        })
        navigate(ROUTES.ADMIN.PROFILE)
        return
      }
      toast.success(`Welcome, ${userObj.fullName || userObj.username}!`)
      navigate(ROUTES.ADMIN.EVENTS)
    } catch (err) {
      console.error('Club Admin login error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please check your Club Admin credentials.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <div className="space-y-2 text-center text-xs">
      <p className="text-[#666666]">
        Are you a student?{' '}
        <Link to={ROUTES.LOGIN} className="text-[#F28D1E] hover:text-[#D97706] font-bold transition-colors">
          Student Portal Sign In
        </Link>
      </p>
      <p className="text-[#888888] text-[11px]">
        Club Admin accounts are provisioned exclusively by the Super Admin.
      </p>
    </div>
  )

  return (
    <AuthFormContainer
      title="Club Admin Portal"
      description="Faculty & Club Coordinator Console. Sign in with your assigned Club Admin ID."
      footer={footer}
    >
      <div className="mb-4 p-3 rounded-xl bg-[#F28D1E]/10 border border-[#F28D1E]/20 text-[#202020] text-xs flex items-center gap-2.5">
        <span className="text-lg">🛡️</span>
        <span>
          <strong>Faculty Access Only:</strong> Enter your unique Club Admin ID (e.g., <code>CODINGCLUB01</code>).
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Club Admin ID"
          id="clubAdminId"
          placeholder="e.g. CODINGCLUB01"
          value={clubAdminId}
          onChange={(e) => setClubAdminId(e.target.value)}
          error={errors.clubAdminId}
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
            <span className="text-[11px] text-[#888888]">
              Managed by Super Admin
            </span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          Sign In as Club Admin
        </Button>
      </form>
    </AuthFormContainer>
  )
}
