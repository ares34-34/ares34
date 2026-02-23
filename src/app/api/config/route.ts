import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserConfig, saveUserConfig } from '@/lib/supabase';

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

    const config = await getUserConfig(user.id);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error en GET /api/config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener tu configuración' },
      { status: 500 }
    );
  }
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

    const body = await request.json();

    // Accept BOTH old-style (v1) and new-style (v2) fields for backward compatibility
    const {
      // v1 fields (legacy onboarding)
      ceo_kpi_1,
      ceo_kpi_2,
      ceo_kpi_3,
      ceo_inspiration,
      ceo_main_goal,
      custom_board_archetype_id,
      onboarding_completed,
      company_context,
      // v2 fields
      onboarding_v2_completed,
    } = body;

    // Build update payload: only include fields that were actually sent
    const updatePayload: Record<string, unknown> = {};

    // v1 fields
    if (ceo_kpi_1 !== undefined) updatePayload.ceo_kpi_1 = ceo_kpi_1;
    if (ceo_kpi_2 !== undefined) updatePayload.ceo_kpi_2 = ceo_kpi_2;
    if (ceo_kpi_3 !== undefined) updatePayload.ceo_kpi_3 = ceo_kpi_3;
    if (ceo_inspiration !== undefined) updatePayload.ceo_inspiration = ceo_inspiration;
    if (ceo_main_goal !== undefined) updatePayload.ceo_main_goal = ceo_main_goal;
    if (custom_board_archetype_id !== undefined) updatePayload.custom_board_archetype_id = custom_board_archetype_id;
    if (onboarding_completed !== undefined) updatePayload.onboarding_completed = onboarding_completed;
    if (company_context !== undefined) updatePayload.company_context = company_context;

    // v2 fields
    if (onboarding_v2_completed !== undefined) updatePayload.onboarding_v2_completed = onboarding_v2_completed;

    const config = await saveUserConfig(user.id, updatePayload);

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error en POST /api/config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar tu configuración' },
      { status: 500 }
    );
  }
}
