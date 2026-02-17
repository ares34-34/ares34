'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

// Demo scenarios — copy del fundador, lenguaje simple
const demoScenarios = [
  {
    question: '¿Contrato un Gerente de Ventas ahora o espero?',
    classification: 'CONSEJO DIRECTIVO',
    classColor: '#7C3AED',
    agents: [
      {
        role: 'Director Financiero (CFO)',
        text: 'Tu costo mensual sube $5,000 con ese puesto. ¿Tienes clientes seguros por $15,000+ para justificarlo? Hoy tienes $6,000 confirmados. Todavía no.',
      },
      {
        role: 'Director de Marketing (CMO)',
        text: 'Tu marca no atrae empresas grandes aún. Ese gerente necesita clientes que lleguen solos. Es prematuro.',
      },
      {
        role: 'Director de RR.HH. (CHRO)',
        text: 'Mejor opción: contrata 1 vendedor junior por $2,500/mes. Pruebas el proceso. Luego sí traes al gerente. Ahorras $30,000 en 6 meses.',
      },
    ],
    recommendation:
      'ESPERA 4 meses. Contrata vendedor junior ahora. Cuando tengas $12,000/mes en ventas comprobadas, ahí sí trae al gerente.',
  },
  {
    question: '¿Levanto capital o sigo con lo mío?',
    classification: 'JUNTA DE INVERSIONISTAS',
    classColor: '#DC2626',
    agents: [
      {
        role: 'Capital de Riesgo (VC)',
        text: 'Con 15% de crecimiento mensual, el timing es bueno. Pero asegura que el lead investor sea tier-1 y no aceptes valuación menor a $10M.',
      },
      {
        role: 'Socio Limitado (LP)',
        text: 'Dilución del 20% es alta a esta etapa. Si mantienes crecimiento, en 6 meses tu valuación sube 50%. Espera.',
      },
      {
        role: 'Oficina Familiar (FO)',
        text: 'Capital tiene costo más allá de dilución. Explora revenue-based financing primero: $300K-500K sin perder equity.',
      },
    ],
    recommendation:
      'ESPERA 6 meses. Llega a $100K MRR, mejora métricas clave (CAC < $500, LTV > $3K). Luego levanta desde posición de fuerza.',
  },
  {
    question: '¿Apruebo este gasto de $80,000 en publicidad digital?',
    classification: 'CEO',
    classColor: '#2563EB',
    agents: [
      {
        role: 'Tu CEO Virtual',
        text: 'Con tu CAC actual de $287 y meta de 50 clientes nuevos, necesitas $14,350 no $80,000. Empieza con $20,000 en 3 canales, mide ROI a 60 días y escala los ganadores.',
      },
    ],
    recommendation:
      'NO APRUEBES los $80,000 de golpe. Prueba con $20,000 divididos en 3 canales. Mata los que no den ROI >3:1 en 60 días.',
  },
]

export default function Hero() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'classifying' | 'agents' | 'recommendation' | 'fade'>('typing')
  const [typedText, setTypedText] = useState('')

  const scenario = demoScenarios[currentScenario]

  const resetAndAdvance = useCallback(() => {
    setPhase('fade')
    setTimeout(() => {
      setCurrentScenario((prev) => (prev + 1) % demoScenarios.length)
      setTypedText('')
      setPhase('typing')
    }, 600)
  }, [])

  // Typing effect
  useEffect(() => {
    if (phase !== 'typing') return
    const question = demoScenarios[currentScenario].question
    if (typedText.length < question.length) {
      const timer = setTimeout(() => {
        setTypedText(question.slice(0, typedText.length + 1))
      }, 40)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => setPhase('classifying'), 500)
      return () => clearTimeout(timer)
    }
  }, [phase, typedText, currentScenario])

  // Phase progression
  useEffect(() => {
    if (phase === 'classifying') {
      const timer = setTimeout(() => setPhase('agents'), 1000)
      return () => clearTimeout(timer)
    }
    if (phase === 'agents') {
      const agentCount = demoScenarios[currentScenario].agents.length
      const timer = setTimeout(() => setPhase('recommendation'), 800 + agentCount * 400)
      return () => clearTimeout(timer)
    }
    if (phase === 'recommendation') {
      const timer = setTimeout(() => resetAndAdvance(), 5000)
      return () => clearTimeout(timer)
    }
  }, [phase, currentScenario, resetAndAdvance])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid" />

      {/* Ambient glow — Codex style */}
      <div className="hero-glow" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] glow-blue float-slower opacity-60" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] glow-purple float-slow opacity-50" />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-[900px] mx-auto pt-24 pb-8 w-full"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Headline — copy del fundador */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-[4.5rem] font-bold text-white leading-[1.08] tracking-tight mb-6"
          variants={fadeIn}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Las mejores decisiones
          <br />
          <span className="text-white">nunca se toman solo</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg text-white max-w-xl mx-auto mb-3 leading-relaxed"
          variants={fadeIn}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Los CEOs grandes tienen un Consejo que los desafía antes de cada decisión importante.
          Tú decides solo, sin nadie que te cuestione.
        </motion.p>
        <motion.p
          className="text-base sm:text-lg text-white max-w-xl mx-auto mb-10 leading-relaxed font-medium"
          variants={fadeIn}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          ARES34 virtualiza ese equipo completo: CEO, Consejo Directivo y Junta de Inversionistas.
        </motion.p>

        {/* CTAs — Codex style: white primary button */}
        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
        >
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200"
          >
            Prueba 5 días gratis
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/20 text-white text-sm font-medium hover:border-white/40 hover:text-white transition-all duration-200"
          >
            Ver demo &darr;
          </a>
        </motion.div>

        {/* Micro-copy */}
        <motion.p
          variants={fadeIn}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-white text-xs mb-20"
        >
          Gratis &middot; 5 min setup &middot; Sin tarjeta
        </motion.p>

        {/* Product Demo Window — Codex-style terminal */}
        <motion.div
          id="demo"
          className="relative max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        >
          {/* Glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent blur-sm" />

          {/* Window */}
          <div className="relative rounded-2xl border border-white/[0.10] bg-[#0a0a0a] overflow-hidden demo-glow">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.03]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
              </div>
              <span className="ml-3 font-mono text-[11px] text-white/70">
                ARES34 — Tu Consejo en Acción
              </span>
            </div>

            {/* Terminal content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScenario}
                initial={{ opacity: phase === 'typing' ? 1 : 0 }}
                animate={{ opacity: phase === 'fade' ? 0 : 1 }}
                transition={{ duration: 0.4 }}
                className="p-6 space-y-4 font-mono text-xs sm:text-sm min-h-[340px]"
              >
                {/* User question with typing effect */}
                <div className="flex items-start gap-3">
                  <span className="text-white/70 select-none shrink-0">&gt;</span>
                  <span className="text-white">
                    {typedText}
                    {phase === 'typing' && (
                      <span className="inline-block w-[2px] h-[14px] bg-white/50 ml-0.5 cursor-blink align-middle" />
                    )}
                  </span>
                </div>

                {/* Classification */}
                {(phase === 'classifying' || phase === 'agents' || phase === 'recommendation') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 pl-6"
                  >
                    <span className="text-white/70">&rarr;</span>
                    <span className="text-white">Detectando nivel...</span>
                    <span
                      className="font-medium"
                      style={{ color: scenario.classColor }}
                    >
                      {scenario.classification}
                    </span>
                  </motion.div>
                )}

                {/* Separator */}
                {(phase === 'agents' || phase === 'recommendation') && (
                  <div className="border-t border-white/[0.08] my-1" />
                )}

                {/* Agent responses */}
                {(phase === 'agents' || phase === 'recommendation') && (
                  <div className={`grid grid-cols-1 ${scenario.agents.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''} gap-2`}>
                    {scenario.agents.map((agent, i) => (
                      <motion.div
                        key={agent.role}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.3 }}
                        className={`rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 ${scenario.agents.length === 1 ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: scenario.classColor }}
                          />
                          <span className="text-white text-[11px] font-medium">
                            {agent.role}
                          </span>
                        </div>
                        <p className="text-white text-[11px] leading-relaxed">
                          {agent.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {phase === 'recommendation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-lg border border-[#059669]/20 bg-[#059669]/[0.04] p-3 mt-2"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      <span className="text-[#059669] text-[11px] font-medium">
                        Recomendación del Consejo
                      </span>
                    </div>
                    <p className="text-white text-[11px] leading-relaxed">
                      {scenario.recommendation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
