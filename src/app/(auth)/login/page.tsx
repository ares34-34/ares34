'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type Mode = 'login' | 'register' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'bg-white/10', label: '' };
    if (password.length < 6) return { width: '33%', color: 'bg-red-500', label: 'Débil' };
    if (password.length < 10) return { width: '66%', color: 'bg-orange-500', label: 'Regular' };
    return { width: '100%', color: 'bg-green-500', label: 'Fuerte' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-4 shadow-[0_0_40px_rgba(255,255,255,0.08)]">
            <span className="text-black text-xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ARES34</h1>
          <p className="text-white/60 text-sm mt-2">
            Tu sistema de inteligencia ejecutiva
          </p>
        </div>

        {/* Reset password mode */}
        {mode === 'reset' ? (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white/80 transition-colors mb-6 cursor-pointer"
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
                  Te enviamos un enlace a <span className="text-white/90">{email}</span> para que cambies tu contraseña.
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
                    <label htmlFor="reset-email" className="text-sm text-white/80">
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
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.15] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors appearance-none"
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
            <div className="flex gap-1 p-1 mb-6 rounded-xl bg-white/[0.04] border border-white/[0.10]">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white/80'
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
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            {/* Form card */}
            <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-8">
              {mode === 'register' && (
                <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-blue-500/8 border border-blue-500/15">
                  <span className="text-blue-400 text-xs">●</span>
                  <p className="text-blue-300/70 text-xs">
                    Prueba gratis 5 días — sin tarjeta de crédito
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field (only for register) */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm text-white/80">
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
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.15] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors appearance-none"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-white/80">
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
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.15] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm text-white/80">
                      Contraseña
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors cursor-pointer"
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
                      className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.04] border border-white/[0.15] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength bar (register only) */}
                  {mode === 'register' && password.length > 0 && (
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className={`text-xs ${
                        strength.label === 'Débil' ? 'text-red-400/70' :
                        strength.label === 'Regular' ? 'text-orange-400/70' :
                        'text-green-400/70'
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
                    : (mode === 'register' ? 'Crear cuenta gratis' : 'Entrar')}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Footer text */}
        <p className="text-center text-white/50 text-xs mt-6">
          Al usar ARES34 aceptas nuestros términos de servicio.
        </p>
      </div>
    </div>
  );
}
