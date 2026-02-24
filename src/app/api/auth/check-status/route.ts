import { NextResponse } from 'next/server';
import { createServerClient, getTenantUser, getTenant } from '@/lib/supabase';

// ============================================
// GET /api/auth/check-status
// Retorna el estado enterprise del usuario:
// - must_change_password
// - tenant_status
// - user_status
// - onboarding_completed
// ============================================

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    // Get tenant user info
    const tenantUser = await getTenantUser(user.id);

    if (!tenantUser) {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta no está vinculada a ninguna organización. Contacta a tu administrador.' },
        { status: 403 }
      );
    }

    // Check tenant status
    const tenant = await getTenant(tenantUser.tenant_id);

    if (!tenant || tenant.status !== 'active') {
      return NextResponse.json({
        success: true,
        data: {
          must_change_password: tenantUser.must_change_password,
          tenant_status: tenant?.status || 'not_found',
          user_status: tenantUser.status,
          onboarding_completed: false,
          tenant_name: tenant?.company_name || null,
        },
      });
    }

    // Check user status
    if (tenantUser.status !== 'active') {
      return NextResponse.json({
        success: true,
        data: {
          must_change_password: tenantUser.must_change_password,
          tenant_status: tenant.status,
          user_status: tenantUser.status,
          onboarding_completed: false,
          tenant_name: tenant.company_name,
        },
      });
    }

    // Check onboarding - use v2 flag first, fall back to legacy
    const { data: config } = await supabase
      .from('user_config')
      .select('onboarding_completed, onboarding_v2_completed')
      .eq('user_id', user.id)
      .single();

    const onboardingCompleted = config?.onboarding_v2_completed || config?.onboarding_completed || false;

    return NextResponse.json({
      success: true,
      data: {
        must_change_password: tenantUser.must_change_password,
        tenant_status: tenant.status,
        user_status: tenantUser.status,
        onboarding_completed: onboardingCompleted,
        tenant_name: tenant.company_name,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/auth/check-status:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
