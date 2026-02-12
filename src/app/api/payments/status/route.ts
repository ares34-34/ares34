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

    // If no subscription, check if user is in trial period (5 days from creation)
    if (!subscription) {
      const userCreated = new Date(user.created_at);
      const trialEnd = new Date(userCreated.getTime() + 5 * 24 * 60 * 60 * 1000);
      const isInTrial = new Date() < trialEnd;
      const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

      return NextResponse.json({
        success: true,
        data: {
          plan: 'trial',
          status: isInTrial ? 'trialing' : 'inactive',
          trial_ends_at: trialEnd.toISOString(),
          days_left: daysLeft,
          queries_used: 0,
          queries_limit: 20,
          is_active: isInTrial,
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
