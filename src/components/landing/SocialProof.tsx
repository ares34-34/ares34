'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface AnimatedNumberProps {
  target: number
  suffix: string
  isActive: boolean
  duration?: number
}

function AnimatedNumber({
  target,
  suffix,
  isActive,
  duration = 2000,
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0)

  const animate = useCallback(() => {
    const startTime = Date.now()

    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for a smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(eased * target)

      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(step)
  }, [target, duration])

  useEffect(() => {
    if (isActive) {
      animate()
    }
  }, [isActive, animate])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isActive ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {count.toLocaleString('es-MX')}
      {suffix}
    </motion.span>
  )
}

const stats = [
  { target: 200, suffix: '+', label: 'PyMEs confían en ARES' },
  { target: 50, suffix: 'K+', label: 'Decisiones deliberadas' },
  { target: 12, suffix: 'M+', label: 'Tokens de contexto analizado' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export default function SocialProof() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1929] via-[#0f2236] to-[#0A1929]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2563EB]/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto" ref={ref}>
        {/* Stats row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0 md:divide-x md:divide-white/10"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="flex flex-col items-center text-center px-8 md:px-12 lg:px-16"
            >
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                <AnimatedNumber
                  target={stat.target}
                  suffix={stat.suffix}
                  isActive={inView}
                />
              </span>
              <span className="text-sm text-[#9CA3AF]">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Simulated client logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-4 flex-wrap"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-24 h-8 bg-white/5 rounded"
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
