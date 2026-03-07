-- ============================================================
-- ARES34 — Schema para Módulos Extendidos
-- Brief, Scenarios, Compliance, Pulse, Prep
-- ============================================================

-- ============================================================
-- TABLE: daily_briefs
-- Briefings matutinos generados por IA
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL,
  kpis_highlight TEXT DEFAULT '',
  pending_decisions TEXT DEFAULT '',
  alerts TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_briefs_user_date ON daily_briefs(user_id, date DESC);

ALTER TABLE daily_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own briefs"
  ON daily_briefs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own briefs"
  ON daily_briefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: scenarios
-- Análisis de escenarios "¿Qué pasa si...?"
-- ============================================================
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hypothesis TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  analysis TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_user ON scenarios(user_id, created_at DESC);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scenarios"
  ON scenarios FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: compliance_checks
-- Verificaciones de cumplimiento legal MX
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  area VARCHAR(50) DEFAULT 'general',
  analysis TEXT NOT NULL,
  risk_level VARCHAR(20) DEFAULT 'medio',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_user ON compliance_checks(user_id, created_at DESC);

ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own compliance checks"
  ON compliance_checks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compliance checks"
  ON compliance_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: pulse_snapshots
-- Diagnósticos de salud empresarial
-- ============================================================
CREATE TABLE IF NOT EXISTS pulse_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis TEXT NOT NULL,
  focus VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pulse_user ON pulse_snapshots(user_id, created_at DESC);

ALTER TABLE pulse_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pulse snapshots"
  ON pulse_snapshots FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pulse snapshots"
  ON pulse_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: meeting_preps
-- Briefs de preparación de juntas
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_preps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_topic TEXT NOT NULL,
  meeting_type VARCHAR(50) DEFAULT 'general',
  brief TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meeting_preps_user ON meeting_preps(user_id, created_at DESC);

ALTER TABLE meeting_preps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meeting preps"
  ON meeting_preps FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meeting preps"
  ON meeting_preps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SERVICE ROLE POLICIES (for API routes using admin client)
-- ============================================================
-- Note: The admin client uses service_role_key which bypasses RLS.
-- These policies only apply to anon/authenticated clients.
