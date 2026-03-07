'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Scale, Building2, Users, Shield, FileText, Landmark } from 'lucide-react'

const regulations = [
  {
    icon: Building2,
    code: 'SAT',
    title: 'Servicio de Administración Tributaria',
    description: 'Obligaciones fiscales, facturación electrónica y cumplimiento tributario.',
  },
  {
    icon: Users,
    code: 'IMSS / INFONAVIT',
    title: 'Seguridad Social',
    description: 'Obligaciones patronales, cuotas y prestaciones de ley.',
  },
  {
    icon: Scale,
    code: 'LFT',
    title: 'Ley Federal del Trabajo',
    description: 'Contratos laborales, liquidaciones, jornadas y derechos del trabajador.',
  },
  {
    icon: Shield,
    code: 'LFPDPPP',
    title: 'Protección de Datos Personales',
    description: 'Avisos de privacidad, consentimiento y manejo de datos de clientes.',
  },
  {
    icon: FileText,
    code: 'Código de Comercio',
    title: 'Contratos Mercantiles',
    description: 'NDAs, prestación de servicios, arrendamiento comercial y sociedades.',
  },
  {
    icon: Landmark,
    code: 'LSM',
    title: 'Ley de Sociedades Mercantiles',
    description: 'Constitución, actas de asamblea y obligaciones corporativas.',
  },
]

export default function BuiltForMexico() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="label-premium mb-4">Marco regulatorio mexicano</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Construido para México
          </h2>
          <p className="text-white/50 text-lg max-w-xl font-light">
            Contratos, cumplimiento y asesoría legal diseñados con el marco regulatorio mexicano integrado. No es una traducción — es un sistema nativo.
          </p>
        </motion.div>

        {/* Regulation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regulations.map((reg, index) => {
            const Icon = reg.icon
            return (
              <motion.div
                key={reg.code}
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-xl card-premium p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[#059669]/80" />
                  </div>
                  <span className="text-white font-mono text-xs font-semibold">{reg.code}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  {reg.title}
                </h3>
                <p className="text-white/50 text-xs leading-relaxed">
                  {reg.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
