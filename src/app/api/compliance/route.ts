import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { checkCompliance } from '@/lib/modules-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 10) {
      return NextResponse.json(
        { error: 'Describe tu consulta de cumplimiento con al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    if (query.length > 3000) {
      return NextResponse.json(
        { error: 'La consulta no puede exceder 3,000 caracteres.' },
        { status: 400 }
      );
    }

    const result = await checkCompliance(user.id, query.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en compliance check:', error);
    return NextResponse.json(
      { error: 'Error al analizar el cumplimiento. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
