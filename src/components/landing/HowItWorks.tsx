'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Settings, MessageSquare, BarChart3 } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Settings,
    title: 'Configura tu CEO Agent',
    description:
      'Define tus KPIs, tu inspiración de liderazgo y tu meta anual. ARES se adapta a ti.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Haz tu pregunta',
    description:
      'Escribe cualquier decisión de negocio. ARES clasifica automáticamente su nivel de importancia.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Recibe perspectivas',
    description:
      'Hasta 5 agentes deliberan en paralelo y te entregan una recomendación unificada.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export default function HowItWorks() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  })

  return (
    <section className="relative bg-[#0A1929] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Cómo Funciona
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto">
            Tres pasos para tomar mejores decisiones
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative"
        >
          {/* Connecting dashed lines (desktop only) */}
          <div className="hidden md:block absolute top-[72px] left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] h-[2px]">
            <div className="w-full h-full border-t-2 border-dashed border-white/10" />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="relative flex flex-col items-center text-center px-6"
              >
                {/* Connecting arrow on mobile between steps */}
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute -bottom-5 left-1/2 -translate-x-1/2">
                    <div className="w-[2px] h-4 border-l-2 border-dashed border-white/10" />
                  </div>
                )}

                {/* Number */}
                <span className="text-[#2563EB] text-5xl md:text-6xl font-bold leading-none mb-5 tracking-tight">
                  {step.number}
                </span>

                {/* Icon circle */}
                <div className="w-16 h-16 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-[#2563EB]" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
