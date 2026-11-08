import React from 'react'
import Card from '@/components/common/Card'
import PageTransition from '@/components/common/PageTransition'
import ClubAdminLoginForm from '@/components/auth/ClubAdminLoginForm'

export default function ClubAdminLogin() {
  return (
    <PageTransition>
      <Card className="w-full">
        <ClubAdminLoginForm />
      </Card>
    </PageTransition>
  )
}
