import Stripe from 'stripe';

// Stripe instance (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Plan configuration matching landing page pricing
export const PLANS = {
  inicial: {
    name: 'Inicial',
    price: 99_00, // $99 MXN in centavos
    currency: 'mxn',
    interval: 'month' as const,
    queriesLimit: 20,
    description: 'Para probar si mejora tus decisiones',
    features: [
      'CEO + Consejo + Junta completos',
      '20 consultas al mes',
      'Plataforma web',
      'Historial de deliberaciones',
    ],
  },
  pro: {
    name: 'Pro',
    price: 149_00, // $149 MXN
    currency: 'mxn',
    interval: 'month' as const,
    queriesLimit: null, // unlimited
    description: 'Para decisiones urgentes que no pueden esperar',
    features: [
      'Todo lo del plan Inicial',
      'Consultas ilimitadas',
      'WhatsApp directo',
      'Email directo',
      'Respuestas más rápidas',
    ],
  },
  empresarial: {
    name: 'Empresarial',
    price: 499_00, // $499 MXN
    currency: 'mxn',
    interval: 'month' as const,
    queriesLimit: null,
    description: 'Si tienes varios negocios o eres inversionista',
    features: [
      'Todo lo del plan Pro',
      'Varios negocios',
      'Miembros ilimitados',
      'Integraciones',
      'Soporte dedicado',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
