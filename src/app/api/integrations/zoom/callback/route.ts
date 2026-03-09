import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — Zoom OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    const url = request.nextUrl.clone();
    url.pathname = '/connections';
    url.searchParams.set('error', 'zoom_auth_failed');
    return NextResponse.redirect(url);
  }

  // Get user from session
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const redirectUri = `${request.nextUrl.origin}/api/integrations/zoom/callback`;
    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Error al intercambiar código de Zoom');
    }

    const tokens = await tokenResponse.json();

    // Get Zoom user profile
    const profileResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    let zoomUserId = '';
    let email = '';
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      zoomUserId = profile.id || '';
      email = profile.email || '';
    }

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Upsert zoom integration
    const admin = createAdminClient();
    await admin
      .from('zoom_integrations')
      .upsert(
        {
          user_id: user.id,
          zoom_user_id: zoomUserId,
          email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || '',
          token_expiry: tokenExpiry,
          status: 'connected',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    const url = request.nextUrl.clone();
    url.pathname = '/connections';
    url.searchParams.set('success', 'zoom_connected');
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Zoom OAuth error:', err);
    const url = request.nextUrl.clone();
    url.pathname = '/connections';
    url.searchParams.set('error', 'zoom_auth_failed');
    return NextResponse.redirect(url);
  }
}
