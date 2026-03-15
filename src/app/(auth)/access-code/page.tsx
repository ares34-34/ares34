'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AccessCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Código incorrecto');
        setLoading(false);
        return;
      }

      // Access granted — go to dashboard
      router.push('/dashboard');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic cloud background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="dynamic-bg-mesh" />
        <div className="cloud-layer-1" />
        <div className="cloud-layer-2" />
        <div className="cloud-layer-3" />
        <div className="cloud-layer-4" />
        <div className="cloud-layer-5" />
        <div className="cloud-layer-6" />
        <div className="dynamic-bg-noise" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-4 login-logo-glow">
              <span className="text-black text-xl font-bold">A</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-wide">ARES34</h1>
          <p className="text-white/70 text-sm mt-2">
            Código de acceso
          </p>
        </div>

        {/* Form card */}
        <div className="border border-white/[0.12] bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Ingresa tu código</h2>
              <p className="text-white/50 text-xs">Proporcionado por tu contacto en ARES34</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="access-code" className="text-sm text-white/80 font-medium">
                Código de acceso
              </label>
              <input
                id="access-code"
                type="text"
                placeholder="Escribe tu código aquí"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          ¿No tienes código?{' '}
          <a
            href="mailto:contacto@ares34.com"
            className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors"
          >
            Contacta a ventas
          </a>
        </p>
      </div>
    </div>
  );
}
