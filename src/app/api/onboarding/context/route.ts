import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, saveCEOContextSnapshot, getCEOContextSnapshot } from '@/lib/supabase';

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

    const snapshot = await getCEOContextSnapshot(user.id);
    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('Error en GET /api/onboarding/context:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener tu contexto de CEO' },
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

    // Accept block-based data: block_1_vision, block_2_leadership, etc.
    // Plus completed_blocks count
    const snapshot = await saveCEOContextSnapshot(user.id, body);

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('Error en POST /api/onboarding/context:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar tu contexto de CEO' },
      { status: 500 }
    );
  }
}
