import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { validatePassword } from '@/lib/password';
import { getTenantUser, updateTenantUser, logAuthEvent } from '@/lib/supabase';

// ============================================
// POST /api/auth/change-password
// Cambia la contraseña del usuario autenticado.
// Requiere contraseña actual + nueva contraseña válida.
// Re-autentica al usuario con la nueva contraseña
// para mantener la sesión activa.
// ============================================

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Se requiere la contraseña actual y la nueva contraseña' },
        { status: 400 }
      );
    }

    // Validate new password meets enterprise requirements
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña no cumple los requisitos', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify current password by attempting sign-in (admin client, no cookies)
    const supabaseAdmin = createAdminClient();
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      await logAuthEvent(user.id, user.email!, 'login_failed', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        metadata: { reason: 'wrong_password_during_change' },
      });

      return NextResponse.json(
        { success: false, error: 'La contraseña actual es incorrecta' },
        { status: 400 }
      );
    }

    // Update password via admin API (this invalidates existing sessions)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar la contraseña. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Re-authenticate with new password using SSR client (sets fresh session cookies)
    const cookieStore = await cookies();
    const supabaseSSR = createSSRServerClient(
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

    await supabaseSSR.auth.signInWithPassword({
      email: user.email!,
      password: newPassword,
    });

    // Mark must_change_password = false in tenant_users
    const tenantUser = await getTenantUser(user.id);
    if (tenantUser) {
      await updateTenantUser(user.id, {
        must_change_password: false,
        password_changed_at: new Date().toISOString(),
      });
    }

    // Log successful password change
    await logAuthEvent(user.id, user.email!, 'password_changed', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Return onboarding status so client doesn't need a separate API call
    const { data: config } = await supabaseAdmin
      .from('user_config')
      .select('onboarding_completed, onboarding_v2_completed')
      .eq('user_id', user.id)
      .single();

    const onboardingCompleted = config?.onboarding_v2_completed || config?.onboarding_completed || false;

    return NextResponse.json({
      success: true,
      data: { onboarding_completed: onboardingCompleted },
    });
  } catch (error) {
    console.error('Error en POST /api/auth/change-password:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
