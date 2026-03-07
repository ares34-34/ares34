'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const steps = [
  {
    number: '01',
    title: 'Haz tu pregunta',
    description: 'Escribe tu situación como se la contarías a un socio de confianza.',
  },
  {
    number: '02',
    title: 'ARES convoca al equipo correcto',
    description: 'Detecta qué tipo de decisión es y activa el nivel adecuado. Debaten, discrepan, y llegan a una recomendación.',
  },
  {
    number: '03',
    title: 'Tú decides',
    description: 'Recibes la deliberación completa: quién dijo qué, dónde hubo tensión, y la recomendación final.',
  },
]

const deliberationExample = {
  question: '¿Debería contratar un growth hacker o un content manager?',
  level: 'CEO (Atlas) + C-Suite',
  levelColor: '#2563EB',
  responses: [
    { role: 'Atlas (CEO)', text: 'Según tu plan Q1, prioridad es adquisición. Growth hacker alinea mejor con ese objetivo.' },
    { role: 'CFO', text: 'Growth hacker senior cuesta 40% más. Con tu runway actual, puedes sostenerlo 8 meses. Content manager te da 14 meses.' },
    { role: 'CMO', text: 'Sin contenido, el growth hacker no tiene qué distribuir. Necesitas los dos, pero content primero crea el activo.' },
    { role: 'CHRO', text: 'Un growth hacker bueno no se queda sin visión de producto clara. Si no está lista, lo pierdes en 4 meses.' },
  ],
  recommendation: 'Content manager ahora para construir el activo. Growth hacker en 4 meses cuando haya qué distribuir.',
}

export default function HowItWorks() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="como-funciona" className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-right">
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
          <p className="label-premium mb-4">3 pasos</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Tú preguntas. Ellos deliberan. Tú decides.
          </h2>
        </motion.div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <span className="font-mono text-5xl font-bold text-white/[0.06] absolute -top-2 -left-1">
                {step.number}
              </span>
              <div className="pt-10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Deliberation Example */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl border border-white/[0.10] bg-white/[0.03] overflow-hidden"
        >
          {/* Example header */}
          <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
            <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-1">Ejemplo de deliberación</p>
            <p className="text-white text-sm font-medium">&ldquo;{deliberationExample.question}&rdquo;</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: deliberationExample.levelColor }} />
              <span className="text-xs font-mono" style={{ color: deliberationExample.levelColor }}>
                {deliberationExample.level}
              </span>
            </div>
          </div>

          {/* Responses */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliberationExample.responses.map((r) => (
              <div
                key={r.role}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span className="text-white text-xs font-semibold block mb-1.5">{r.role}</span>
                <p className="text-white/60 text-xs leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="px-6 pb-6">
            <div className="rounded-lg border border-[#059669]/20 bg-[#059669]/[0.04] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <span className="text-[#059669] text-xs font-semibold">Recomendación</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{deliberationExample.recommendation}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
