import React from 'react'
import PageTransition from '@/components/common/PageTransition'
import Hero from '@/components/landing/Hero'
import AboutSection from '@/components/landing/AboutSection'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import AIChatPreview from '@/components/landing/AIChatPreview'
import CTASection from '@/components/landing/CTASection'

export default function LandingPage() {
  return (
    <PageTransition className="flex flex-col w-full items-center pb-24">
      <Hero />
      <AboutSection />
      <Features />
      <HowItWorks />
      <AIChatPreview />
      <CTASection />
    </PageTransition>
  )
}
