'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// ============================================
// Checkout deshabilitado — ARES34 es plataforma privada
// Las suscripciones se gestionan internamente por admin
// ============================================

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white/30" />
    </div>
  );
}
