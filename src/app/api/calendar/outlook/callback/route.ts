import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — OAuth callback from Microsoft
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    const url = request.nextUrl.clone();
    url.pathname = '/connections';
    url.searchParams.set('error', 'outlook_auth_failed');
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
    const redirectUri = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? request.nextUrl.origin : 'http://localhost:3000'}/api/calendar/outlook/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'Calendars.ReadWrite offline_access User.Read',
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Error al intercambiar código de Outlook');
    }

    const tokens = await tokenResponse.json();

    // Get user profile for email
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    let email = '';
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      email = profile.mail || profile.userPrincipalName || '';
    }

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Upsert integration
    const admin = createAdminClient();
    await admin
      .from('calendar_integrations')
      .upsert(
        {
          user_id: user.id,
          provider: 'outlook',
          email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || '',
          token_expiry: tokenExpiry,
          status: 'connected',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    const url = request.nextUrl.clone();
    url.pathname = '/connections';
    url.searchParams.set('success', 'outlook_connected');
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Outlook OAuth error:', err);
    const url = request.nextUrl.clone();
    url.pathname = '/connections';
    url.searchParams.set('error', 'outlook_auth_failed');
    return NextResponse.redirect(url);
  }
}
