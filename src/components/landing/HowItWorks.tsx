'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const offerings = [
  {
    level: 'CEO',
    dot: '#2563EB',
    title: 'CEO Virtual',
    subtitle: 'Decisiones rapidas del dia a dia',
    examples: [
      'Contrato a esta persona?',
      'Apruebo este gasto?',
      'Lanzo esta campana?',
    ],
  },
  {
    level: 'Consejo',
    dot: '#7C3AED',
    title: 'Consejo Directivo (5 miembros)',
    subtitle: 'Decisiones grandes de estrategia',
    examples: [
      'Director Financiero (numeros)',
      'Director de Marketing (marca y clientes)',
      'Director Legal (riesgos)',
      'Director de RR.HH. (equipo)',
      'Experto de tu industria',
    ],
  },
  {
    level: 'Junta',
    dot: '#DC2626',
    title: 'Junta de Inversionistas (3 miembros)',
    subtitle: 'Decisiones de dinero e inversion',
    examples: [
      'Levanto capital o sigo con lo mio?',
      'Compro esa empresa?',
      'Reparto utilidades o reinvierto?',
    ],
  },
]

export default function HowItWorks() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  })

  return (
    <section id="como-funciona" className="relative bg-black py-32 sm:py-40 px-6">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.05]" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Que obtienes exactamente
          </h2>
          <p className="text-white/25 text-lg max-w-lg">
            Un ecosistema corporativo completo que analiza cada decision desde multiples perspectivas.
          </p>
        </motion.div>

        {/* Offering cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offerings.map((offering, index) => (
            <motion.div
              key={offering.level}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 p-6 flex flex-col"
            >
              {/* Level dot + label */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: offering.dot }}
                />
                <span className="font-mono text-xs text-white/30 uppercase tracking-wider">
                  {offering.level}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-white mb-1">
                {offering.title}
              </h3>

              {/* Subtitle */}
              <p className="text-white/25 text-sm mb-5">
                {offering.subtitle}
              </p>

              {/* Examples */}
              <ul className="space-y-2 flex-1">
                {offering.examples.map((example) => (
                  <li key={example} className="flex items-start gap-2">
                    <span className="text-white/10 mt-0.5 shrink-0">&rarr;</span>
                    <span className="text-white/30 text-sm">{example}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ARES Manager callout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <h3 className="text-base font-semibold text-white">ARES Manager</h3>
          </div>
          <p className="text-white/30 text-sm leading-relaxed max-w-2xl">
            Envia tu pregunta al equipo correcto automaticamente. Identifica si es operativo,
            estrategico o financiero. Organiza el debate cuando hay desacuerdo.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
