'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const levels = [
  {
    badge: 'Nivel CEO',
    badgeColor: 'bg-[#2563EB]/15 text-[#2563EB]',
    borderColor: 'border-t-[#2563EB]',
    title: 'Decisiones Tácticas',
    description:
      'Contrataciones, presupuestos operativos, campañas de marketing, mejoras de procesos.',
    example:
      '\u00AB\u00BFDebo contratar un community manager o tercerizar redes sociales?\u00BB',
    footer: '1 agente \u2022 ~6 segundos',
  },
  {
    badge: 'Nivel Board',
    badgeColor: 'bg-[#7C3AED]/15 text-[#7C3AED]',
    borderColor: 'border-t-[#7C3AED]',
    title: 'Estrategia y Dirección',
    description:
      'Pivoteos, expansión de mercado, alianzas estratégicas, reestructuración organizacional.',
    example: '\u00AB\u00BFDeberíamos pivotar de B2C a B2B?\u00BB',
    footer: '5 agentes en paralelo \u2022 ~17 segundos',
  },
  {
    badge: 'Nivel Asamblea',
    badgeColor: 'bg-[#DC2626]/15 text-[#DC2626]',
    borderColor: 'border-t-[#DC2626]',
    title: 'Capital y Governance',
    description:
      'Levantamiento de capital, M&A, distribución de utilidades, cambios de estructura accionaria.',
    example:
      '\u00AB\u00BFConviene levantar una Serie A de $50M MXN?\u00BB',
    footer: '3 agentes en paralelo \u2022 ~12 segundos',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export default function Levels() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative bg-[#0A1929] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tres Niveles de Gobierno
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Cada pregunta se clasifica automáticamente en el nivel correcto
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {levels.map((level) => (
            <motion.div
              key={level.badge}
              variants={cardVariants}
              className={`
                group relative bg-[#1A2F42] rounded-xl border-t-4 ${level.borderColor}
                border border-white/10 border-t-0
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30
                transition-all duration-300 ease-out
                flex flex-col
              `}
            >
              <div className="p-6 sm:p-7 flex flex-col flex-1">
                {/* Badge */}
                <span
                  className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold mb-5 ${level.badgeColor}`}
                >
                  {level.badge}
                </span>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {level.title}
                </h3>

                {/* Description */}
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-5">
                  {level.description}
                </p>

                {/* Example quote */}
                <p className="text-[#E5E7EB]/70 text-sm italic mb-6 flex-1">
                  {level.example}
                </p>

                {/* Footer / separator */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[#9CA3AF] text-xs tracking-wide">
                    {level.footer}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
