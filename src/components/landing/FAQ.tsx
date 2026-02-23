'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: '¿La IA decide por mí?',
    answer:
      'No. Tú siempre decides. ARES analiza, te muestra riesgos y perspectivas que no tenías. Tú tienes la última palabra.',
  },
  {
    question: '¿Sirve para mi tipo de negocio?',
    answer:
      'Si tomas decisiones que afectan tus finanzas, sí. El Consejo se configura para TU industria específica durante el onboarding.',
  },
  {
    question: '¿Qué tan personalizado es?',
    answer:
      'Tu CEO virtual aprende tus números reales, tus metas, tu contexto. Después de 10 consultas, conoce tu negocio mejor que un consultor externo.',
  },
  {
    question: '¿Puedo subir mis estados financieros?',
    answer:
      'Sí. Están encriptados y solo tú los ves. La IA los usa para darte mejor análisis, pero no los guarda ni comparte.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      '$99 USD al mes. Precio de fundador para los primeros 50 clientes. Incluye todo: CEO Virtual, Consejo Directivo y Junta de Inversionistas. Consultas ilimitadas. 30 días de garantía completa.',
  },
  {
    question: '¿Cuánto tarda en responder?',
    answer:
      'Depende de la complejidad: decisiones operativas tardan ~25 segundos, decisiones de estrategia ~30 segundos (5 directores deliberando), y decisiones de capital ~28 segundos.',
  },
  {
    question: '¿Reemplaza a mi contador o abogado?',
    answer:
      'ARES complementa, no reemplaza. Te da perspectivas estructuradas para tomar mejores decisiones, pero para temas legales o fiscales complejos siempre recomendamos consultar a un especialista.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative py-32 sm:py-40 px-6 overflow-hidden section-glow-left">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="max-w-2xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Preguntas frecuentes
          </h2>
        </motion.div>

        {/* Accordion */}
        <div>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: 'easeOut',
              }}
              className="border-b border-white/[0.08]"
            >
              {/* Question */}
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-white text-sm sm:text-base pr-4 group-hover:text-white transition-colors duration-200">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </motion.div>
              </button>

              {/* Answer */}
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-white text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
