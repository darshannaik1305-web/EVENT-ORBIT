import React from 'react'
import PageTransition from '@/components/common/PageTransition'
import Hero from '@/components/landing/Hero'
import StatsSection from '@/components/landing/StatsSection'
import Features from '@/components/landing/Features'
import UpcomingPreview from '@/components/landing/UpcomingPreview'
import ClubPreview from '@/components/landing/ClubPreview'
import HowItWorks from '@/components/landing/HowItWorks'
import AIChatPreview from '@/components/landing/AIChatPreview'
import Testimonials from '@/components/landing/Testimonials'
import FAQSection from '@/components/landing/FAQSection'
import CTASection from '@/components/landing/CTASection'

export default function LandingPage() {
  return (
    <PageTransition className="flex flex-col w-full items-center">
      <Hero />
      <StatsSection />
      <Features />
      <UpcomingPreview />
      <ClubPreview />
      <HowItWorks />
      <AIChatPreview />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </PageTransition>
  )
}
