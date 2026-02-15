import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

// Admin Supabase client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider');

  if (provider === 'mercadopago') {
    return handleMercadoPago(request);
  }

  return handleStripe(request);
}

async function handleStripe(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            plan,
            status: 'active',
            provider: 'stripe',
            provider_subscription_id: session.subscription as string,
            provider_customer_id: session.customer as string,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            queries_used: 0,
            queries_limit: plan === 'inicial' ? 20 : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          // Get period dates from the first item
          const item = subscription.items?.data?.[0];
          const periodStart = item?.current_period_start
            ? new Date(item.current_period_start * 1000).toISOString()
            : new Date().toISOString();
          const periodEnd = item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await supabaseAdmin.from('subscriptions').update({
            status: subscription.status === 'active' ? 'active' :
                    subscription.status === 'trialing' ? 'trialing' :
                    subscription.status === 'past_due' ? 'past_due' : 'inactive',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseAdmin.from('subscriptions').update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription || invoice.parent?.subscription_details?.subscription;

        if (subscriptionId) {
          await supabaseAdmin.from('subscriptions').update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          }).eq('provider_subscription_id', String(subscriptionId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleMercadoPago(request: NextRequest) {
  try {
    const body = await request.json();
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!mpAccessToken) {
      return NextResponse.json({ error: 'MP not configured' }, { status: 503 });
    }

    // Only process payment notifications
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    // Get payment details from Mercado Pago
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
      headers: { 'Authorization': `Bearer ${mpAccessToken}` },
    });
    const payment = await paymentRes.json();

    if (payment.status === 'approved') {
      const externalRef = JSON.parse(payment.external_reference || '{}');
      const { user_id, plan } = externalRef;

      if (user_id && plan) {
        await supabaseAdmin.from('subscriptions').upsert({
          user_id,
          plan,
          status: 'active',
          provider: 'mercadopago',
          provider_subscription_id: String(payment.id),
          provider_customer_id: String(payment.payer?.id || ''),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          queries_used: 0,
          queries_limit: plan === 'inicial' ? 20 : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
