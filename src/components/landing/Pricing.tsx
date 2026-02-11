'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: '/mes',
    features: [
      '5 consultas al mes',
      'Nivel CEO incluido',
      '1 usuario',
      'Historial de 30 dias',
    ],
    cta: 'Comenzar',
    href: '/login',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/mes',
    features: [
      'Consultas ilimitadas',
      'Los 3 niveles (CEO, Board, Asamblea)',
      '5 usuarios',
      'Historial completo',
      'Soporte prioritario',
    ],
    cta: 'Comenzar prueba',
    href: '/login',
    featured: true,
  },
]

export default function Pricing() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#09090b]">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="max-w-[1100px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Precios
          </h2>
          <p className="text-white/30 text-lg">
            Empieza gratis. Escala cuando lo necesites.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className={`rounded-lg p-6 flex flex-col ${
                plan.featured
                  ? 'border border-white/[0.15] bg-white/[0.03]'
                  : 'border border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              {/* Plan name */}
              <h3 className="text-sm font-medium text-white/50 mb-4">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-white/25 text-sm">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-white/15 mt-0.5">—</span>
                    <span className="text-white/40 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block w-full text-center px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  plan.featured
                    ? 'bg-white text-[#09090b] hover:bg-white/90'
                    : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/80'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
