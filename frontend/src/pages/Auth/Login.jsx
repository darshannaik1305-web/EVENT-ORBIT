import React from 'react'
import Card from '@/components/common/Card'
import PageTransition from '@/components/common/PageTransition'
import LoginForm from '@/components/auth/LoginForm'

export default function Login() {
  return (
    <PageTransition>
      <Card className="w-full">
        <LoginForm />
      </Card>
    </PageTransition>
  )
}
