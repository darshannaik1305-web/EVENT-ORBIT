import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import PasswordInput from '@/components/common/PasswordInput'
import Button from '@/components/common/Button'
import PasswordStrength from './PasswordStrength'
import AuthFormContainer from './AuthFormContainer'
import { ROUTES } from '@/config/routes'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    mobile: '',
    gender: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const validate = () => {
    const nextErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9]{10}$/

    if (!formData.name.trim()) nextErrors.name = 'Full Name is required'
    if (!formData.usn.trim()) nextErrors.usn = 'USN is required'
    
    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required'
    } else if (!emailRegex.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address'
    }

    if (!formData.mobile.trim()) {
      nextErrors.mobile = 'Mobile number is required'
    } else if (!phoneRegex.test(formData.mobile)) {
      nextErrors.mobile = 'Please enter a 10-digit mobile number'
    }

    if (!formData.gender) nextErrors.gender = 'Gender is required'

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
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
      toast.success('Registration successful! (Demo Mode)')
      navigate(ROUTES.LOGIN)
    }, 1500)
  }

  const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' },
  ]

  const footer = (
    <p>
      Already have an account?{' '}
      <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary-hover font-semibold transition-colors">
        Sign In
      </Link>
    </p>
  )

  return (
    <AuthFormContainer
      title="Create account"
      description="Register your profile to explore college activities"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          id="name"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="USN"
            id="usn"
            placeholder="e.g. 1MJ23CS001"
            value={formData.usn}
            onChange={(e) => handleInputChange('usn', e.target.value)}
            error={errors.usn}
            required
          />
          <Select
            label="Gender"
            id="gender"
            placeholder="Choose Gender"
            options={genderOptions}
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            error={errors.gender}
            required
          />
        </div>

        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Mobile Number"
          id="mobile"
          type="tel"
          placeholder="e.g. 9876543210"
          value={formData.mobile}
          onChange={(e) => handleInputChange('mobile', e.target.value)}
          error={errors.mobile}
          required
        />

        <div className="flex flex-col gap-1.5 w-full">
          <PasswordInput
            label="Password"
            id="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            required
          />
          {formData.password && <PasswordStrength password={formData.password} />}
        </div>

        <PasswordInput
          label="Confirm Password"
          id="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>
    </AuthFormContainer>
  )
}
