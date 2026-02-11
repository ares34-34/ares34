'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

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
      if (window.innerWidth >= 768) {
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
          ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
              <span className="text-[#09090b] text-sm font-bold leading-none">A</span>
            </div>
            <span className="text-white text-sm font-medium tracking-wide">
              ARES34
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/50 hover:text-white/80 transition-colors duration-200 text-sm"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-white/[0.08] text-white/80 text-sm hover:bg-white/[0.12] transition-colors duration-200 border border-white/[0.06]"
            >
              Comenzar
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
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
            className="md:hidden overflow-hidden bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.06]"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-white/50 hover:text-white/80 transition-colors duration-200 text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar sesion
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white/[0.08] text-white/80 text-sm hover:bg-white/[0.12] transition-colors duration-200 border border-white/[0.06]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comenzar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
