import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserConfig } from '@/lib/supabase';
import { generatePulse } from '@/lib/modules-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const config = await getUserConfig(user.id);
    if (!config?.onboarding_completed && !config?.onboarding_v2_completed) {
      return NextResponse.json(
        { error: 'Necesitas completar tu configuración primero' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const focus = body.focus || 'general';

    const validFocuses = ['general', 'financial', 'team', 'clients', 'operations'];
    if (!validFocuses.includes(focus)) {
      return NextResponse.json(
        { error: 'Enfoque no válido. Usa: general, financial, team, clients, operations.' },
        { status: 400 }
      );
    }

    const result = await generatePulse(user.id, focus);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generando pulse:', error);
    return NextResponse.json(
      { error: 'Error al generar el pulso del negocio. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
