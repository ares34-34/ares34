import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getCalendarIntegrations, disconnectIntegration } from '@/lib/modules-engine';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const integrations = await getCalendarIntegrations(user.id);
    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error obteniendo integraciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener integraciones.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (provider === 'google_calendar') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/calendar/google/callback`;

      if (!clientId) {
        return NextResponse.json(
          { error: 'Google Calendar no está configurado. Contacta al administrador.' },
          { status: 503 }
        );
      }

      const scopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${user.id}`;

      return NextResponse.json({ authUrl });
    }

    if (provider === 'outlook') {
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/calendar/outlook/callback`;

      if (!clientId) {
        return NextResponse.json(
          { error: 'Outlook Calendar no está configurado. Contacta al administrador.' },
          { status: 503 }
        );
      }

      const scopes = 'Calendars.ReadWrite offline_access User.Read';
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&response_mode=query&state=${user.id}`;

      return NextResponse.json({ authUrl });
    }

    return NextResponse.json(
      { error: 'Proveedor no soportado aún.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error iniciando integración:', error);
    return NextResponse.json(
      { error: 'Error al iniciar la integración.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la integración.' },
        { status: 400 }
      );
    }

    await disconnectIntegration(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error desconectando integración:', error);
    return NextResponse.json(
      { error: 'Error al desconectar la integración.' },
      { status: 500 }
    );
  }
}
