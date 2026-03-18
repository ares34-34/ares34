import Link from 'next/link';
import { Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-[1200px] w-full flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8">
          <span className="font-playfair text-2xl font-bold tracking-tight text-white">
            ARES<span className="text-white/50">34</span>
          </span>
        </div>

        {/* 404 indicator */}
        <div className="mb-6">
          <span className="font-mono text-7xl font-semibold text-white/10">404</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-white mb-3">
          Página no encontrada
        </h1>

        {/* Description */}
        <p className="text-white/60 text-lg max-w-md mb-10">
          La página que buscas no existe o fue movida.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/70 rounded-full px-6 py-3 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
