'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const painPoints = [
  'Tomas decisiones de millones de pesos basandote solo en tu instinto, sin un framework estructurado.',
  'No tienes acceso a perspectivas financieras, legales y estrategicas cuando mas las necesitas.',
  'Contratar consultores toma semanas y cuesta cientos de miles. Tu necesitas respuestas hoy.',
]

export default function Problem() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  return (
    <section className="relative py-28 sm:py-36 bg-[#09090b]">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: Big stat */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="text-7xl sm:text-8xl md:text-9xl font-bold text-white leading-none tracking-tighter">
              61%
            </span>
            <p className="text-white/30 text-lg mt-4 max-w-xs leading-relaxed">
              de los CEOs se sienten aislados al tomar decisiones criticas de negocio.
            </p>
          </motion.div>

          {/* Right: Pain points */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="space-y-6 pt-2 md:pt-4"
          >
            {painPoints.map((point, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                className="text-white/40 text-base leading-relaxed"
              >
                <span className="text-white/20 mr-3">—</span>
                {point}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
