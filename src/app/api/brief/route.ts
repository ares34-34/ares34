import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateDailyBrief } from '@/lib/modules-engine';

export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const result = await generateDailyBrief(user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generando brief:', error);
    return NextResponse.json(
      { error: 'Error al generar el brief. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
