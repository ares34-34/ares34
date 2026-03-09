-- ============================================================
-- ARES34 — Migration: Messaging Connections + Zoom + Calendar Alters
-- WhatsApp, Telegram, Zoom integrations
-- ============================================================

-- ============================================================
-- TABLE: messaging_connections
-- WhatsApp / Telegram connections for natural language scheduling
-- ============================================================
CREATE TABLE IF NOT EXISTS messaging_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'telegram')),
  external_id VARCHAR(100) NOT NULL, -- phone number (whatsapp) or chat_id (telegram)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disabled')),
  verification_code VARCHAR(6),
  verification_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_messaging_connections_channel_ext ON messaging_connections(channel, external_id);
CREATE INDEX idx_messaging_connections_user ON messaging_connections(user_id);

ALTER TABLE messaging_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messaging connections"
  ON messaging_connections FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messaging connections"
  ON messaging_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messaging connections"
  ON messaging_connections FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messaging connections"
  ON messaging_connections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: zoom_integrations
-- Zoom OAuth connection for generating meeting links
-- ============================================================
CREATE TABLE IF NOT EXISTS zoom_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zoom_user_id VARCHAR(100) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  access_token TEXT DEFAULT '',
  refresh_token TEXT DEFAULT '',
  token_expiry TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'connected',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE zoom_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own zoom integration"
  ON zoom_integrations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own zoom integration"
  ON zoom_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own zoom integration"
  ON zoom_integrations FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own zoom integration"
  ON zoom_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ALTER: calendar_events — Add zoom fields + unique constraint
-- ============================================================
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS zoom_link TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT;

-- Unique constraint for sync dedup (source + external_id per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_user_ext
  ON calendar_events(user_id, external_id)
  WHERE external_id IS NOT NULL;

-- ============================================================
-- ALTER: calendar_integrations — Add sync_enabled flag
-- ============================================================
ALTER TABLE calendar_integrations ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT TRUE;

-- ============================================================
-- SERVICE ROLE NOTE
-- The admin client uses service_role_key which bypasses RLS.
-- Webhooks (WhatsApp/Telegram) use the admin client.
-- ============================================================
