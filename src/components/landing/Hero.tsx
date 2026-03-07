'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { CALENDLY_URL } from '@/lib/constants'

// Demo scenarios — nueva arquitectura: Assembly, Board, CEO+C-Suite
const demoScenarios = [
  {
    question: '¿Debería contratar un growth hacker o un content manager?',
    classification: 'CEO + C-SUITE',
    classColor: '#2563EB',
    agents: [
      {
        role: 'Atlas (CEO)',
        text: 'Según tu plan Q1, prioridad es adquisición. Growth hacker alinea mejor con ese objetivo.',
      },
      {
        role: 'CFO',
        text: 'Growth hacker senior cuesta 40% más. Con tu runway actual, puedes sostenerlo 8 meses. Content manager te da 14.',
      },
      {
        role: 'CMO',
        text: 'Sin contenido, el growth hacker no tiene qué distribuir. Necesitas los dos, pero content primero crea el activo.',
      },
      {
        role: 'CHRO',
        text: 'Un growth hacker bueno no se queda sin visión de producto clara. Si no está lista, lo pierdes en 4 meses.',
      },
    ],
    recommendation:
      'Content manager ahora para construir el activo. Growth hacker en 4 meses cuando haya qué distribuir.',
  },
  {
    question: '¿Levanto capital o sigo con lo mío?',
    classification: 'ASAMBLEA DE ACCIONISTAS',
    classColor: '#DC2626',
    agents: [
      {
        role: 'Don (Venture Capital)',
        text: 'Con 15% de crecimiento mensual, el timing es bueno. Asegura lead investor tier-1 y no aceptes valuación menor a $10M.',
      },
      {
        role: 'Warren (Limited Partner)',
        text: 'Dilución del 20% es alta a esta etapa. Si mantienes crecimiento, en 6 meses tu valuación sube 50%. Espera.',
      },
      {
        role: 'Agus (Family Office)',
        text: 'Capital tiene costo más allá de dilución. Explora revenue-based financing primero: $300K-500K sin perder equity.',
      },
    ],
    recommendation:
      'ESPERA 6 meses. Llega a $100K MRR, mejora métricas clave (CAC < $500, LTV > $3K). Luego levanta desde posición de fuerza.',
  },
  {
    question: '¿Pivoteamos el modelo de negocio a SaaS?',
    classification: 'JUNTA DIRECTIVA',
    classColor: '#7C3AED',
    agents: [
      {
        role: 'Alex (Disruptor)',
        text: 'SaaS es el futuro de tu industria. Muévete rápido antes de que un competidor lo haga. MVP en 90 días.',
      },
      {
        role: 'Cathy (Architect)',
        text: 'Necesitas infraestructura antes de pivotar: pricing, onboarding, soporte. Sin estructura, fracasas en la ejecución.',
      },
      {
        role: 'Jay (Strategist)',
        text: 'No es blanco o negro. Mantén servicios como revenue bridge mientras construyes SaaS. Migración gradual en 12 meses.',
      },
    ],
    recommendation:
      'Modelo híbrido: servicios + SaaS en paralelo. Construye MVP en 90 días con 3 clientes piloto. Migración completa en 12 meses.',
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
      const timer = setTimeout(() => resetAndAdvance(), 8000)
      return () => clearTimeout(timer)
    }
  }, [phase, currentScenario, resetAndAdvance])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 md:px-12 max-w-[900px] mx-auto pt-28 pb-8 w-full">
        {/* Label */}
        <p className="label-premium mb-6">Inteligencia ejecutiva con IA</p>

        {/* Headline — Serif premium */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4.5rem] font-bold text-white leading-[1.08] tracking-tight mb-6">
          Deja de decidir solo.
          <br />
          <span className="text-white/75">Tu equipo de gobierno corporativo ya está listo.</span>
        </h1>

        {/* Decorative rule */}
        <div className="rule-gold mx-auto mb-6" />

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Asamblea de Accionistas. Junta Directiva. CEO con C-Suite.
          <br className="hidden sm:block" />
          12 entidades que deliberan por ti antes de que tomes la decisión.
        </p>

        {/* CTAs — Premium gold */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full btn-premium text-sm"
          >
            Agenda tu demo
          </a>
          <a
            href="#equipo"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full btn-premium-secondary text-sm font-medium"
          >
            Conoce a tu equipo &darr;
          </a>
        </div>

        {/* Stat */}
        <p className="text-white/35 text-sm mb-16 font-light">
          La mayoría de los dueños de negocio se sienten solos al tomar decisiones críticas.
        </p>

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
                ARES34 — Deliberación en Acción
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
                    <span className="text-white/50">ARES detecta:</span>
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
                  <div className={`grid grid-cols-1 ${scenario.agents.length > 2 ? 'sm:grid-cols-2' : ''} gap-2`}>
                    {scenario.agents.map((agent, i) => (
                      <motion.div
                        key={agent.role}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.3 }}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3"
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
                        <p className="text-white/80 text-[11px] leading-relaxed">
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
                        Recomendación
                      </span>
                    </div>
                    <p className="text-white/80 text-[11px] leading-relaxed">
                      {scenario.recommendation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {demoScenarios.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCurrentScenario(i)
                  setTypedText('')
                  setPhase('typing')
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentScenario
                    ? 'bg-white w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Escenario ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
