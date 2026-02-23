import Stripe from 'stripe';

// Stripe instance (server-side only, lazy init to avoid crash when key is PLACEHOLDER)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes('PLACEHOLDER')) {
      throw new Error('Stripe no está configurado. Agrega STRIPE_SECRET_KEY en las variables de entorno.');
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// Single founder plan — $99 USD/month
export const PLANS = {
  fundador: {
    name: 'Fundador',
    price: 99_00, // $99 USD in cents
    currency: 'usd',
    interval: 'month' as const,
    queriesLimit: null, // unlimited
    description: 'CEO Virtual + Consejo Directivo + Junta de Inversionistas',
    features: [
      'CEO Virtual + 5 directores + 3 inversionistas',
      'Consultas ilimitadas',
      'Plataforma web 24/7',
      'Historial de todas tus deliberaciones',
      'WhatsApp directo',
      'Garantía 30 días',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
