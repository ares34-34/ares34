'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'ARES funciona completamente en español?',
    answer:
      'Sí. ARES34 está diseñado 100% para el mercado mexicano. Todos los agentes responden en español mexicano, con conocimiento del marco legal (LFT, SAT, IMSS) y fiscal del país.',
  },
  {
    question: 'Qué tan segura está mi información?',
    answer:
      'Tu información se procesa de forma encriptada y no se comparte con terceros. Usamos Supabase con Row Level Security \u2014 solo tú puedes ver tus datos. No entrenamos modelos con tu información.',
  },
  {
    question: 'Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí. Puedes escalar o reducir tu plan cuando quieras. No hay contratos de permanencia ni penalizaciones.',
  },
  {
    question: 'Cuánto tarda en responder ARES?',
    answer:
      'Depende del nivel: las consultas CEO tardan ~6 segundos, las de Board ~17 segundos (5 agentes deliberando en paralelo), y las de Asamblea ~12 segundos.',
  },
  {
    question: 'Reemplaza a un consultor o abogado?',
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
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0D1F35]">
      <div className="max-w-3xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: 'easeOut',
              }}
            >
              <div
                className={`bg-[#1A2F42] rounded-lg border-b border-white/5 transition-colors duration-200 ${
                  openIndex !== index ? 'hover:bg-[#1A2F42]/80' : ''
                }`}
              >
                {/* Question Header */}
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-[#E5E7EB] font-medium text-sm sm:text-base pr-4">
                    {'\u00BF'}{faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-[#9CA3AF] text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
