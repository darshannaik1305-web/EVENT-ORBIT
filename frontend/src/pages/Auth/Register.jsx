import React from 'react'
import Card from '@/components/common/Card'
import PageTransition from '@/components/common/PageTransition'
import RegisterForm from '@/components/auth/RegisterForm'

export default function Register() {
  return (
    <PageTransition>
      <Card className="w-full">
        <RegisterForm />
      </Card>
    </PageTransition>
  )
}
