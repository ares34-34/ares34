'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Lock, ShieldCheck, Eye, Server } from 'lucide-react'

const securityPoints = [
  {
    icon: Lock,
    title: 'Tus números NUNCA salen de tu cuenta',
    description:
      'Encriptados como tu cuenta bancaria. Solo tú los ves. Ni nosotros podemos acceder a tus estados financieros.',
  },
  {
    icon: Eye,
    title: '¿Qué pasa con la IA?',
    description:
      'Solo ve tu información DURANTE tu consulta. No aprende de tus datos. No se comparte con nadie. No se guarda después de responder.',
  },
  {
    icon: Server,
    title: 'Servidores certificados',
    description:
      'Se almacenan en servidores con los más altos estándares de seguridad. Conexión encriptada SSL en todo momento.',
  },
  {
    icon: ShieldCheck,
    title: 'Como tu contador',
    description:
      'Ve tus números para asesorarte, pero no puede usarlos para nada más. Tu información es solo tuya.',
  },
]

export default function Security() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="seguridad" className="relative py-32 sm:py-40 px-6 bg-black overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#059669]/20 bg-[#059669]/[0.05] mb-6">
            <Lock className="w-3.5 h-3.5 text-[#059669]" />
            <span className="text-[#059669] text-xs font-medium">Seguridad banco-nivel</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            ¿Mis datos están seguros?
          </h2>
          <p className="text-white text-lg max-w-lg">
            Tu información financiera está protegida como en tu cuenta bancaria.
          </p>
        </motion.div>

        {/* Security cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                className="rounded-xl border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-300 p-6 card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2">
                      {point.title}
                    </h3>
                    <p className="text-white text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-white/[0.08]"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white/70" />
            <span className="text-white text-xs font-mono">SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white/70" />
            <span className="text-white text-xs font-mono">AES-256</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-white/70" />
            <span className="text-white text-xs font-mono">RLS</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
