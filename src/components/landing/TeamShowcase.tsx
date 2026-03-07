'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const assemblyMembers = [
  {
    name: 'Don',
    archetype: 'Venture Capital',
    description: 'Crecimiento agresivo, retorno 10x, exit strategy. Empuja contra Warren y Agus.',
  },
  {
    name: 'Warren',
    archetype: 'Limited Partner',
    description: 'Preservación de capital, retornos consistentes. Frena a Don y cuestiona riesgos.',
  },
  {
    name: 'Agus',
    archetype: 'Family Office',
    description: 'Visión multigeneracional, legacy. Piensa en décadas vs. Don que piensa en trimestres.',
  },
]

const boardMembers = [
  {
    name: 'Alex',
    archetype: 'Disruptor',
    description: 'Innovación radical, romper paradigmas, velocidad. Choca con Cathy y Jay.',
  },
  {
    name: 'Cathy',
    archetype: 'Architect',
    description: 'Sistemas, escalabilidad, estructura. Frena a Alex y demanda orden.',
  },
  {
    name: 'Jay',
    archetype: 'Strategist',
    description: 'Pensamiento estratégico, visión macro. Equilibra entre Alex y Cathy.',
  },
]

const csuiteMembers = [
  { role: 'Atlas', function: 'CEO Copilot', area: 'Visión operativa integral, KPIs, plan anual' },
  { role: 'CMO', function: 'Chief Marketing Officer', area: 'Brand, posicionamiento, adquisición' },
  { role: 'CFO', function: 'Chief Financial Officer', area: 'Números, viabilidad, ROI, flujo de caja' },
  { role: 'CLO', function: 'Chief Legal Officer', area: 'Compliance, riesgo legal, contratos' },
  { role: 'CHRO', function: 'Chief HR Officer', area: 'Cultura, talento, estructura organizacional' },
  { role: 'CIO', function: 'Chief Information Officer', area: 'Tecnología, sistemas, infraestructura digital' },
]

export default function TeamShowcase() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="equipo" className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-left">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-20"
        >
          <p className="label-premium mb-4">12 entidades de IA</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Conoce a tu equipo
          </h2>
          <p className="text-white/50 text-lg max-w-2xl font-light">
            3 niveles de gobierno. Deliberación real.
          </p>
        </motion.div>

        {/* Level 3: Assembly */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <span className="font-mono text-xs text-[#DC2626] uppercase tracking-wider">Nivel 3</span>
            <span className="text-white font-semibold text-lg">Asamblea de Accionistas</span>
          </div>
          <p className="text-white/50 text-sm mb-6 max-w-2xl">
            Protección de capital y evaluación de riesgo/retorno. ¿Levantamos capital? ¿Adquirimos esta empresa? ¿Distribuimos dividendos o reinvertimos?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assemblyMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="rounded-xl border border-[#DC2626]/15 bg-[#DC2626]/[0.03] p-5 hover:bg-[#DC2626]/[0.06] transition-colors duration-300"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-white font-semibold">{member.name}</span>
                  <span className="text-[#DC2626]/70 text-xs font-mono">{member.archetype}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level 2: Board */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
            <span className="font-mono text-xs text-[#7C3AED] uppercase tracking-wider">Nivel 2</span>
            <span className="text-white font-semibold text-lg">Junta Directiva</span>
          </div>
          <p className="text-white/50 text-sm mb-6 max-w-2xl">
            Deliberación estratégica y dirección de largo plazo. Directores independientes que desafían al CEO. No son roles funcionales — son perfiles de pensamiento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boardMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                className="rounded-xl border border-[#7C3AED]/15 bg-[#7C3AED]/[0.03] p-5 hover:bg-[#7C3AED]/[0.06] transition-colors duration-300"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-white font-semibold">{member.name}</span>
                  <span className="text-[#7C3AED]/70 text-xs font-mono">{member.archetype}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level 1: CEO + C-Suite */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="font-mono text-xs text-[#2563EB] uppercase tracking-wider">Nivel 1</span>
            <span className="text-white font-semibold text-lg">CEO (Atlas) + C-Suite</span>
          </div>
          <p className="text-white/50 text-sm mb-6 max-w-2xl">
            Ejecución operativa y decisiones tácticas. Atlas coordina a los 5 roles funcionales del C-Suite. ¿Contrato a este candidato? ¿Apruebo este gasto? ¿Lanzo esta campaña?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {csuiteMembers.map((member, i) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.06 }}
                className={`rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/[0.03] p-4 hover:bg-[#2563EB]/[0.06] transition-colors duration-300 ${member.role === 'Atlas' ? 'sm:col-span-2 md:col-span-3 border-[#2563EB]/25' : ''}`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-white font-semibold">{member.role}</span>
                  <span className="text-[#2563EB]/70 text-xs font-mono">{member.function}</span>
                </div>
                <p className="text-white/60 text-sm">{member.area}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ARES Orchestrator callout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-12 rounded-xl border border-white/[0.10] bg-white/[0.03] p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-white/70" />
            <h3 className="text-base font-semibold text-white">ARES34 — El Orquestador</h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
            ARES recibe tu pregunta, clasifica si es operativa (CEO + C-Suite), estratégica (Junta Directiva) o de capital (Asamblea), y la envía al nivel correcto. Para preguntas complejas, consulta en cascada y sintetiza. Cuando hay desacuerdo, facilita el debate y te presenta las posiciones.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
