import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getCompanyProfile, saveCompanyProfile, getUserConfig, saveUserConfig } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estas autenticado' },
        { status: 401 }
      );
    }

    const [profile, config] = await Promise.all([
      getCompanyProfile(user.id),
      getUserConfig(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        company_context: config?.company_context || '',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/company:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener el perfil de tu empresa' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estas autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { company_context, ...profileFields } = body;

    const results: { profile?: unknown; config?: unknown } = {};

    // Update company profile if there are profile fields
    if (Object.keys(profileFields).length > 0) {
      results.profile = await saveCompanyProfile(user.id, profileFields);
    }

    // Update company_context in user_config if provided
    if (company_context !== undefined) {
      results.config = await saveUserConfig(user.id, { company_context });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error en PUT /api/company:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar los cambios de tu empresa' },
      { status: 500 }
    );
  }
}
