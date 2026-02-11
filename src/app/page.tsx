import Navigation from '@/components/landing/Navigation'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import HowItWorks from '@/components/landing/HowItWorks'
import Levels from '@/components/landing/Levels'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Navigation />
      <Hero />
      <Problem />
      <HowItWorks />
      <Levels />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
