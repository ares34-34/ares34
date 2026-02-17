'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase auto-detects the recovery token from the URL hash
  useEffect(() => {
    const supabase = createBrowserClient();

    // Listen for auth state change (recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if already in a session (user clicked link and already recovered)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'bg-white/10', label: '' };
    if (password.length < 6) return { width: '33%', color: 'bg-red-500', label: 'Débil' };
    if (password.length < 10) return { width: '66%', color: 'bg-orange-500', label: 'Regular' };
    return { width: '100%', color: 'bg-green-500', label: 'Fuerte' };
  };
  const strength = getStrength();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 login-bg">
      {/* Ambient background effects */}
      <div className="login-glow-blue" />
      <div className="login-glow-purple" />
      <div className="login-grid" />
      <div className="login-line-top" />
      <div className="login-line-bottom" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />
      <div className="login-orb login-orb-4" />
      <div className="login-orb login-orb-5" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-4 shadow-[0_0_40px_rgba(255,255,255,0.08)]">
            <span className="text-black text-xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ARES34</h1>
        </div>

        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-lg">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Contraseña actualizada</h2>
              <p className="text-white text-sm">
                Redirigiendo al dashboard...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-4" />
              <p className="text-white text-sm">
                Verificando enlace...
              </p>
              <p className="text-white text-xs mt-4">
                Si esto tarda mucho, el enlace puede haber expirado. <button onClick={() => router.push('/login')} className="text-white underline cursor-pointer">Solicitar otro enlace</button>
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Nueva contraseña</h2>
              <p className="text-white text-sm mb-6">
                Escribe tu nueva contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm text-white">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      autoFocus
                      className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.04] border border-white/[0.15] text-white text-sm placeholder:text-white/70 focus:outline-none focus:border-white/20 transition-colors appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
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

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm text-white">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={`w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border text-white text-sm placeholder:text-white/70 focus:outline-none transition-colors appearance-none ${
                      passwordsMatch ? 'border-green-500/30' :
                      passwordsMismatch ? 'border-red-500/30' :
                      'border-white/[0.08] focus:border-white/20'
                    }`}
                  />
                  {passwordsMismatch && (
                    <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
                  )}
                  {passwordsMatch && (
                    <p className="text-xs text-green-400">✓ Coinciden</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
