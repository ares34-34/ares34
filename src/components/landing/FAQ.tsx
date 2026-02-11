'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'ARES funciona completamente en espanol?',
    answer:
      'Si. ARES34 esta disenado 100% para el mercado mexicano. Todos los agentes responden en espanol mexicano, con conocimiento del marco legal (LFT, SAT, IMSS) y fiscal del pais.',
  },
  {
    question: 'Que tan segura esta mi informacion?',
    answer:
      'Tu informacion se procesa de forma encriptada y no se comparte con terceros. Usamos Supabase con Row Level Security — solo tu puedes ver tus datos. No entrenamos modelos con tu informacion.',
  },
  {
    question: 'Puedo cambiar de plan en cualquier momento?',
    answer:
      'Si. Puedes escalar o reducir tu plan cuando quieras. No hay contratos de permanencia ni penalizaciones.',
  },
  {
    question: 'Cuanto tarda en responder ARES?',
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
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#09090b]">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="max-w-2xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
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
              className="border-b border-white/[0.06]"
            >
              {/* Question */}
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-white/80 text-sm sm:text-base pr-4 group-hover:text-white transition-colors duration-200">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-white/20" />
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
                    <p className="pb-5 text-white/35 text-sm leading-relaxed">
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
