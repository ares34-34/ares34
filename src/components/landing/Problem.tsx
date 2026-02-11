'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Brain, Users, Clock } from 'lucide-react'

const cards = [
  {
    icon: Brain,
    title: 'Sin estructura de decisión',
    description:
      'Tomas decisiones importantes basándote en instinto, sin un framework que te respalde.',
  },
  {
    icon: Users,
    title: 'Sin perspectivas diversas',
    description:
      'No tienes un consejo directivo que te dé puntos de vista financieros, legales y estratégicos.',
  },
  {
    icon: Clock,
    title: 'Sin tiempo para asesores',
    description:
      'Contratar consultores toma semanas. Tú necesitas respuestas hoy.',
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
}

export default function Problem() {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  const [cardsRef, cardsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-24 sm:py-32 bg-[#0A1929]">
      {/* Subtle top gradient divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            El 61% de los CEOs se sienten aislados en sus decisiones
          </h2>
          <p className="text-lg text-[#9CA3AF] leading-relaxed">
            Las PyMEs enfrentan las mismas decisiones que las grandes empresas,
            pero sin el mismo sistema de soporte.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const IconComponent = card.icon

            return (
              <motion.div
                key={card.title}
                className="group bg-[#1A2F42] border border-white/10 rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
                initial="hidden"
                animate={cardsInView ? 'visible' : 'hidden'}
                variants={fadeInUp}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: index * 0.15,
                }}
              >
                {/* Icon */}
                <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB]/15 transition-colors duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[#E5E7EB] mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-[#9CA3AF] leading-relaxed text-sm">
                  {card.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
