import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get subscription from DB
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Sin registro de suscripción → dar acceso Fundador (consistente con getSubscriptionStatus)
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          plan: 'fundador',
          status: 'active',
          days_left: null,
          queries_used: 0,
          queries_limit: null,
          is_active: true,
        },
      });
    }

    // Check if subscription is active
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
    const daysLeft = periodEnd ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : null;

    return NextResponse.json({
      success: true,
      data: {
        plan: subscription.plan,
        status: subscription.status,
        provider: subscription.provider,
        current_period_end: subscription.current_period_end,
        days_left: daysLeft,
        queries_used: subscription.queries_used || 0,
        queries_limit: subscription.queries_limit,
        is_active: isActive,
      },
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json({ error: 'Error al obtener estado de suscripción' }, { status: 500 });
  }
}
