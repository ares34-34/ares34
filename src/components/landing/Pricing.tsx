'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

const features = [
  'CEO Virtual + 5 directores + 3 inversionistas',
  'Consultas ilimitadas',
  'Plataforma web 24/7',
  'Historial de todas tus deliberaciones',
  'WhatsApp directo',
  'Garantía 30 días',
]

export default function Pricing() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="precios" className="relative py-32 sm:py-40 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="max-w-[700px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Un solo plan. Todo incluido.
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            9 directores trabajando para ti por menos de lo que cuesta una hora de consultoría.
          </p>
        </motion.div>

        {/* Single plan card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          className="rounded-xl border border-white/[0.15] bg-white/[0.05] p-8 relative card-hover"
        >
          {/* Private platform badge */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-semibold rounded-full whitespace-nowrap">
            Plataforma privada por invitación
          </span>

          {/* Plan name */}
          <div className="text-center mt-4 mb-6">
            <h3 className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">
              Plan Fundador
            </h3>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl font-bold text-white">$99</span>
              <div className="text-left">
                <span className="text-white/60 text-sm block">USD</span>
                <span className="text-white/40 text-xs">/mes</span>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-2">
              Acceso por invitación. Contacta a tu administrador.
            </p>
          </div>

          {/* Separator */}
          <div className="h-px bg-white/[0.08] my-6" />

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="text-white/70 mt-0.5">&mdash;</span>
                <span className="text-white/80 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/login"
            className="block w-full text-center px-5 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors duration-200"
          >
            Iniciar sesión
          </Link>
        </motion.div>

        {/* Guarantee */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          30 días de garantía completa.
        </motion.p>
      </div>
    </section>
  )
}
