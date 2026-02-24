'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Check, X, ShieldCheck } from 'lucide-react';

const MIN_PASSWORD_LENGTH = 12;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password requirement checks
  const checks = useMemo(() => ({
    minLength: newPassword.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword),
    passwordsMatch: newPassword.length > 0 && newPassword === confirmPassword,
  }), [newPassword, confirmPassword]);

  const allChecksPassed = checks.minLength && checks.hasUppercase && checks.hasLowercase && checks.hasNumber && checks.hasSymbol && checks.passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allChecksPassed) {
      setError('La nueva contraseña no cumple todos los requisitos');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Error al cambiar la contraseña');
        setLoading(false);
        return;
      }

      // Password changed + session refreshed — redirect based on onboarding status
      if (!data.data?.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const CheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {passed ? (
        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
      ) : (
        <X className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
      )}
      <span className={`text-xs ${passed ? 'text-emerald-400/90' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );

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
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-4 login-logo-glow">
              <span className="text-black text-xl font-bold">A</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-wide">ARES34</h1>
        </div>

        {/* Form card */}
        <div className="border border-white/[0.12] bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cambiar contraseña</h2>
              <p className="text-white/50 text-xs">Tu administrador te asignó una contraseña temporal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current password */}
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm text-white/80 font-medium">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña temporal"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  autoFocus
                  className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-white/[0.08]" />

            {/* New password */}
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm text-white/80 font-medium">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Mínimo 12 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm text-white/80 font-medium">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repite tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all appearance-none"
              />
            </div>

            {/* Password requirements checklist */}
            {newPassword.length > 0 && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] px-4 py-3 space-y-1.5">
                <CheckItem passed={checks.minLength} label={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`} />
                <CheckItem passed={checks.hasUppercase} label="Una letra mayúscula" />
                <CheckItem passed={checks.hasLowercase} label="Una letra minúscula" />
                <CheckItem passed={checks.hasNumber} label="Un número" />
                <CheckItem passed={checks.hasSymbol} label="Un símbolo (!@#$%...)" />
                {confirmPassword.length > 0 && (
                  <CheckItem passed={checks.passwordsMatch} label="Las contraseñas coinciden" />
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !allChecksPassed || !currentPassword}
              className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Esta acción es requerida para acceder a ARES34.
        </p>
      </div>
    </div>
  );
}
