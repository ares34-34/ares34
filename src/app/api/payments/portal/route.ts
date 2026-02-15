import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get customer ID from subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('provider_customer_id, provider')
      .eq('user_id', user.id)
      .single();

    if (!subscription || subscription.provider !== 'stripe' || !subscription.provider_customer_id) {
      return NextResponse.json({
        error: 'No tienes una suscripción activa de Stripe',
      }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ares34-mvp.vercel.app';

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.provider_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({
      error: 'Error al abrir el portal de facturación',
    }, { status: 500 });
  }
}
