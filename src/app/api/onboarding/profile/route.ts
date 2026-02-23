import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, saveCompanyProfile, getCompanyProfile } from '@/lib/supabase';

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

    const profile = await getCompanyProfile(user.id);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error en GET /api/onboarding/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener el perfil de tu empresa' },
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

    // Pass all CompanyProfile fields directly to the save function
    const profile = await saveCompanyProfile(user.id, body);

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error en POST /api/onboarding/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar el perfil de tu empresa' },
      { status: 500 }
    );
  }
}
