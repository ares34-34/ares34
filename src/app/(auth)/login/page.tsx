'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient();

      if (mode === 'register') {
        if (!name.trim()) {
          setError('Escribe tu nombre para continuar');
          setLoading(false);
          return;
        }

        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name.trim() }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok || !signupData.success) {
          setError(signupData.error || 'Error al crear la cuenta.');
          setLoading(false);
          return;
        }

        // Auto-login after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError('Cuenta creada. Inicia sesión con tus credenciales.');
          setMode('login');
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError('Correo o contraseña incorrectos');
          setLoading(false);
          return;
        }
      }

      // Check if onboarding is complete
      const res = await fetch('/api/config');
      const configData = await res.json();

      if (!configData.data || !configData.data.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError(mode === 'register' ? 'Error al crear la cuenta' : 'Correo o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white mb-4">
            <span className="text-black text-lg font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ARES34</h1>
          <p className="text-white/25 text-sm mt-2">
            Tu sistema de inteligencia ejecutiva
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 mb-6 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-black'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-black'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Form card */}
        <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-8">
          {mode === 'register' && (
            <p className="text-white/20 text-xs mb-6">
              Prueba gratis 5 días. Sin tarjeta de crédito.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (only for register) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm text-white/40">
                  Tu nombre
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Cómo te llamas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === 'register'}
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-white/40">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-white/40">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
              {mode === 'register' && password.length > 0 && password.length < 6 && (
                <p className="text-xs text-orange-400/70">Faltan {6 - password.length} caracteres</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password || (mode === 'register' && !name.trim())}
              className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? (mode === 'register' ? 'Creando tu cuenta...' : 'Entrando...')
                : (mode === 'register' ? 'Crear cuenta gratis' : 'Entrar')}
            </button>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-white/10 text-xs mt-6">
          Al crear tu cuenta aceptas nuestros términos de servicio.
        </p>
      </div>
    </div>
  );
}
