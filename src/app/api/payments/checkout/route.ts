import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getStripe, PLANS, PlanId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { plan, provider = 'stripe' } = await request.json();

    if (!plan || !PLANS[plan as PlanId]) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as PlanId];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ares34.com';

    if (provider === 'stripe') {
      // Create Stripe Checkout Session
      const session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          plan: plan,
        },
        line_items: [
          {
            price_data: {
              currency: selectedPlan.currency,
              product_data: {
                name: `ARES34 — Plan ${selectedPlan.name}`,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.price,
              recurring: {
                interval: selectedPlan.interval,
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan: plan,
          },
        },
        success_url: `${appUrl}/dashboard?payment=success&plan=${plan}`,
        cancel_url: `${appUrl}/dashboard?payment=canceled`,
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        provider: 'stripe',
      });
    } else if (provider === 'mercadopago') {
      // Mercado Pago Checkout
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!mpAccessToken || mpAccessToken === 'TEST-PLACEHOLDER') {
        return NextResponse.json({
          error: 'Mercado Pago no está configurado todavía. Usa Stripe por ahora.',
        }, { status: 503 });
      }

      const preference = {
        items: [
          {
            title: `ARES34 — Plan ${selectedPlan.name}`,
            description: selectedPlan.description,
            quantity: 1,
            currency_id: 'MXN',
            unit_price: selectedPlan.price / 100, // MP usa pesos, no centavos
          },
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `${appUrl}/dashboard?payment=success&plan=${plan}&provider=mercadopago`,
          failure: `${appUrl}/dashboard?payment=failed`,
          pending: `${appUrl}/dashboard?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: JSON.stringify({ user_id: user.id, plan }),
        notification_url: `${appUrl}/api/payments/webhook?provider=mercadopago`,
      };

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify(preference),
      });

      const mpData = await mpRes.json();

      if (!mpRes.ok) {
        return NextResponse.json({
          error: 'Error al crear la sesión de pago con Mercado Pago',
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: mpData.init_point,
        provider: 'mercadopago',
      });
    }

    return NextResponse.json({ error: 'Proveedor de pago no válido' }, { status: 400 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errType = error instanceof Error ? error.constructor.name : typeof error;
    console.error('Error en checkout:', errMsg, 'Type:', errType, 'Full:', error);
    return NextResponse.json({
      error: 'Error al crear la sesión de pago',
      detail: errMsg,
      type: errType,
    }, { status: 500 });
  }
}
