'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* CTA final */}
        <div className="py-20 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Deja de decidir solo
          </h3>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            9 directores trabajando para ti. $99 USD/mes.
            30 días de garantía completa.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors duration-200"
          >
            Empieza hoy — Garantía 30 días
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <span className="text-white text-sm font-medium tracking-wide">
            ARES34
          </span>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-white text-xs hover:text-white transition-colors duration-200"
            >
              Privacidad
            </Link>
            <span className="text-white/70">&middot;</span>
            <Link
              href="/terms"
              className="text-white text-xs hover:text-white transition-colors duration-200"
            >
              Términos
            </Link>
          </div>

          {/* Copyright */}
          <span className="text-white text-xs">
            &copy; 2026 ARES34
          </span>
        </div>
      </div>
    </footer>
  )
}
