import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET — List user's messaging connections
export async function GET(request: NextRequest) {
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

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('messaging_connections')
    .select('id, channel, external_id, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data || [] });
}

// POST — Create a new pending connection
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
  const { channel, external_id } = body;

  if (!channel || !['whatsapp', 'telegram'].includes(channel)) {
    return NextResponse.json({ error: 'Canal inválido' }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  const admin = createAdminClient();

  // Delete existing pending connection of same channel for this user
  await admin
    .from('messaging_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('channel', channel)
    .eq('status', 'pending');

  const { data, error } = await admin
    .from('messaging_connections')
    .insert({
      user_id: user.id,
      channel,
      external_id: external_id || 'pending',
      status: 'pending',
      verification_code: code,
      verification_expires_at: expiresAt,
    })
    .select('id, channel, verification_code, status')
    .single();

  if (error) {
    // If unique constraint violated, connection already exists
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya tienes una conexión para este canal' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connection: data });
}

// DELETE — Remove a connection
export async function DELETE(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get('id');

  if (!connectionId) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('messaging_connections')
    .delete()
    .eq('id', connectionId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
