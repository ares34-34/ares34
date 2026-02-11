'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1929] to-[#0F2440]" />

      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
          animation: 'heroGradientShift 15s ease-in-out infinite',
        }}
      />

      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right circle */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-[0.04]"
          style={{
            background:
              'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          }}
        />
        {/* Bottom-left circle */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{
            background:
              'radial-gradient(circle, #7C3AED 0%, transparent 70%)',
          }}
        />
        {/* Center-left small circle */}
        <div
          className="absolute top-1/3 left-[10%] w-48 h-48 rounded-full border border-white/[0.04]"
          style={{
            animation: 'heroPulse 8s ease-in-out infinite',
          }}
        />
        {/* Right mid decorative ring */}
        <div
          className="absolute top-1/2 right-[15%] w-32 h-32 rounded-full border border-[#2563EB]/[0.08]"
          style={{
            animation: 'heroPulse 10s ease-in-out infinite 2s',
          }}
        />
        {/* Small diamond shape top-left */}
        <div
          className="absolute top-[20%] left-[25%] w-4 h-4 rotate-45 bg-[#2563EB]/[0.08] rounded-sm"
          style={{
            animation: 'heroPulse 6s ease-in-out infinite 1s',
          }}
        />
        {/* Small diamond shape bottom-right */}
        <div
          className="absolute bottom-[30%] right-[20%] w-3 h-3 rotate-45 bg-[#7C3AED]/[0.1] rounded-sm"
          style={{
            animation: 'heroPulse 7s ease-in-out infinite 3s',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pt-16"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Badge */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 mb-6">
            Inteligencia Ejecutiva con IA
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Gobernanza Corporativa{' '}
          <br className="hidden sm:block" />
          <span className="text-[#2563EB]">en tu MacBook</span>
        </motion.h1>

        {/* Subheader */}
        <motion.p
          className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10 leading-relaxed"
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          16 agentes de IA deliberan tus decisiones de negocio como un Fortune
          500 Board &mdash; disponible bajo demanda para fundadores de PyMEs en
          México.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10"
        >
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#2563EB] text-white text-lg font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-[#2563EB]/30 hover:scale-105 active:scale-95"
          >
            Comienza Gratis Ahora
          </Link>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-[#9CA3AF]/70 italic text-sm max-w-lg mx-auto">
            &ldquo;Tomé mejores decisiones en 1 mes que en todo el año
            anterior.&rdquo;{' '}
            <span className="not-italic text-[#9CA3AF]/50">
              &mdash; Carlos M., Fundador SaaS
            </span>
          </p>
        </motion.div>
      </motion.div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes heroGradientShift {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          33% {
            transform: scale(1.1) rotate(1deg);
          }
          66% {
            transform: scale(0.95) rotate(-1deg);
          }
        }
        @keyframes heroPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
      `}</style>
    </section>
  )
}
