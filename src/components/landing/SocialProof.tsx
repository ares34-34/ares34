'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const testimonials = [
  {
    quote: 'Le pregunté si debía contratar un gerente de ventas. Me ahorró $180,000 en 6 meses con una alternativa que no había considerado.',
    name: 'Ricardo M.',
    role: 'CEO',
    company: 'Distribuidora en Monterrey',
  },
  {
    quote: 'Tenía que decidir si aceptaba una inversión. El consejo me mostró riesgos que mi contador no vio. Negocié mejores términos.',
    name: 'Ana H.',
    role: 'Fundadora',
    company: 'Startup SaaS en CDMX',
  },
  {
    quote: 'Lo uso antes de cada junta directiva. Llego con las preguntas correctas y las respuestas preparadas. Mis socios notan la diferencia.',
    name: 'Miguel T.',
    role: 'Director General',
    company: 'Grupo industrial en Guadalajara',
  },
]

export default function SocialProof() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-32 sm:py-40 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Lo que dicen los fundadores
          </h2>
          <p className="text-white/60 text-lg max-w-lg">
            CEOs que ya usan ARES34 para tomar mejores decisiones.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.1 + index * 0.1,
                ease: 'easeOut',
              }}
              className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 flex flex-col card-hover"
            >
              <p className="text-white/80 text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-white text-sm font-medium">{t.name}</p>
                <p className="text-white/40 text-xs">
                  {t.role}, {t.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
