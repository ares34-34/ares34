import Navigation from '@/components/landing/Navigation'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import HowItWorks from '@/components/landing/HowItWorks'
import Security from '@/components/landing/Security'
import TargetAudience from '@/components/landing/TargetAudience'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navigation />
      <Hero />
      <Problem />
      <HowItWorks />
      <Security />
      <TargetAudience />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
