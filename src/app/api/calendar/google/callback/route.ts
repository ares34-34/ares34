import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // user_id
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    if (error) {
      return NextResponse.redirect(`${appUrl}/calendar?error=google_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}/calendar?error=invalid_callback`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/calendar/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/calendar?error=not_configured`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      console.error('Google token exchange failed:', tokens);
      return NextResponse.redirect(`${appUrl}/calendar?error=token_failed`);
    }

    // Get user's email from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResponse.json();

    // Save integration to DB
    const supabase = createAdminClient();
    const tokenExpiry = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

    await supabase
      .from('calendar_integrations')
      .upsert({
        user_id: state,
        provider: 'google_calendar',
        email: profile.email || '',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || '',
        token_expiry: tokenExpiry,
        status: 'connected',
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      });

    return NextResponse.redirect(`${appUrl}/calendar?connected=google`);
  } catch (error) {
    console.error('Error en Google callback:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    return NextResponse.redirect(`${appUrl}/calendar?error=callback_failed`);
  }
}
