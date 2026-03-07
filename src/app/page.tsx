import Navigation from '@/components/landing/Navigation'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import DayWithAres from '@/components/landing/DayWithAres'
import TeamShowcase from '@/components/landing/TeamShowcase'
import PlatformSuite from '@/components/landing/PlatformSuite'
import HowItWorks from '@/components/landing/HowItWorks'
import BuiltForMexico from '@/components/landing/BuiltForMexico'
import ValueComparison from '@/components/landing/ValueComparison'
import InlineCTA from '@/components/landing/InlineCTA'
import Security from '@/components/landing/Security'
import TargetAudience from '@/components/landing/TargetAudience'
import Pricing from '@/components/landing/Pricing'
import SocialProof from '@/components/landing/SocialProof'
import FAQ from '@/components/landing/FAQ'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      {/* Dynamic cloud/gradient background — Codex style, fixed viewport layer */}
      <div className="dynamic-bg-fixed">
        <div className="dynamic-bg-mesh" />
        <div className="cloud-layer-1" />
        <div className="cloud-layer-2" />
        <div className="cloud-layer-3" />
        <div className="cloud-layer-4" />
        <div className="cloud-layer-5" />
        <div className="cloud-layer-6" />
        <div className="dynamic-bg-noise" />
      </div>

      {/* All page content */}
      <main className="relative z-10 min-h-screen">
        <Navigation />
        <Hero />
        <Problem />
        <DayWithAres />
        <TeamShowcase />
        <PlatformSuite />
        <HowItWorks />
        <BuiltForMexico />
        <ValueComparison />
        <InlineCTA headline="12 entidades deliberan por ti. ¿Quieres verlo en acción?" />
        <Security />
        <InlineCTA headline="Tu información protegida. ¿Listo para conocer a tu equipo?" />
        <TargetAudience />
        <InlineCTA headline="¿Te identificas? Agenda tu demo." />
        <Pricing />
        <SocialProof />
        <FAQ />
        <InlineCTA headline="¿Tienes más preguntas? Hablemos." />
        <Footer />
      </main>
    </>
  )
}
