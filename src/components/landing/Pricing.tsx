'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

const plans = [
  {
    name: 'Inicial',
    price: '$199',
    period: '/mes',
    description: 'Para probar si mejora tus decisiones',
    features: [
      'CEO + Consejo + Junta completos',
      '20 consultas al mes (1 decisión grande por día)',
      'Plataforma web',
      'Historial de todas tus deliberaciones',
    ],
    cta: 'Prueba 5 días gratis',
    href: '/login',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/mes',
    description: 'Para decisiones urgentes que no pueden esperar',
    features: [
      'Todo lo del plan Inicial',
      'Consultas ilimitadas',
      'WhatsApp directo: pregunta desde donde estés',
      'Email directo: manda documentos, recibe análisis',
      'Respuestas más rápidas',
    ],
    cta: 'Prueba 5 días gratis',
    href: '/login',
    featured: true,
    badge: 'Popular',
  },
  {
    name: 'Empresarial',
    price: '$999',
    period: '/mes',
    description: 'Si tienes varios negocios o eres inversionista',
    features: [
      'Todo lo del plan Pro',
      'Varios negocios (cada uno con su equipo)',
      'Miembros personalizados ilimitados',
      'Conecta con tus sistemas actuales',
      'Soporte dedicado',
    ],
    cta: 'Contactar',
    href: '/login',
    featured: false,
  },
]

const comparisons = [
  {
    traditional: 'Consultor de estrategia 1 hora',
    traditionalPrice: '$500 USD',
    ares: 'ARES34 un mes completo',
    aresPrice: '$199 MXN',
  },
  {
    traditional: 'Contador/CFO medio tiempo',
    traditionalPrice: '$8,000/mes',
    ares: '5 directores virtuales 24/7',
    aresPrice: '$299/mes',
  },
]

export default function Pricing() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="precios" className="relative py-32 sm:py-40 px-6 overflow-hidden section-glow-right">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      <div className="max-w-[1200px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            ¿Cuánto cuesta realmente tener un equipo?
          </h2>
        </motion.div>

        {/* Cost comparisons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-16 space-y-3"
        >
          {comparisons.map((comp) => (
            <div key={comp.traditional} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
              <span className="text-white">
                {comp.traditional}: <span className="text-white font-medium">{comp.traditionalPrice}</span>
              </span>
              <span className="hidden sm:inline text-white">vs</span>
              <span className="text-white">
                {comp.ares}: <span className="text-[#059669] font-medium">{comp.aresPrice}</span>
              </span>
            </div>
          ))}
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.2 + index * 0.1,
                ease: 'easeOut',
              }}
              className={`rounded-xl p-6 flex flex-col relative ${
                plan.featured
                  ? 'border border-white/[0.15] bg-white/[0.05] card-hover'
                  : 'border border-white/[0.10] bg-white/[0.03] card-hover'
              }`}
            >
              {/* Badge */}
              {'badge' in plan && plan.badge && (
                <span className="absolute -top-2.5 left-6 px-3 py-0.5 bg-white text-black text-[11px] font-semibold rounded-full">
                  {plan.badge}
                </span>
              )}

              {/* Plan name */}
              <h3 className="text-sm font-medium text-white mb-1">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-white text-sm">{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-white text-xs mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-white/70 mt-0.5">&mdash;</span>
                    <span className="text-white text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block w-full text-center px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  plan.featured
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/[0.08] text-white hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-white text-sm font-medium">
            Garantía 30 días: si no mejora tus decisiones, te devolvemos tu dinero. Sin preguntas.
          </p>
          <p className="text-white text-xs">
            Prueba 5 días gratis. Sin tarjeta de crédito.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
