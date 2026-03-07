'use client'

import Link from 'next/link'

import { CALENDLY_URL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="w-full bg-black">
      <div className="separator-premium" />
      <div className="max-w-[1200px] mx-auto px-6">
        {/* CTA final */}
        <div className="py-20 text-center">
          <div className="rule-gold mx-auto mb-6" />
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Deja de decidir solo
          </h3>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto leading-relaxed font-light">
            12 entidades. 7 módulos. $9,999 MXN/mes.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full btn-premium text-sm"
          >
            Agenda tu demo
          </a>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <span className="text-white/70 text-sm font-medium tracking-[0.2em] uppercase">
            ARES34
          </span>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-white/35 text-xs hover:text-white/60 transition-colors duration-300"
            >
              Privacidad
            </Link>
            <span className="text-white/20">&middot;</span>
            <Link
              href="/terms"
              className="text-white/35 text-xs hover:text-white/60 transition-colors duration-300"
            >
              Términos
            </Link>
          </div>

          {/* Copyright */}
          <span className="text-white/25 text-xs">
            &copy; 2026 ARES34 | Descúbrete+
          </span>
        </div>
      </div>
    </footer>
  )
}
