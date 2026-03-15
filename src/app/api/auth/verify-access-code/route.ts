import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================
// POST /api/auth/verify-access-code
// Verifica el código de acceso y marca access_granted = true
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'El código de acceso es requerido' },
        { status: 400 }
      );
    }

    // Get authenticated user
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
              // Expected in some contexts
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    // Check the access code
    const accessCode = process.env.ACCESS_CODE;

    if (!accessCode) {
      console.error('ACCESS_CODE env var is not set');
      return NextResponse.json(
        { success: false, error: 'Error de configuración. Contacta al administrador.' },
        { status: 500 }
      );
    }

    if (code.trim().toLowerCase() !== accessCode.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Código de acceso incorrecto. Verifica con tu contacto en ARES34.' },
        { status: 403 }
      );
    }

    // Code is correct — mark access_granted = true
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert: if user_config exists, update; if not, create
    const { data: existingConfig } = await supabaseAdmin
      .from('user_config')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingConfig) {
      await supabaseAdmin
        .from('user_config')
        .update({ access_granted: true })
        .eq('user_id', user.id);
    } else {
      await supabaseAdmin
        .from('user_config')
        .insert({
          user_id: user.id,
          access_granted: true,
          onboarding_completed: false,
        });
    }

    // Log access code verification
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabaseAdmin.from('auth_logs').insert({
      user_id: user.id,
      email: user.email,
      event_type: 'access_code_verified',
      ip_address: ip,
      user_agent: userAgent,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/auth/verify-access-code:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
