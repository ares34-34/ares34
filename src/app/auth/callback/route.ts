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

  // Verificar suscripción y onboarding para decidir redirect
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verificar si tiene suscripción activa
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    const hasActiveSub = existingSub && ['active', 'trialing'].includes(existingSub.status);

    if (!hasActiveSub) {
      // Sin pago → checkout obligatorio
      redirectPath = '/checkout';
    } else {
      // Con pago → verificar onboarding
      const { data: config } = await supabaseAdmin
        .from('user_config')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (!config?.onboarding_completed) {
        redirectPath = '/onboarding';
      }
    }
  } catch (err) {
    console.error('Error en OAuth callback:', err);
    // Si falla la verificación, mandar a checkout por seguridad
    redirectPath = '/checkout';
  }

  // Build final response with all session cookies
  const response = NextResponse.redirect(`${origin}${redirectPath}`);
  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Record<string, string>);
  });

  return response;
}
