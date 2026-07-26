import React from 'react'
import Card from '@/components/common/Card'
import PageTransition from '@/components/common/PageTransition'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPassword() {
  return (
    <PageTransition>
      <Card className="w-full">
        <ForgotPasswordForm />
      </Card>
    </PageTransition>
  )
}
