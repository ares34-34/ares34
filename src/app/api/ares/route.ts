import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserConfig } from '@/lib/supabase';
import { processARESRequest } from '@/lib/ares-engine';

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
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes enviar una pregunta válida' },
        { status: 400 }
      );
    }

    const config = await getUserConfig(user.id);
    if (!config?.onboarding_completed) {
      return NextResponse.json(
        { success: false, error: 'Necesitas completar tu configuración primero' },
        { status: 400 }
      );
    }

    const result = await processARESRequest(user.id, question.trim());

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error en /api/ares:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo procesar tu pregunta. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
