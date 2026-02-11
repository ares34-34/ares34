import { NextResponse } from 'next/server';
import { createServerClient, getConversations } from '@/lib/supabase';

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

    const conversations = await getConversations(user.id);
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error en GET /api/conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener tu historial' },
      { status: 500 }
    );
  }
}
