'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function SocialProof() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[800px] mx-auto" ref={ref}>
        {/* Founder section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <p className="label-premium mb-6">
            Quién está detrás
          </p>

          {/* Founder avatar placeholder — gold ring */}
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-[#C9A962]/25 mx-auto mb-4 flex items-center justify-center">
            <span className="text-[#C9A962]/70 text-xl font-serif font-bold">PH</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
            Patricio Hernández
          </h3>
          <p className="text-white/40 text-sm mb-4 font-light">
            Fundador, ARES34 & Descúbrete+
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto font-light">
            Construyendo herramientas de inteligencia artificial para que los emprendedores y dueños de negocio en México tomen mejores decisiones. ARES34 es el producto insignia de Descúbrete+.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="rounded-xl card-premium p-6 text-center">
            <span className="font-serif text-2xl font-bold text-white block mb-1">16</span>
            <span className="text-white/40 text-xs font-light">Agentes de IA especializados</span>
          </div>
          <div className="rounded-xl card-premium p-6 text-center">
            <span className="font-serif text-2xl font-bold text-white block mb-1">7</span>
            <span className="text-white/40 text-xs font-light">Módulos ejecutivos integrados</span>
          </div>
          <div className="rounded-xl card-premium p-6 text-center">
            <span className="font-serif text-2xl font-bold text-white block mb-1">24/7</span>
            <span className="text-white/40 text-xs font-light">Disponibilidad completa</span>
          </div>
        </motion.div>

        {/* Private platform badge — gold accent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A962]/20 bg-[#C9A962]/[0.03] text-[#C9A962]/70 text-xs">
            Plataforma privada por invitación
          </span>
        </motion.div>
      </div>
    </section>
  )
}
