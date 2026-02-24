'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function SocialProof() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-32 sm:py-40 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="max-w-[800px] mx-auto" ref={ref}>
        {/* Credibilidad section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-6">
            Creado por
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Descúbrete+
          </h3>
          <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto mb-8">
            Descúbrete+ es un ecosistema de herramientas de inteligencia artificial diseñadas para ayudar a emprendedores y dueños de negocio a tomar mejores decisiones. ARES34 es el producto insignia.
          </p>
        </motion.div>

        {/* Stats / credibility points */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 text-center">
            <span className="text-2xl font-bold text-white block mb-1">12</span>
            <span className="text-white/50 text-xs">Entidades de IA especializadas</span>
          </div>
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 text-center">
            <span className="text-2xl font-bold text-white block mb-1">3</span>
            <span className="text-white/50 text-xs">Niveles de gobierno corporativo</span>
          </div>
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 text-center">
            <span className="text-2xl font-bold text-white block mb-1">24/7</span>
            <span className="text-white/50 text-xs">Disponibilidad completa</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
