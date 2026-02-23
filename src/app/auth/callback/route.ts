import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Default redirect to dashboard — may change to /onboarding below
  let redirectPath = '/dashboard';

  // We need to create the response AFTER deciding where to redirect,
  // but cookies need to be set during exchangeCodeForSession.
  // Solution: collect cookies, then set them on the final response.
  const cookiesToApply: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToApply.push(...cookiesToSet);
        },
      },
    }
  );

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !sessionData?.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const user = sessionData.user;

  // Asignar plan "fundador" si es usuario nuevo (sin suscripcion)
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingSub) {
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: user.id,
        plan: 'fundador',
        status: 'active',
        provider: 'manual',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        queries_used: 0,
        queries_limit: null,
      }, { onConflict: 'user_id' });
    }

    // Verificar si tiene onboarding completado
    const { data: config } = await supabaseAdmin
      .from('user_config')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single();

    if (!config?.onboarding_completed) {
      redirectPath = '/onboarding';
    }
  } catch (err) {
    console.error('Error en OAuth callback al asignar plan:', err);
    // No bloquear el login si falla la asignacion de plan
  }

  // Build final response with all session cookies
  const response = NextResponse.redirect(`${origin}${redirectPath}`);
  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Record<string, string>);
  });

  return response;
}
