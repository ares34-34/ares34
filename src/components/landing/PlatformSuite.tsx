'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Newspaper,
  Activity,
  Users,
  GitBranch,
  FileText,
  ShieldCheck,
  ClipboardList,
  Calendar,
} from 'lucide-react'

const categories = [
  {
    label: 'Inteligencia Diaria',
    modules: [
      {
        icon: Newspaper,
        title: 'Brief Ejecutivo Diario',
        description: 'Resumen personalizado de lo que importa hoy para tu negocio.',
      },
      {
        icon: Activity,
        title: 'Pulso Empresarial',
        description: 'Salud financiera, operativa y estratégica en tiempo real.',
      },
    ],
  },
  {
    label: 'Toma de Decisiones',
    modules: [
      {
        icon: Users,
        title: 'Deliberación con 12 Entidades',
        description: 'Tu consejo completo debate cada decisión desde múltiples perspectivas.',
      },
      {
        icon: GitBranch,
        title: 'Simulador de Escenarios',
        description: '¿Qué pasa si subes precios? ¿Si contratas? Simúlalo antes de decidir.',
      },
    ],
  },
  {
    label: 'Ejecución Legal',
    modules: [
      {
        icon: FileText,
        title: 'Generador de Contratos',
        description: 'NDAs, laborales, servicios y más bajo legislación mexicana.',
      },
      {
        icon: ShieldCheck,
        title: 'Verificación de Cumplimiento',
        description: 'SAT, IMSS, LFT, LFPDPPP — verifica antes de que sea problema.',
      },
    ],
  },
  {
    label: 'Productividad Ejecutiva',
    modules: [
      {
        icon: ClipboardList,
        title: 'Prep de Juntas',
        description: 'Agenda, contexto y puntos clave listos antes de cada reunión.',
      },
      {
        icon: Calendar,
        title: 'Calendario Integrado',
        description: 'Sincroniza con Google Calendar. Tu agenda ejecutiva en un solo lugar.',
      },
    ],
  },
]

export default function PlatformSuite() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="plataforma" className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-left">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="label-premium mb-4">8 módulos integrados</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Tu Suite Completa
          </h2>
          <p className="text-white/50 text-lg max-w-xl font-light">
            Capacidades diseñadas para que operes tu negocio con la estructura de una empresa de $500M.
          </p>
        </motion.div>

        {/* Module grid by category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
            >
              <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
                {category.label}
              </p>
              <div className="space-y-3">
                {category.modules.map((mod) => {
                  const Icon = mod.icon
                  return (
                    <div
                      key={mod.title}
                      className="rounded-xl card-premium p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-[#C9A962]/[0.08] flex items-center justify-center">
                          <Icon className="w-4.5 h-4.5 text-[#C9A962]/70" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-1">
                            {mod.title}
                          </h3>
                          <p className="text-white/50 text-sm leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
