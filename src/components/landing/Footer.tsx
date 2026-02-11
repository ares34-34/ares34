'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#060E1A] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left: Logo + Tagline */}
          <div>
            <span className="text-2xl font-bold text-[#2563EB] tracking-tight">
              ARES34
            </span>
            <p className="text-[#9CA3AF] text-sm mt-2 max-w-xs">
              Inteligencia ejecutiva para fundadores de PyMEs en México
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-[#9CA3AF] text-sm hover:text-white transition-colors duration-200"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-[#9CA3AF] text-sm hover:text-white transition-colors duration-200"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-[#9CA3AF] text-sm hover:text-white transition-colors duration-200"
            >
              LinkedIn
            </Link>
          </div>

          {/* Right: Contact */}
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-sm">Preguntas?</span>
            <Link
              href="#"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors duration-200"
            >
              Hablemos
            </Link>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-white/5" />

        {/* Bottom Row */}
        <div className="py-6 text-center">
          <p className="text-[#9CA3AF]/60 text-xs">
            &copy; 2026 ARES34. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
