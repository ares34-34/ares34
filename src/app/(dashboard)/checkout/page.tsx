'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2, Check, Shield, Sparkles, Users, MessageCircle,
  Clock, ArrowRight, CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const PLAN_FEATURES = [
  { icon: <Users className="h-4 w-4" />, text: 'CEO Virtual + 5 directores + 3 inversionistas' },
  { icon: <MessageCircle className="h-4 w-4" />, text: 'Consultas ilimitadas' },
  { icon: <Clock className="h-4 w-4" />, text: 'Plataforma web 24/7' },
  { icon: <Sparkles className="h-4 w-4" />, text: 'Historial de todas tus deliberaciones' },
  { icon: <Shield className="h-4 w-4" />, text: 'Garantía 30 días — sin preguntas' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const paymentStatus = searchParams.get('payment');

  // Check if user already has active subscription
  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch('/api/payments/status');
        const data = await res.json();

        if (data.success && data.data?.is_active) {
          // Already has active subscription — check onboarding
          const configRes = await fetch('/api/config');
          const configData = await configRes.json();

          if (!configData.data?.onboarding_completed) {
            router.replace('/onboarding');
          } else {
            router.replace('/dashboard');
          }
          return;
        }
      } catch {
        // If check fails, show checkout page anyway
      }
      setCheckingStatus(false);
    }

    if (paymentStatus === 'success') {
      // Payment just completed — wait a moment for webhook, then redirect
      toast.success('¡Pago exitoso! Bienvenido a ARES34');
      setTimeout(() => {
        router.replace('/onboarding');
      }, 2000);
    } else if (paymentStatus === 'canceled') {
      setCheckingStatus(false);
      toast.error('Pago cancelado. Puedes intentar de nuevo cuando quieras.');
    } else {
      checkSubscription();
    }
  }, [paymentStatus, router]);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'fundador', provider: 'stripe' }),
      });
      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Error al iniciar el pago');
        setLoading(false);
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  // Show loading while checking subscription status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center app-ambient-bg">
        <div className="app-glow-1" />
        <div className="app-glow-2" />
        <div className="app-glow-3" />
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400 relative z-10" />
      </div>
    );
  }

  // Payment success state
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 app-ambient-bg">
        <div className="app-glow-1" />
        <div className="app-glow-2" />
        <div className="app-glow-3" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Pago exitoso!</h1>
          <p className="text-white/60 text-sm mb-4">Preparando tu onboarding...</p>
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-3 sm:px-4 py-8 app-ambient-bg">
      <div className="app-glow-1" />
      <div className="app-glow-2" />
      <div className="app-glow-3" />
      <div className="app-grid-subtle" />
      <div className="app-orb app-orb-1" />
      <div className="app-orb app-orb-2" />
      <div className="app-orb app-orb-3" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-4">
            <span className="text-black text-xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ARES34</h1>
          <p className="text-white/50 text-sm mt-2">
            Tu consejo de administración potenciado por IA
          </p>
        </div>

        {/* Plan card */}
        <div className="border border-white/[0.12] bg-white/[0.03] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-white">Plan Fundador</h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                Primeros 50
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-4xl font-bold text-white">$99</span>
              <span className="text-white/50 text-sm">USD / mes</span>
            </div>
            <p className="text-white/40 text-xs mt-2">
              CEO Virtual + Consejo Directivo + Junta de Inversionistas
            </p>
          </div>

          {/* Separator */}
          <div className="h-px bg-white/[0.08] mx-6 sm:mx-8" />

          {/* Features */}
          <div className="px-6 sm:px-8 py-5 space-y-3.5">
            {PLAN_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  {feature.icon}
                </div>
                <span className="text-sm text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px bg-white/[0.08] mx-6 sm:mx-8" />

          {/* CTA */}
          <div className="px-6 sm:px-8 py-6">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando con Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Activar plan — $99 USD/mes
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                <Shield className="h-3 w-3" />
                <span>Pago seguro con Stripe</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                <ArrowRight className="h-3 w-3" />
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee note */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-xs leading-relaxed">
            Garantía de 30 días — si no te convence, te devolvemos tu dinero sin preguntas.
          </p>
        </div>

        {/* Back to landing */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white/30 text-xs hover:text-white/60 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
