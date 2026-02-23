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
    const { ceo_kpi_1, ceo_kpi_2, ceo_kpi_3, ceo_inspiration, ceo_main_goal, custom_board_archetype_id, onboarding_completed, company_context } = body;

    const config = await saveUserConfig(user.id, {
      ceo_kpi_1,
      ceo_kpi_2,
      ceo_kpi_3,
      ceo_inspiration,
      ceo_main_goal,
      custom_board_archetype_id,
      onboarding_completed,
      company_context,
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error en POST /api/config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar tu configuración' },
      { status: 500 }
    );
  }
}
