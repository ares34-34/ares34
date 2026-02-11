'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const steps = [
  {
    number: '01',
    title: 'Configura tu CEO Agent',
    description:
      'Define tus KPIs, tu inspiracion de liderazgo y tu meta anual. ARES se adapta completamente a tu contexto.',
  },
  {
    number: '02',
    title: 'Haz tu pregunta',
    description:
      'Escribe cualquier decision de negocio. ARES clasifica automaticamente su nivel de importancia y activa los agentes correctos.',
  },
  {
    number: '03',
    title: 'Recibe perspectivas',
    description:
      'Hasta 5 agentes deliberan en paralelo y te entregan una recomendacion unificada con puntos de accion concretos.',
  },
]

export default function HowItWorks() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  })

  return (
    <section className="relative bg-[#09090b] py-28 sm:py-36 px-4 sm:px-6">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="max-w-[1100px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Tres pasos
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
          {/* Connecting horizontal line (desktop only) */}
          <div className="hidden md:block absolute top-[14px] left-[calc(33.33%_-_16px)] right-[calc(33.33%_-_16px)] h-px bg-white/[0.06]" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="relative md:pr-8"
            >
              {/* Step number */}
              <span className="font-mono text-sm text-[#2563EB] mb-5 block">
                {step.number}
              </span>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
