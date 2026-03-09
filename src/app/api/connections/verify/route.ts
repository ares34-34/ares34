import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST — Verify a connection code (WhatsApp flow)
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

  const body = await request.json();
  const { connection_id, code } = body;

  if (!connection_id || !code) {
    return NextResponse.json({ error: 'ID y código requeridos' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find connection
  const { data: connection } = await admin
    .from('messaging_connections')
    .select('id, verification_code, verification_expires_at, status')
    .eq('id', connection_id)
    .eq('user_id', user.id)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'Conexión no encontrada' }, { status: 404 });
  }

  if (connection.status === 'verified') {
    return NextResponse.json({ error: 'Ya verificada' }, { status: 400 });
  }

  if (connection.verification_code !== code) {
    return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 });
  }

  if (connection.verification_expires_at && new Date(connection.verification_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Código expirado. Genera uno nuevo.' }, { status: 400 });
  }

  // Mark verified
  const { error } = await admin
    .from('messaging_connections')
    .update({
      status: 'verified',
      verification_code: null,
      verification_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: 'verified' });
}
