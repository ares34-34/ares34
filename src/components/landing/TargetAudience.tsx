'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check, X } from 'lucide-react'

const forYou = [
  'Eres dueño de negocio y tomas decisiones sin estructura de gobierno',
  'Sientes que estás demasiado cerca de tu negocio para verlo con claridad',
  'Pagaste consultores y te dijeron cosas que ya sabías',
  'Quieres un equipo ejecutivo completo pero no puedes pagarlos todavía',
]

const notForYou = [
  'Quieres respuestas al instante sin dar contexto',
  'No estás dispuesto a configurar tu información de negocio',
  'Quieres que alguien decida por ti (tú decides, nosotros analizamos)',
  'Tu negocio no vende nada todavía (necesitas acción, no análisis)',
]

export default function TargetAudience() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-left">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="label-premium mb-4">Exclusividad</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            ¿Para quién es?
          </h2>
          <p className="text-white/50 text-lg max-w-lg font-light">
            ARES34 no es para todos. Así sabes si es para ti.
          </p>
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* For you */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-xl border border-[#059669]/25 bg-[#059669]/[0.05] p-6"
          >
            <h3 className="text-lg font-semibold text-[#059669] mb-6">
              Esto es para ti si:
            </h3>
            <ul className="space-y-4">
              {forYou.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                  <span className="text-white text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not for you */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              Esto NO es para ti si:
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-white/70 mt-0.5 shrink-0" />
                  <span className="text-white text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
