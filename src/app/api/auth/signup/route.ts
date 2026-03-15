import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================
// POST /api/auth/signup
// Registro abierto — cualquier persona puede crear cuenta.
// Después del registro, el usuario deberá ingresar un código
// de acceso antes de poder usar la plataforma.
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una cuenta con este correo. Intenta iniciar sesión.' },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name || email.split('@')[0] },
    });

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { success: false, error: 'No pudimos crear tu cuenta. Inténtalo de nuevo.' },
        { status: 500 }
      );
    }

    const userId = newUser.user.id;

    // Create a default tenant for this user
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        company_name: name || email.split('@')[0],
        status: 'active',
      })
      .select('id')
      .single();

    if (tenantError || !tenant) {
      console.error('Error creating tenant:', tenantError);
      // Clean up: delete the auth user since tenant creation failed
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { success: false, error: 'Error al configurar tu cuenta. Inténtalo de nuevo.' },
        { status: 500 }
      );
    }

    // Create tenant_user link
    await supabaseAdmin
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        must_change_password: false,
      });

    // Create user_config with access_granted = false (needs access code)
    await supabaseAdmin
      .from('user_config')
      .insert({
        user_id: userId,
        access_granted: false,
        onboarding_completed: false,
      });

    // Create a subscription (trialing) so they can access paid paths after access code
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        tenant_id: tenant.id,
        status: 'trialing',
        plan: 'beta',
        provider: 'stripe',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        queries_used: 0,
      });

    if (subError) {
      console.error('Error creating subscription:', JSON.stringify(subError));
    }

    // Sign in the new user (sets httpOnly cookies)
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
              // setAll can fail in certain contexts
            }
          },
        },
      }
    );

    await supabase.auth.signInWithPassword({ email, password });

    // Log signup event
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabaseAdmin.from('auth_logs').insert({
      user_id: userId,
      email,
      event_type: 'signup_success',
      ip_address: ip,
      user_agent: userAgent,
      metadata: {},
    });

    return NextResponse.json({
      success: true,
      data: {
        access_granted: false,
        _debug_sub_error: subError ? subError.message : null,
      },
    });
  } catch (error) {
    console.error('Error en POST /api/auth/signup:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
