import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { syncGoogleCalendarEvents } from '@/lib/google-calendar';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST — Sync Google Calendar events
export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: integration } = await admin
      .from('calendar_integrations')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('provider', 'google_calendar')
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Calendar no conectado' },
        { status: 404 }
      );
    }

    if (integration.status === 'expired') {
      return NextResponse.json(
        { error: 'Token expirado. Reconecta Google Calendar.' },
        { status: 401 }
      );
    }

    const synced = await syncGoogleCalendarEvents(user.id, integration.id);

    return NextResponse.json({
      success: true,
      synced,
      message: `${synced} eventos sincronizados`,
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Error al sincronizar Google Calendar' },
      { status: 500 }
    );
  }
}
