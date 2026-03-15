'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type Mode = 'login' | 'register' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Handle URL error params (e.g., from disabled OAuth callback)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'oauth_disabled') {
      setError('El inicio de sesión con Google ya no está disponible. Usa tu correo y contraseña.');
    } else if (urlError === 'tenant_suspended') {
      setError('Tu organización está suspendida. Contacta a tu administrador.');
    } else if (urlError === 'user_suspended') {
      setError('Tu cuenta está suspendida. Contacta a tu administrador.');
    }

    // Check if URL says to show register
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Escribe tu correo electrónico');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError('No pudimos enviar el correo. Verifica tu email e inténtalo de nuevo.');
      } else {
        setResetSent(true);
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Correo o contraseña incorrectos');
        setLoading(false);
        return;
      }

      const status = data.data;

      if (status.must_change_password) {
        router.push('/change-password');
        return;
      }

      // If access not granted, go to access code page
      if (!status.access_granted) {
        router.push('/access-code');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'No pudimos crear tu cuenta');
        setLoading(false);
        return;
      }

      // Signup successful — redirect to access code page
      router.push('/access-code');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic cloud background — same as landing */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="dynamic-bg-mesh" />
        <div className="cloud-layer-1" />
        <div className="cloud-layer-2" />
        <div className="cloud-layer-3" />
        <div className="cloud-layer-4" />
        <div className="cloud-layer-5" />
        <div className="cloud-layer-6" />
        <div className="dynamic-bg-noise" />
        {/* Darker overlay for readability on login */}
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
            Tu sistema de inteligencia ejecutiva
          </p>
        </div>

        {/* Reset password mode */}
        {mode === 'reset' ? (
          <div className="border border-white/[0.12] bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/50">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </button>

            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-400 text-lg">✓</span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Revisa tu correo</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Te enviamos un enlace a <span className="text-white font-medium">{email}</span> para que cambies tu contraseña.
                </p>
                <p className="text-white/50 text-xs mt-4">
                  ¿No lo ves? Revisa tu carpeta de spam.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-white mb-1">Recuperar contraseña</h2>
                <p className="text-white/60 text-sm mb-6">
                  Te enviaremos un correo con un enlace para crear una nueva contraseña.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="text-sm text-white/80 font-medium">
                      Correo electrónico
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
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
                    disabled={loading || !email}
                    className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Form card — login/register tabs */}
            <div className="border border-white/[0.12] bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/50">
              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-white/[0.04] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white/[0.10] text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white/[0.10] text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-white/80 font-medium">
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
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm text-white/80 font-medium">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                      >
                        ¿La olvidaste?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="reg-name" className="text-sm text-white/80 font-medium">
                      Nombre
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reg-email" className="text-sm text-white/80 font-medium">
                      Correo electrónico
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="text-sm text-white/80 font-medium">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* Footer text */}
        <p className="text-center text-white/40 text-xs mt-6">
          Al usar ARES34 aceptas nuestros{' '}
          <Link href="/terms" className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">
            términos
          </Link>
          {' '}y{' '}
          <Link href="/privacy" className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">
            privacidad
          </Link>.
        </p>
      </div>
    </div>
  );
}
