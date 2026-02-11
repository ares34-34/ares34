'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#09090b] border-t border-white/[0.06]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <span className="text-white/40 text-sm font-medium tracking-wide">
            ARES34
          </span>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-white/20 text-xs hover:text-white/40 transition-colors duration-200"
            >
              Privacidad
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="#"
              className="text-white/20 text-xs hover:text-white/40 transition-colors duration-200"
            >
              Terminos
            </Link>
          </div>

          {/* Copyright */}
          <span className="text-white/15 text-xs">
            &copy; 2026
          </span>
        </div>
      </div>
    </footer>
  )
}
