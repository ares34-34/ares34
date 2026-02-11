'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const levels = [
  {
    dot: '#2563EB',
    level: 'CEO',
    title: 'Decisiones Tacticas',
    description:
      'Contrataciones, presupuestos operativos, campanas de marketing, mejoras de procesos.',
    example:
      'Debo contratar un community manager o tercerizar redes sociales?',
    footer: '1 agente • ~6s',
  },
  {
    dot: '#7C3AED',
    level: 'Board',
    title: 'Estrategia y Direccion',
    description:
      'Pivoteos, expansion de mercado, alianzas estrategicas, reestructuracion organizacional.',
    example: 'Deberiamos pivotar de B2C a B2B?',
    footer: '5 agentes • ~17s',
  },
  {
    dot: '#DC2626',
    level: 'Asamblea',
    title: 'Capital y Governance',
    description:
      'Levantamiento de capital, M&A, distribucion de utilidades, cambios de estructura accionaria.',
    example:
      'Conviene levantar una Serie A de $50M MXN?',
    footer: '3 agentes • ~12s',
  },
]

export default function Levels() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
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
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Tres niveles de gobierno
          </h2>
          <p className="text-white/30 text-lg max-w-lg">
            Cada pregunta se clasifica automaticamente en el nivel correcto.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {levels.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 p-6 flex flex-col"
            >
              {/* Level label with dot */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: level.dot }}
                />
                <span className="font-mono text-xs text-white/40 uppercase tracking-wider">
                  {level.level}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-white mb-2">
                {level.title}
              </h3>

              {/* Description */}
              <p className="text-white/30 text-sm leading-relaxed mb-4">
                {level.description}
              </p>

              {/* Example */}
              <p className="text-white/20 text-sm italic mb-6 flex-1">
                &laquo;{level.example}&raquo;
              </p>

              {/* Footer */}
              <div className="pt-4 border-t border-white/[0.06]">
                <span className="font-mono text-xs text-white/25">
                  {level.footer}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
