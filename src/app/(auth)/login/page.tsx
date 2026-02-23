'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type Mode = 'login' | 'register' | 'reset';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://ares34.com/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (oauthError) {
        setError('No se pudo conectar con Google. Inténtalo de nuevo.');
        setGoogleLoading(false);
      }
    } catch {
      setError('Error de conexión con Google. Inténtalo de nuevo.');
      setGoogleLoading(false);
    }
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

      // Check subscription status first, then onboarding
      const subRes = await fetch('/api/payments/status');
      const subData = await subRes.json();

      if (!subData.success || !subData.data?.is_active) {
        // No active subscription → must pay first
        router.push('/checkout');
      } else {
        // Has subscription → check onboarding
        const res = await fetch('/api/config');
        const configData = await res.json();

        if (!configData.data || !configData.data.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch {
      setError(mode === 'register' ? 'Error al crear la cuenta' : 'Correo o contraseña incorrectos');
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'bg-white/10', label: '' };
    if (password.length < 6) return { width: '33%', color: 'bg-red-500', label: 'Débil' };
    if (password.length < 10) return { width: '66%', color: 'bg-orange-500', label: 'Regular' };
    return { width: '100%', color: 'bg-green-500', label: 'Fuerte' };
  };

  const strength = getPasswordStrength();

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
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 mb-6 rounded-xl bg-white/[0.06] border border-white/[0.10] backdrop-blur-sm">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            {/* Form card */}
            <div className="border border-white/[0.12] bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/50">
              {mode === 'register' && (
                <div className="flex items-center gap-2 mb-6 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-400 text-xs">●</span>
                  <p className="text-emerald-300/90 text-xs font-medium">
                    $99 USD/mes — Garantía 30 días
                  </p>
                </div>
              )}

              {/* Google OAuth button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full py-2.5 rounded-full border border-white/[0.15] bg-white/[0.06] text-white text-sm font-medium hover:bg-white/[0.12] hover:border-white/[0.25] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                {googleLoading ? 'Conectando...' : 'Continuar con Google'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.10]" />
                <span className="text-xs text-white/40">o</span>
                <div className="flex-1 h-px bg-white/[0.10]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field (only for register) */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm text-white/80 font-medium">
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
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                    />
                  </div>
                )}

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
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm text-white/80 font-medium">
                      Contraseña
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                      >
                        ¿La olvidaste?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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
                  {/* Password strength bar (register only) */}
                  {mode === 'register' && password.length > 0 && (
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className={`text-xs ${
                        strength.label === 'Débil' ? 'text-red-400' :
                        strength.label === 'Regular' ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {strength.label}
                      </p>
                    </div>
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
                  className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading
                    ? (mode === 'register' ? 'Creando tu cuenta...' : 'Entrando...')
                    : (mode === 'register' ? 'Empieza hoy — Garantía 30 días' : 'Entrar')}
                </button>
              </form>
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
