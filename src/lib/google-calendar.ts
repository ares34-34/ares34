// ============================================================
// ARES34 — Google Calendar Integration
// Token refresh + event sync
// ============================================================

import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  hangoutLink?: string;
}

// Refresh Google OAuth token
export async function refreshGoogleToken(integrationId: string): Promise<string> {
  const supabase = createAdminClient();

  const { data: integration } = await supabase
    .from('calendar_integrations')
    .select('access_token, refresh_token, token_expiry')
    .eq('id', integrationId)
    .single();

  if (!integration) throw new Error('Integración no encontrada');

  // Check if token is still valid (5 min buffer)
  if (integration.token_expiry) {
    const expiry = new Date(integration.token_expiry);
    if (expiry.getTime() - Date.now() > 5 * 60 * 1000) {
      return integration.access_token;
    }
  }

  // Refresh the token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: integration.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    // Mark as expired
    await supabase
      .from('calendar_integrations')
      .update({ status: 'expired' })
      .eq('id', integrationId);
    throw new Error('Error al refrescar token de Google');
  }

  const tokens: GoogleTokenResponse = await response.json();
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Update DB
  await supabase
    .from('calendar_integrations')
    .update({
      access_token: tokens.access_token,
      token_expiry: newExpiry,
      ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', integrationId);

  return tokens.access_token;
}

// Sync Google Calendar events for a user
export async function syncGoogleCalendarEvents(
  userId: string,
  integrationId: string
): Promise<number> {
  const accessToken = await refreshGoogleToken(integrationId);
  const supabase = createAdminClient();

  // Sync window: 30 days back, 90 days forward
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 90);

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Error al sincronizar Google Calendar');
  }

  const data = await response.json();
  const events: GoogleCalendarEvent[] = data.items || [];

  let synced = 0;

  for (const event of events) {
    if (!event.summary) continue;

    const startTime = event.start.dateTime || event.start.date;
    const endTime = event.end.dateTime || event.end.date;
    if (!startTime || !endTime) continue;

    const isAllDay = !event.start.dateTime;

    // Upsert by external_id
    const { error } = await supabase
      .from('calendar_events')
      .upsert(
        {
          user_id: userId,
          external_id: event.id,
          title: event.summary,
          description: event.description || '',
          start_time: startTime,
          end_time: endTime,
          all_day: isAllDay,
          source: 'google',
          color: '#4285f4', // Google blue
          zoom_link: event.hangoutLink || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,external_id' }
      );

    if (!error) synced++;
  }

  // Update last_sync
  await supabase
    .from('calendar_integrations')
    .update({
      last_sync: new Date().toISOString(),
      status: 'connected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', integrationId);

  return synced;
}
