'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Fundador',
    badge: 'Gratis',
    badgeColor: 'bg-[#059669]',
    price: '$0',
    priceColor: 'text-white',
    period: '/mes',
    features: [
      '5 consultas al mes',
      'Nivel CEO incluido',
      '1 usuario',
      'Historial de 30 días',
    ],
    cta: 'Comienza Aquí',
    ctaStyle:
      'border border-white/30 text-white hover:bg-white/10',
    href: '/login',
    featured: false,
    borderClass: 'border border-white/10',
  },
  {
    name: 'Consejo',
    badge: '$299/mes',
    badgeColor: 'bg-[#2563EB]',
    price: '$299',
    priceColor: 'text-[#2563EB]',
    period: '/mes',
    features: [
      'Consultas ilimitadas',
      'Los 3 niveles (CEO, Board, Asamblea)',
      '5 usuarios',
      'Historial completo',
      'Soporte prioritario',
    ],
    cta: 'Comenzar Prueba',
    ctaStyle:
      'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563EB]/25',
    href: '/login',
    featured: true,
    borderClass: 'border-2 border-[#2563EB]',
  },
  {
    name: 'Enterprise',
    badge: 'Personalizado',
    badgeColor: 'bg-[#7C3AED]',
    price: '$999+',
    priceColor: 'text-white',
    period: '/mes',
    features: [
      'Todo en Consejo',
      'Usuarios ilimitados',
      'API personalizada',
      'Onboarding dedicado',
      'SLA garantizado',
    ],
    cta: 'Contacta Ventas',
    ctaStyle:
      'border border-white/30 text-white hover:bg-white/10',
    href: undefined,
    featured: false,
    borderClass: 'border border-white/10',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
}

export default function Pricing() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Planes que Crecen Contigo
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto">
            Empieza gratis. Escala cuando lo necesites.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className={`relative bg-[#1A2F42] rounded-xl ${plan.borderClass} p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30 ${
                plan.featured ? 'md:scale-105 md:z-10' : ''
              }`}
            >
              {/* "Mas Popular" label for featured card */}
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Badge */}
              <div className="mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${plan.badgeColor}`}
                >
                  {plan.badge}
                </span>
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-bold ${plan.priceColor}`}>
                  {plan.price}
                </span>
                <span className="text-[#9CA3AF] text-sm">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
                    <span className="text-[#9CA3AF] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.href ? (
                <Link
                  href={plan.href}
                  className={`block w-full text-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
