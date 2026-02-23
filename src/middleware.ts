import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

// Rutas que requieren autenticación + suscripción activa
const paidPaths = ['/dashboard', '/onboarding', '/settings', '/api/ares', '/api/config', '/api/conversations', '/api/uploads'];

// Rutas que requieren autenticación pero NO suscripción
const authOnlyPaths = ['/checkout'];

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

  // Redirect authenticated users from /login to appropriate page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    // Check subscription to decide where to send them
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
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
      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();

      const hasActiveSub = sub && ['active', 'trialing'].includes(sub.status);

      if (!hasActiveSub) {
        // For API routes, return 402 instead of redirect
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Suscripción requerida', code: 'SUBSCRIPTION_REQUIRED' },
            { status: 402 }
          );
        }
        // For pages, redirect to checkout
        const url = request.nextUrl.clone();
        url.pathname = '/checkout';
        return NextResponse.redirect(url);
      }
    } catch {
      // If subscription check fails, redirect to checkout for safety
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
