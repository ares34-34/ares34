'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import { CALENDLY_URL } from '@/lib/constants'

const features = [
  'Ecosistema completo: 12 entidades, 3 niveles de gobierno',
  'Brief ejecutivo diario personalizado',
  'Pulso de salud empresarial en tiempo real',
  'Simulador de escenarios con IA',
  'Generador de contratos bajo ley mexicana',
  'Verificación de cumplimiento legal (SAT, IMSS, LFT)',
  'Preparación automática de juntas',
  'Calendario integrado con Google Calendar',
  'Onboarding personalizado (3 sesiones de configuración)',
  'Consultas bajo política de uso justo',
  'Historial completo de deliberaciones',
  'Soporte directo con el equipo ARES34',
]

export default function Pricing() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="precios" className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[700px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <p className="label-premium mb-4">Inversión</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Un solo plan. Todo incluido.
          </h2>
          <p className="text-white/50 text-lg max-w-md mx-auto font-light">
            12 entidades trabajando para ti por menos de lo que cuesta una hora de consultoría estratégica.
          </p>
        </motion.div>

        {/* Single plan card — premium */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          className="rounded-xl border border-[#C9A962]/20 bg-[#C9A962]/[0.02] p-8 relative card-premium"
        >
          {/* Badge — gold */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#C9A962] to-[#E0CC8A] text-black text-xs font-semibold rounded-full whitespace-nowrap">
            Todo incluido — 12 herramientas
          </span>

          {/* Plan name */}
          <div className="text-center mt-4 mb-6">
            <h3 className="label-premium mb-3">
              Plan ARES34
            </h3>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-serif text-5xl font-bold text-white">$9,999</span>
              <div className="text-left">
                <span className="text-white/50 text-sm block">MXN</span>
                <span className="text-white/35 text-xs">/mes</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="separator-premium my-6" />

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="text-[#C9A962]/50 mt-0.5">&mdash;</span>
                <span className="text-white/70 text-sm font-light">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-5 py-3.5 rounded-full btn-premium text-sm"
          >
            Agenda tu demo
          </a>
        </motion.div>

        {/* 6-month justification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center space-y-3"
        >
          <p className="text-white/40 text-sm font-light">
            ¿Por qué 6 meses? Porque los primeros 30 días los usas para configurar. Los siguientes 60 para confiar. Y a partir del cuarto mes, no puedes operar sin tu equipo.
          </p>
          <p className="text-white/30 text-xs font-light">
            Facturación mensual. Sin penalización por cancelación anticipada.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
