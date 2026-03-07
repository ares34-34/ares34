'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { CALENDLY_URL } from '@/lib/constants'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.05]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo — premium serif */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#C9A962] to-[#A68B4B] flex items-center justify-center">
              <span className="text-black text-sm font-bold leading-none font-serif">A</span>
            </div>
            <span className="text-white text-sm font-medium tracking-[0.2em] uppercase">
              ARES34
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="#equipo"
              className="text-white/50 hover:text-white transition-colors duration-300 text-[13px] tracking-wide"
            >
              Tu equipo
            </a>
            <a
              href="#como-funciona"
              className="text-white/50 hover:text-white transition-colors duration-300 text-[13px] tracking-wide"
            >
              Cómo funciona
            </a>
            <a
              href="#plataforma"
              className="text-white/50 hover:text-white transition-colors duration-300 text-[13px] tracking-wide"
            >
              Plataforma
            </a>
            <a
              href="#seguridad"
              className="text-white/50 hover:text-white transition-colors duration-300 text-[13px] tracking-wide"
            >
              Seguridad
            </a>
            <a
              href="#precios"
              className="text-white/50 hover:text-white transition-colors duration-300 text-[13px] tracking-wide"
            >
              Precios
            </a>
            <div className="w-px h-4 bg-white/10" />
            <Link
              href="/login"
              className="text-white/50 hover:text-white transition-colors duration-300 text-[13px] tracking-wide"
            >
              Iniciar sesión
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full btn-premium text-[13px]"
            >
              Agenda tu demo
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.06]"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              <a
                href="#equipo"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tu equipo
              </a>
              <a
                href="#como-funciona"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cómo funciona
              </a>
              <a
                href="#plataforma"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plataforma
              </a>
              <a
                href="#seguridad"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Seguridad
              </a>
              <a
                href="#precios"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Precios
              </a>
              <div className="separator-premium my-1" />
              <Link
                href="/login"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full btn-premium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Agenda tu demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
