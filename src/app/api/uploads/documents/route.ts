import { NextResponse } from 'next/server';
import { createServerClient, getDocuments } from '@/lib/supabase';

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

    const documents = await getDocuments(user.id);

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error en GET /api/uploads/documents:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}
