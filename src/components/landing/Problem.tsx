'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const painPoints = [
  'Tomas decisiones de millones de pesos basandote solo en tu instinto, sin nadie que te cuestione.',
  'Pagaste consultores carisimos que te dijeron cosas que ya sabias.',
  'Quieres un equipo ejecutivo de primer nivel pero no puedes pagarlo todavia.',
]

export default function Problem() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  return (
    <section className="relative py-32 sm:py-40 bg-black">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.05]" />

      <div className="max-w-[1200px] mx-auto px-6" ref={ref}>
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
            <p className="text-white/25 text-lg mt-4 max-w-xs leading-relaxed">
              de los duenos de negocio se sienten solos al tomar decisiones criticas.
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
                className="text-white/35 text-base leading-relaxed"
              >
                <span className="text-white/15 mr-3">&mdash;</span>
                {point}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
