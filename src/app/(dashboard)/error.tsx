'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="max-w-[1200px] w-full flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-white/[0.03]">
          <AlertTriangle className="w-8 h-8 text-white/60" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-white mb-3">
          Algo salió mal
        </h1>

        {/* Error message */}
        <p className="text-white/60 text-lg max-w-md mb-2">
          Ocurrió un error inesperado. Intenta de nuevo o regresa al inicio.
        </p>
        {error?.message && (
          <p className="text-white/30 text-sm font-mono max-w-lg mb-10 break-words">
            {error.message.length > 200
              ? error.message.slice(0, 200) + '...'
              : error.message}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/70 rounded-full px-6 py-3 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
