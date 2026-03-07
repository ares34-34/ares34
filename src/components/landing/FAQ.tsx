'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: '¿La IA decide por mí?',
    answer:
      'No. Tú siempre decides. ARES analiza, delibera y te muestra riesgos y perspectivas que no tenías. Tú tienes la última palabra.',
  },
  {
    question: '¿Quiénes son las 12 entidades?',
    answer:
      'Son 3 niveles de gobierno corporativo: Asamblea de Accionistas (Don, Warren, Agus — protección de capital), Junta Directiva (Alex, Cathy, Jay — estrategia de largo plazo), y CEO Atlas + C-Suite (CFO, CMO, CLO, CHRO, CIO — ejecución operativa). Cada uno tiene personalidad, sesgos y tensiones diseñadas para generar deliberación real.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      '$9,999 MXN al mes con un compromiso mínimo de 6 meses. Incluye el ecosistema completo: 12 entidades, 3 niveles de gobierno, onboarding personalizado, historial de deliberaciones y soporte directo.',
  },
  {
    question: '¿Por qué 6 meses mínimo?',
    answer:
      'Porque los primeros 30 días los usas para configurar. Los siguientes 60 para confiar. Y a partir del cuarto mes, no puedes operar sin tu equipo. El valor real de ARES34 se experimenta con el uso continuo.',
  },
  {
    question: '¿Qué incluye el onboarding?',
    answer:
      '3 sesiones de configuración donde defines tu negocio, tu contexto financiero, tus KPIs, tu estilo de liderazgo y eliges el arquetipo de tu 5to consejero. Después de eso, ARES conoce tu negocio mejor que un consultor externo.',
  },
  {
    question: '¿Reemplaza a mi contador o abogado?',
    answer:
      'ARES complementa, no reemplaza. Te da perspectivas estructuradas para tomar mejores decisiones, pero para temas legales o fiscales complejos siempre recomendamos consultar a un especialista.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Tu información está encriptada con AES-256, almacenada en servidores con Row Level Security (RLS), y la IA solo la ve durante tu consulta. No aprende de tus datos, no se comparten y no se guardan después de responder.',
  },
  {
    question: '¿Cuánto tarda en responder?',
    answer:
      'Depende de la complejidad: decisiones operativas (CEO + C-Suite) tardan ~25 segundos, decisiones estratégicas (Junta Directiva) ~27 segundos, y decisiones de capital (Asamblea) ~26 segundos.',
  },
  {
    question: '¿Qué módulos incluye ARES34?',
    answer:
      'Además de la deliberación con 12 entidades, ARES34 incluye: Brief Ejecutivo Diario, Pulso de Salud Empresarial, Simulador de Escenarios, Generador de Contratos bajo ley mexicana, Verificación de Cumplimiento Legal, Preparación de Juntas y Calendario integrado con Google Calendar.',
  },
  {
    question: '¿Los contratos generados son legalmente válidos?',
    answer:
      'ARES34 genera borradores de contratos profesionales bajo el marco legal mexicano (Código Civil, Código de Comercio, LFT, Ley de Sociedades Mercantiles). Son un punto de partida sólido, pero siempre recomendamos que un abogado los revise antes de firmar.',
  },
  {
    question: '¿Se integra con Google Calendar?',
    answer:
      'Sí. El módulo de Calendario se sincroniza bidireccionalmente con Google Calendar. Los eventos que crees en ARES34 aparecen en Google y viceversa. Tu agenda ejecutiva completa en un solo lugar.',
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

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-left">
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-2xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <p className="label-premium mb-4">FAQ</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
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
                    <p className="pb-5 text-white/70 text-sm leading-relaxed">
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
