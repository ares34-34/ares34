'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { CALENDLY_URL } from '@/lib/constants'

interface InlineCTAProps {
  headline?: string
}

export default function InlineCTA({ headline = '¿Listo para conocer a tu equipo?' }: InlineCTAProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <div className="relative py-14 px-6" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="max-w-[700px] mx-auto text-center"
      >
        <div className="rule-gold mx-auto mb-5" />
        <p className="text-white/60 text-base mb-5 font-light">{headline}</p>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-3 rounded-full btn-premium text-sm"
        >
          Agenda tu demo
        </a>
      </motion.div>
    </div>
  )
}
