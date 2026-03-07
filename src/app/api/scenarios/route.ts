import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { analyzeScenario } from '@/lib/modules-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { hypothesis } = body;

    if (!hypothesis || typeof hypothesis !== 'string' || hypothesis.trim().length < 10) {
      return NextResponse.json(
        { error: 'Describe tu escenario con al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    if (hypothesis.length > 2000) {
      return NextResponse.json(
        { error: 'El escenario no puede exceder 2,000 caracteres.' },
        { status: 400 }
      );
    }

    const result = await analyzeScenario(user.id, hypothesis.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analizando escenario:', error);
    return NextResponse.json(
      { error: 'Error al analizar el escenario. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
