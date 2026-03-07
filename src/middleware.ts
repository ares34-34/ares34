import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

// Rutas que requieren autenticación + suscripción activa
const paidPaths = [
  '/dashboard', '/onboarding', '/settings',
  '/brief', '/pulse', '/scenarios', '/compliance', '/prep', '/calendar',
  '/api/ares', '/api/config', '/api/conversations', '/api/uploads',
  '/api/brief', '/api/pulse', '/api/scenarios', '/api/compliance', '/api/contracts', '/api/prep', '/api/calendar',
];

// Rutas que requieren autenticación pero NO suscripción
const authOnlyPaths = ['/checkout', '/change-password'];

// Todas las rutas protegidas (auth requerida)
const protectedPaths = [...paidPaths, ...authOnlyPaths];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Allow auth routes (API + OAuth callback), webhooks, and payment APIs without checks
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/payments/')
  ) {
    return supabaseResponse;
  }

  // Check if this is a protected path
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // For authenticated users, check tenant status on protected routes
  if (user && isProtected) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check tenant_user status
      const { data: tenantUser } = await supabaseAdmin
        .from('tenant_users')
        .select('tenant_id, status, must_change_password')
        .eq('user_id', user.id)
        .single();

      if (tenantUser) {
        // Check tenant status
        const { data: tenant } = await supabaseAdmin
          .from('tenants')
          .select('status')
          .eq('id', tenantUser.tenant_id)
          .single();

        // Tenant suspended/cancelled — block access
        if (tenant && tenant.status !== 'active') {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: 'Organización suspendida', code: 'TENANT_SUSPENDED' },
              { status: 403 }
            );
          }
          // Sign out and redirect to login
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.searchParams.set('error', 'tenant_suspended');
          return NextResponse.redirect(url);
        }

        // User suspended/deactivated — block access
        if (tenantUser.status !== 'active') {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: 'Cuenta suspendida', code: 'USER_SUSPENDED' },
              { status: 403 }
            );
          }
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.searchParams.set('error', 'user_suspended');
          return NextResponse.redirect(url);
        }

        // Must change password — redirect to /change-password
        // (only if not already on /change-password or an API route)
        if (tenantUser.must_change_password && !pathname.startsWith('/change-password') && !pathname.startsWith('/api/')) {
          const url = request.nextUrl.clone();
          url.pathname = '/change-password';
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // If tenant check fails, continue — don't block existing users
    }
  }

  // Redirect authenticated users from /login to appropriate page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check must_change_password first
      const { data: tenantUser } = await supabaseAdmin
        .from('tenant_users')
        .select('must_change_password')
        .eq('user_id', user.id)
        .single();

      if (tenantUser?.must_change_password) {
        url.pathname = '/change-password';
        return NextResponse.redirect(url);
      }

      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();

      const hasActiveSub = sub && ['active', 'trialing'].includes(sub.status);
      url.pathname = hasActiveSub ? '/dashboard' : '/checkout';
    } catch {
      url.pathname = '/checkout';
    }
    return NextResponse.redirect(url);
  }

  // Payment gate: check subscription for paid paths
  if (user && paidPaths.some(p => pathname.startsWith(p))) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check subscription by tenant_id first, fallback to user_id
      const { data: tenantUser } = await supabaseAdmin
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      let hasActiveSub = false;

      if (tenantUser?.tenant_id) {
        // Enterprise: check subscription by tenant
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('status')
          .eq('tenant_id', tenantUser.tenant_id)
          .in('status', ['active', 'trialing'])
          .limit(1)
          .single();

        hasActiveSub = !!sub;
      }

      if (!hasActiveSub) {
        // Fallback: legacy check by user_id
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .single();

        hasActiveSub = !!sub && ['active', 'trialing'].includes(sub.status);
      }

      if (!hasActiveSub) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Suscripción requerida', code: 'SUBSCRIPTION_REQUIRED' },
            { status: 402 }
          );
        }
        const url = request.nextUrl.clone();
        url.pathname = '/checkout';
        return NextResponse.redirect(url);
      }
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Error al verificar suscripción', code: 'SUBSCRIPTION_CHECK_FAILED' },
          { status: 500 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/checkout';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
