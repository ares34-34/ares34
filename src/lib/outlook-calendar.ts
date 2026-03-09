// ============================================================
// ARES34 — Outlook Calendar Integration
// Token refresh + event sync via Microsoft Graph API
// ============================================================

import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface MicrosoftTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

interface OutlookCalendarEvent {
  id: string;
  subject: string;
  body?: { content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isAllDay: boolean;
  onlineMeeting?: { joinUrl: string };
}

// Refresh Microsoft OAuth token
export async function refreshOutlookToken(integrationId: string): Promise<string> {
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
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: integration.refresh_token,
      grant_type: 'refresh_token',
      scope: 'Calendars.ReadWrite offline_access',
    }),
  });

  if (!response.ok) {
    await supabase
      .from('calendar_integrations')
      .update({ status: 'expired' })
      .eq('id', integrationId);
    throw new Error('Error al refrescar token de Outlook');
  }

  const tokens: MicrosoftTokenResponse = await response.json();
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

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

// Sync Outlook Calendar events
export async function syncOutlookCalendarEvents(
  userId: string,
  integrationId: string
): Promise<number> {
  const accessToken = await refreshOutlookToken(integrationId);
  const supabase = createAdminClient();

  const startDateTime = new Date();
  startDateTime.setDate(startDateTime.getDate() - 30);
  const endDateTime = new Date();
  endDateTime.setDate(endDateTime.getDate() + 90);

  const params = new URLSearchParams({
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    $top: '250',
    $select: 'id,subject,body,start,end,isAllDay,onlineMeeting',
    $orderby: 'start/dateTime',
  });

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Error al sincronizar Outlook Calendar');
  }

  const data = await response.json();
  const events: OutlookCalendarEvent[] = data.value || [];

  let synced = 0;

  for (const event of events) {
    if (!event.subject) continue;

    const { error } = await supabase
      .from('calendar_events')
      .upsert(
        {
          user_id: userId,
          external_id: event.id,
          title: event.subject,
          description: event.body?.content || '',
          start_time: event.start.dateTime,
          end_time: event.end.dateTime,
          all_day: event.isAllDay,
          source: 'outlook',
          color: '#0078d4', // Microsoft blue
          zoom_link: event.onlineMeeting?.joinUrl || null,
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
