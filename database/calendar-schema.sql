-- ============================================================
-- ARES34 — Schema para Calendario + Contratos
-- ============================================================

-- ============================================================
-- TABLE: calendar_events
-- Eventos del calendario del CEO
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  color VARCHAR(20) DEFAULT '#6366f1',
  source VARCHAR(20) DEFAULT 'ares',
  external_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_user_time ON calendar_events(user_id, start_time, end_time);
CREATE INDEX idx_calendar_events_source ON calendar_events(user_id, source);

-- Required for upsert (onConflict) in Google/Outlook sync
-- NULLs are distinct in PG, so ARES events (external_id=NULL) won't conflict
ALTER TABLE calendar_events ADD CONSTRAINT uq_calendar_events_user_external UNIQUE (user_id, external_id);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: calendar_integrations
-- Conexiones con calendarios externos (Google, Outlook, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  email VARCHAR(255) DEFAULT '',
  access_token TEXT DEFAULT '',
  refresh_token TEXT DEFAULT '',
  token_expiry TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'connected',
  last_sync TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider)
);

CREATE INDEX idx_calendar_integrations_user ON calendar_integrations(user_id);

ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own integrations"
  ON calendar_integrations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own integrations"
  ON calendar_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations"
  ON calendar_integrations FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations"
  ON calendar_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: generated_contracts
-- Contratos generados por IA
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  generated_content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generated_contracts_user ON generated_contracts(user_id, created_at DESC);

ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contracts"
  ON generated_contracts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contracts"
  ON generated_contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SERVICE ROLE POLICIES
-- Note: The admin client uses service_role_key which bypasses RLS.
-- ============================================================
