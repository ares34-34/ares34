'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const timeline = [
  {
    time: '7:00 AM',
    module: 'Brief Diario',
    description: 'Abres tu día con un resumen ejecutivo personalizado: métricas clave, pendientes y lo que necesita tu atención.',
  },
  {
    time: '8:00 AM',
    module: 'Pulso Empresarial',
    description: 'Revisión rápida de la salud de tu negocio. ¿Algo está en rojo? Lo sabes antes de tu primer café.',
  },
  {
    time: '9:30 AM',
    module: 'Prep de Juntas',
    description: 'Tu junta de las 10 ya tiene agenda, contexto y puntos clave listos automáticamente.',
  },
  {
    time: '11:00 AM',
    module: 'Deliberación',
    description: 'Preguntas a ARES sobre una decisión estratégica. 12 entidades deliberan y te dan una recomendación unificada.',
  },
  {
    time: '1:00 PM',
    module: 'Simulador de Escenarios',
    description: '¿Qué pasa si subes precios 15%? ¿Si abres en otra ciudad? Simúlalo antes de arriesgar.',
  },
  {
    time: '3:00 PM',
    module: 'Generador de Contratos',
    description: 'Necesitas un NDA para un nuevo proveedor. Lo generas en minutos bajo legislación mexicana.',
  },
  {
    time: '4:00 PM',
    module: 'Cumplimiento Legal',
    description: 'Verificas que un nuevo contrato laboral cumple con LFT, IMSS y todas las obligaciones patronales.',
  },
  {
    time: '5:00 PM',
    module: 'Calendario',
    description: 'Revisas tu agenda de mañana sincronizada con Google Calendar. Todo en un solo lugar.',
  },
]

export default function DayWithAres() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
  })

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="separator-premium" />

      <div className="max-w-[800px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="label-premium mb-4">Un día típico</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Tu Día con ARES34
          </h2>
          <p className="text-white/50 text-lg max-w-lg font-light">
            De herramienta de consulta a sistema operativo del CEO.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — hidden on mobile */}
          <div className="hidden sm:block absolute left-[47px] top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.15] via-white/[0.08] to-transparent" />

          <div className="space-y-1">
            {timeline.map((entry, index) => (
              <motion.div
                key={entry.time}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative flex items-start gap-3 sm:gap-5 py-4"
              >
                {/* Time badge */}
                <div className="shrink-0 w-[60px] sm:w-[95px] text-right">
                  <span className="text-white/40 text-[10px] sm:text-xs font-mono">
                    {entry.time}
                  </span>
                </div>

                {/* Dot on timeline — hidden on mobile */}
                <div className="hidden sm:block shrink-0 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/[0.15] mt-1.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {entry.module}
                  </h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
