import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================
// POST /api/auth/login
// Server-side login with rate limiting + account lock
// - 5 failed attempts → 15 min lock
// - All attempts logged to auth_logs
// - Returns enterprise status (must_change_password, etc.)
// ============================================

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get IP and user agent for logging
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Look up user by email to check lock status BEFORE attempting auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === email);

    if (authUser) {
      // Check tenant_users for lock status
      const { data: tenantUser } = await supabaseAdmin
        .from('tenant_users')
        .select('failed_login_attempts, locked_until, status, must_change_password, tenant_id')
        .eq('user_id', authUser.id)
        .single();

      if (tenantUser) {
        // Check if account is locked
        if (tenantUser.locked_until) {
          const lockExpiry = new Date(tenantUser.locked_until);
          if (lockExpiry > new Date()) {
            const minutesLeft = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000);

            // Log blocked attempt
            await supabaseAdmin.from('auth_logs').insert({
              user_id: authUser.id,
              email,
              event_type: 'login_blocked_locked',
              ip_address: ip,
              user_agent: userAgent,
              metadata: { locked_until: tenantUser.locked_until, minutes_left: minutesLeft },
            });

            return NextResponse.json(
              {
                success: false,
                error: `Tu cuenta está temporalmente bloqueada. Inténtalo en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}.`,
                code: 'ACCOUNT_LOCKED',
                locked_until: tenantUser.locked_until,
              },
              { status: 429 }
            );
          } else {
            // Lock expired — reset
            await supabaseAdmin
              .from('tenant_users')
              .update({ locked_until: null, failed_login_attempts: 0 })
              .eq('user_id', authUser.id);
          }
        }

        // Check if user is suspended
        if (tenantUser.status === 'suspended' || tenantUser.status === 'deactivated') {
          await supabaseAdmin.from('auth_logs').insert({
            user_id: authUser.id,
            email,
            event_type: 'login_blocked_suspended',
            ip_address: ip,
            user_agent: userAgent,
            metadata: { user_status: tenantUser.status },
          });

          return NextResponse.json(
            { success: false, error: 'Tu cuenta está suspendida. Contacta a tu administrador.', code: 'USER_SUSPENDED' },
            { status: 403 }
          );
        }

        // Check tenant status
        const { data: tenant } = await supabaseAdmin
          .from('tenants')
          .select('status, company_name')
          .eq('id', tenantUser.tenant_id)
          .single();

        if (tenant && tenant.status !== 'active') {
          await supabaseAdmin.from('auth_logs').insert({
            user_id: authUser.id,
            email,
            event_type: 'login_blocked_tenant_suspended',
            ip_address: ip,
            user_agent: userAgent,
            metadata: { tenant_status: tenant.status, tenant_name: tenant.company_name },
          });

          return NextResponse.json(
            { success: false, error: 'Tu organización está suspendida. Contacta a tu administrador.', code: 'TENANT_SUSPENDED' },
            { status: 403 }
          );
        }
      }
    }

    // Attempt sign-in using SSR client (sets httpOnly cookies)
    const cookieStore = await cookies();
    const supabase = createSSRServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // setAll can fail in certain contexts — expected
            }
          },
        },
      }
    );

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      // Auth failed — increment failed attempts
      if (authUser) {
        const { data: currentTU } = await supabaseAdmin
          .from('tenant_users')
          .select('failed_login_attempts')
          .eq('user_id', authUser.id)
          .single();

        const attempts = (currentTU?.failed_login_attempts || 0) + 1;
        const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

        await supabaseAdmin
          .from('tenant_users')
          .update({
            failed_login_attempts: attempts,
            locked_until: shouldLock
              ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString()
              : null,
          })
          .eq('user_id', authUser.id);

        // Log failed attempt
        await supabaseAdmin.from('auth_logs').insert({
          user_id: authUser.id,
          email,
          event_type: 'login_failed',
          ip_address: ip,
          user_agent: userAgent,
          metadata: {
            attempts,
            locked: shouldLock,
            error: signInError?.message || 'Invalid credentials',
          },
        });

        if (shouldLock) {
          return NextResponse.json(
            {
              success: false,
              error: `Demasiados intentos fallidos. Tu cuenta se bloqueó por ${LOCK_DURATION_MINUTES} minutos.`,
              code: 'ACCOUNT_LOCKED',
            },
            { status: 429 }
          );
        }

        const remaining = MAX_FAILED_ATTEMPTS - attempts;
        if (remaining <= 2 && remaining > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Correo o contraseña incorrectos. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''} antes del bloqueo.`,
            },
            { status: 401 }
          );
        }
      }

      // Log failed attempt for unknown email
      if (!authUser) {
        await supabaseAdmin.from('auth_logs').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          email,
          event_type: 'login_failed_unknown_email',
          ip_address: ip,
          user_agent: userAgent,
          metadata: {},
        });
      }

      return NextResponse.json(
        { success: false, error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Login successful — reset failed attempts + update last_login_at
    const userId = signInData.user.id;

    await supabaseAdmin
      .from('tenant_users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Log successful login
    await supabaseAdmin.from('auth_logs').insert({
      user_id: userId,
      email,
      event_type: 'login_success',
      ip_address: ip,
      user_agent: userAgent,
      metadata: {},
    });

    // Get enterprise status for immediate routing
    const { data: tenantUser } = await supabaseAdmin
      .from('tenant_users')
      .select('must_change_password, tenant_id, status')
      .eq('user_id', userId)
      .single();

    let tenantStatus = 'active';
    let tenantName: string | null = null;
    let onboardingCompleted = false;

    if (tenantUser?.tenant_id) {
      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('status, company_name')
        .eq('id', tenantUser.tenant_id)
        .single();
      tenantStatus = tenant?.status || 'active';
      tenantName = tenant?.company_name || null;
    }

    // Check onboarding
    const { data: config } = await supabaseAdmin
      .from('user_config')
      .select('onboarding_completed, onboarding_v2_completed')
      .eq('user_id', userId)
      .single();

    onboardingCompleted = config?.onboarding_v2_completed || config?.onboarding_completed || false;

    return NextResponse.json({
      success: true,
      data: {
        must_change_password: tenantUser?.must_change_password || false,
        tenant_status: tenantStatus,
        user_status: tenantUser?.status || 'active',
        onboarding_completed: onboardingCompleted,
        tenant_name: tenantName,
      },
    });
  } catch (error) {
    console.error('Error en POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
