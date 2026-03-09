// ============================================================
// ARES34 — Zoom Integration
// Token refresh + meeting creation
// ============================================================

import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ZoomTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  topic: string;
}

// Refresh Zoom OAuth token
export async function refreshZoomToken(userId: string): Promise<string> {
  const supabase = createAdminClient();

  const { data: integration } = await supabase
    .from('zoom_integrations')
    .select('id, access_token, refresh_token, token_expiry')
    .eq('user_id', userId)
    .single();

  if (!integration) throw new Error('Zoom no conectado');

  // Check if token is still valid (5 min buffer)
  if (integration.token_expiry) {
    const expiry = new Date(integration.token_expiry);
    if (expiry.getTime() - Date.now() > 5 * 60 * 1000) {
      return integration.access_token;
    }
  }

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: integration.refresh_token,
    }),
  });

  if (!response.ok) {
    await supabase
      .from('zoom_integrations')
      .update({ status: 'expired' })
      .eq('user_id', userId);
    throw new Error('Error al refrescar token de Zoom');
  }

  const tokens: ZoomTokenResponse = await response.json();
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from('zoom_integrations')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: newExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return tokens.access_token;
}

// Create a Zoom meeting (returns join_url or undefined if Zoom not connected)
export async function createZoomMeeting(
  userId: string,
  topic: string,
  startTime: string
): Promise<{ join_url: string; meeting_id: string } | undefined> {
  try {
    const accessToken = await refreshZoomToken(userId);

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: 60,
        timezone: 'America/Mexico_City',
        settings: {
          join_before_host: true,
          waiting_room: false,
        },
      }),
    });

    if (!response.ok) return undefined;

    const meeting: ZoomMeetingResponse = await response.json();
    return {
      join_url: meeting.join_url,
      meeting_id: String(meeting.id),
    };
  } catch {
    // Zoom is optional — never block event creation
    return undefined;
  }
}
