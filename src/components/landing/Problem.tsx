'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const painPoints = [
  'Tomas decisiones de millones basándote en tu instinto, sin nadie que te cuestione antes.',
  'Pagaste consultores carísimos que te dijeron cosas que ya sabías.',
  'Necesitas un equipo ejecutivo completo, pero contratar un C-Suite te costaría más que tu utilidad.',
]

export default function Problem() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  return (
    <section className="relative py-20 sm:py-24 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[1200px] mx-auto px-6" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: Big stat */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="font-serif text-7xl sm:text-8xl md:text-9xl font-bold text-white leading-none tracking-tighter">
              61%
            </span>
            <p className="text-white/60 text-lg mt-4 max-w-xs leading-relaxed font-light">
              de los dueños de negocio se sienten solos al tomar decisiones críticas.
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-8">
              ¿Reconoces esto?
            </h2>
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
                className="text-white/80 text-base leading-relaxed font-light"
              >
                <span className="text-[#C9A962]/50 mr-3">&mdash;</span>
                {point}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
