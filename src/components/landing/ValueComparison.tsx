'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const comparisons = [
  {
    alternative: 'Consultor estratégico',
    cost: '$15,000 – $40,000',
    limitation: 'Una sola perspectiva, disponibilidad limitada',
  },
  {
    alternative: 'Consejero externo',
    cost: '$20,000 – $50,000',
    limitation: 'Un solo consejero, sin estructura de deliberación',
  },
  {
    alternative: 'ChatGPT + prompts',
    cost: '~$400',
    limitation: 'Sin estructura, sin contexto mexicano, sin deliberación real',
  },
]

export default function ValueComparison() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-left">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[1000px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="label-premium mb-4">Comparativa</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            ¿Cuánto te cuesta hoy tomar decisiones solo?
          </h2>
        </motion.div>

        {/* Comparison rows */}
        <div className="space-y-3 mb-4">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.alternative}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
            >
              <span className="text-white text-sm font-medium">{item.alternative}</span>
              <span className="text-white/40 text-sm font-mono">{item.cost} /mes</span>
              <span className="text-white/40 text-xs">{item.limitation}</span>
            </motion.div>
          ))}
        </div>

        {/* ARES34 row — highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border border-[#C9A962]/25 bg-[#C9A962]/[0.04] p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
        >
          <span className="text-[#C9A962] text-sm font-semibold">ARES34</span>
          <span className="text-white text-sm font-mono font-semibold">$9,999 /mes</span>
          <span className="text-white/70 text-xs">12 entidades + 7 módulos, 24/7, deliberación + ejecución</span>
        </motion.div>
      </div>
    </section>
  )
}
