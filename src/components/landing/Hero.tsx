'use client'

import { motion } from 'framer-motion'
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

// Demo window agent responses
const agents = [
  {
    role: 'CFO',
    color: '#2563EB',
    text: 'B2B incrementa ticket promedio 8x. CAC se recupera en 4 meses vs 14 en B2C.',
  },
  {
    role: 'CMO',
    color: '#2563EB',
    text: 'Pipeline B2B requiere content marketing + SDR. Ciclo de venta: 45-90 dias.',
  },
  {
    role: 'CLO',
    color: '#2563EB',
    text: 'Revisar contratos actuales B2C. NDA necesarios para pilotos enterprise.',
  },
  {
    role: 'CHRO',
    color: '#2563EB',
    text: 'Reconvertir 2 de soporte a customer success. Contratar 1 AE en 60 dias.',
  },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid" />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 max-w-[1100px] mx-auto pt-20 pb-8 w-full"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Label */}
        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <span className="inline-block font-mono text-xs tracking-widest text-white/30 uppercase mb-8">
            Sistema de Inteligencia Ejecutiva
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-6"
          variants={fadeIn}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          Tu consejo directivo.
          <br />
          <span className="text-white/80">Impulsado por IA.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg text-white/40 max-w-lg mx-auto mb-10 leading-relaxed"
          variants={fadeIn}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          16 agentes de IA deliberan tus decisiones de negocio como un consejo directivo Fortune 500.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center gap-3 mb-20"
        >
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-white text-[#09090b] text-sm font-medium hover:bg-white/90 transition-colors duration-200"
          >
            Comenzar gratis
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md border border-white/[0.1] text-white/60 text-sm font-medium hover:text-white/80 hover:border-white/[0.2] transition-all duration-200"
          >
            Ver demo
          </Link>
        </motion.div>

        {/* Product Demo Window */}
        <motion.div
          className="relative max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-px rounded-xl bg-[#2563EB]/[0.05] blur-xl" />
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02]" />

          {/* Window */}
          <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              </div>
              <span className="ml-3 font-mono text-[11px] text-white/25">
                ARES34 — Sesion de Consejo
              </span>
            </div>

            {/* Terminal content */}
            <div className="p-5 sm:p-6 space-y-4 font-mono text-xs sm:text-sm">
              {/* User question */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <span className="text-white/20 select-none shrink-0">&gt;</span>
                <span className="text-white/70">
                  Deberia pivotar mi SaaS de B2C a B2B?
                </span>
              </motion.div>

              {/* Route classification */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="flex items-center gap-2 pl-6"
              >
                <span className="text-white/15">→</span>
                <span className="text-white/30">Clasificado:</span>
                <span className="text-[#7C3AED]/80 font-medium">BOARD_LEVEL</span>
                <span className="text-white/15">•</span>
                <span className="text-white/30">Confianza:</span>
                <span className="text-white/50">0.94</span>
              </motion.div>

              {/* Separator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.3 }}
                className="border-t border-white/[0.04] my-1"
              />

              {/* Agent responses grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.9 + i * 0.15, duration: 0.3 }}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span className="text-white/50 text-[11px] font-medium">
                        {agent.role}
                      </span>
                    </div>
                    <p className="text-white/30 text-[11px] leading-relaxed">
                      {agent.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Synthesis */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.6, duration: 0.4 }}
                className="rounded-md border border-white/[0.08] bg-white/[0.03] p-3 mt-2"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  <span className="text-white/50 text-[11px] font-medium">
                    Recomendacion del Consejo
                  </span>
                </div>
                <p className="text-white/40 text-[11px] leading-relaxed">
                  Proceder con pivoteo gradual: mantener B2C como cashflow mientras se valida B2B con 3 pilotos enterprise. Meta: 60% revenue B2B en 12 meses. Riesgo principal: velocidad de ejecucion.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
