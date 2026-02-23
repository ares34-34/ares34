-- ============================================
-- ARES34 - Migracion V2: Sistema de Entidades
-- Ejecutar en Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/gxtbvsdclblkngycdmkz/sql/new
--
-- IMPORTANTE: Esta migracion AGREGA tablas nuevas.
-- Las tablas existentes (archetypes, user_config, conversations,
-- deliberations, decisions, subscriptions, company_documents)
-- se mantienen intactas para compatibilidad.
-- ============================================

-- ============================================
-- PASO 0: Columnas nuevas en tablas existentes
-- ============================================

-- Agregar flag de onboarding v2 a user_config
ALTER TABLE user_config
  ADD COLUMN IF NOT EXISTS onboarding_v2_completed BOOLEAN DEFAULT FALSE;

-- Agregar flag de formato entidades a deliberations (backward compat)
ALTER TABLE deliberations
  ADD COLUMN IF NOT EXISTS entity_deliberations_format BOOLEAN DEFAULT FALSE;

-- ============================================
-- TABLA 1: company_profiles
-- Onboarding Layer 1 - 50 preguntas factuales
-- ============================================
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos generales de la empresa
  legal_name TEXT,
  founding_year INTEGER,
  sector TEXT,
  specific_activity TEXT,
  employee_range VARCHAR(20) CHECK (employee_range IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  main_office_location TEXT,
  multi_location BOOLEAN DEFAULT FALSE,
  multi_location_detail TEXT,

  -- Estructura legal y governance
  society_type VARCHAR(20) CHECK (society_type IN ('SA', 'SAPI', 'SRL', 'SC', 'otra')),
  has_formal_board BOOLEAN,
  board_member_count INTEGER,
  ceo_is_shareholder BOOLEAN,
  ceo_shareholder_pct NUMERIC(5,2),
  ceo_is_board_president BOOLEAN,
  shareholder_count INTEGER,
  shareholders_in_operations BOOLEAN,
  shareholders_in_operations_detail TEXT,
  has_regular_assembly BOOLEAN,
  assembly_frequency TEXT,

  -- Familia y gobierno corporativo
  family_in_leadership BOOLEAN,
  family_in_leadership_detail TEXT,
  has_family_protocol BOOLEAN,

  -- Estructura organizacional
  direct_reports_count INTEGER,
  functional_areas_reporting TEXT[],
  has_coo BOOLEAN,
  has_cfo BOOLEAN,
  avg_leadership_tenure_range VARCHAR(20),
  ceo_leads_functional_area BOOLEAN,
  ceo_functional_area_detail TEXT,

  -- Finanzas
  revenue_range VARCHAR(50),
  revenue_trend VARCHAR(20) CHECK (revenue_trend IN ('growth', 'stable', 'decline')),
  is_profitable BOOLEAN,
  has_significant_debt BOOLEAN,
  debt_range TEXT,

  -- Ingresos y dependencia
  main_revenue_source TEXT,
  main_revenue_pct INTEGER,
  single_client_dependency BOOLEAN,
  dependency_pct INTEGER,
  has_external_investors BOOLEAN,
  seeking_financing BOOLEAN,

  -- Mercado y competencia
  client_type VARCHAR(20) CHECK (client_type IN ('B2B', 'B2C', 'B2G', 'mixed')),
  active_client_count_range VARCHAR(20),
  operates_in_regulated_market BOOLEAN,
  regulated_market_detail TEXT,
  competitor_count_range VARCHAR(10) CHECK (competitor_count_range IN ('1-3', '4-10', '10+')),
  market_position VARCHAR(20) CHECK (market_position IN ('leader', 'top3', 'middle', 'entrant')),
  exports_internationally BOOLEAN,
  international_pct INTEGER,
  considering_new_markets BOOLEAN,

  -- Tecnologia y operaciones
  has_manufacturing BOOLEAN,
  digitalization_level VARCHAR(10) CHECK (digitalization_level IN ('low', 'medium', 'high')),
  uses_integrated_systems BOOLEAN,
  integrated_systems_detail TEXT,
  has_internal_it BOOLEAN,
  it_team_size INTEGER,
  uses_ai BOOLEAN,
  ai_detail TEXT,

  -- Perfil del CEO
  ceo_years_in_role INTEGER,
  ceo_is_founder BOOLEAN,
  ceo_generation VARCHAR(20) CHECK (ceo_generation IN ('first', 'succession')),
  ceo_simultaneous_roles TEXT[],
  ceo_education TEXT,
  ceo_prior_experience BOOLEAN,
  ceo_prior_experience_count INTEGER,
  ceo_on_other_boards BOOLEAN,

  -- Estado del onboarding
  onboarding_layer1_completed BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- TABLA 2: ceo_context_snapshot
-- Onboarding Layer 2 - 28 preguntas conversacionales
-- ============================================
CREATE TABLE IF NOT EXISTS ceo_context_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Bloques tematicos (JSONB para flexibilidad)
  governance_power JSONB DEFAULT '{}'::jsonb,       -- Q1-6: Gobierno y poder
  financial_reality JSONB DEFAULT '{}'::jsonb,      -- Q7-11: Realidad financiera
  market_positioning JSONB DEFAULT '{}'::jsonb,     -- Q12-16: Posicionamiento de mercado
  team_culture JSONB DEFAULT '{}'::jsonb,           -- Q17-22: Equipo y cultura
  ceo_decision_patterns JSONB DEFAULT '{}'::jsonb,  -- Q23-28: Patrones de decision del CEO

  -- Estado del onboarding
  onboarding_layer2_completed BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- TABLA 3: initial_diagnostics
-- Diagnostico post-onboarding generado por IA
-- ============================================
CREATE TABLE IF NOT EXISTS initial_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Secciones del diagnostico
  structural_radiography TEXT,    -- Radiografia estructural
  role_conflict_map TEXT,         -- Mapa de conflictos de rol
  vulnerabilities TEXT,           -- Vulnerabilidades detectadas
  hidden_strengths TEXT,          -- Fortalezas ocultas
  strategic_questions TEXT,       -- Preguntas estrategicas

  -- Timestamp de generacion
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- TABLA 4: entity_deliberations
-- Resultado de deliberacion por entidad (csuite/board/assembly)
-- ============================================
CREATE TABLE IF NOT EXISTS entity_deliberations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  entity VARCHAR(20) NOT NULL CHECK (entity IN ('csuite', 'board', 'assembly')),

  -- Contenido de la deliberacion
  perspectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  synthesis TEXT,
  tensions JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(conversation_id, entity)
);

-- ============================================
-- TABLA 5: decision_logs
-- Tracking completo de decisiones
-- ============================================
CREATE TABLE IF NOT EXISTS decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Posiciones y tensiones
  entity_positions JSONB DEFAULT '{}'::jsonb,
  tensions_detected JSONB DEFAULT '[]'::jsonb,

  -- Sintesis final
  final_synthesis TEXT,

  -- Reaccion del CEO
  ceo_reaction TEXT CHECK (ceo_reaction IS NULL OR ceo_reaction IN ('accepted', 'rejected', 'modified', 'deferred')),
  reaction_notes TEXT,

  -- Resultado real
  real_world_outcome TEXT,
  outcome_recorded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(conversation_id)
);

-- ============================================
-- TABLA 6: entity_weighting_matrix
-- Pesos de evolucion por usuario (versionado)
-- ============================================
CREATE TABLE IF NOT EXISTS entity_weighting_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,

  -- Pesos por entidad (suman ~1.0)
  csuite_weight NUMERIC(3,2) DEFAULT 0.34,
  board_weight NUMERIC(3,2) DEFAULT 0.33,
  assembly_weight NUMERIC(3,2) DEFAULT 0.33,

  -- Pesos granulares por miembro individual
  member_weights JSONB DEFAULT '{}'::jsonb,

  -- Razon del ajuste
  reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, version)
);

-- ============================================
-- TABLA 7: evolution_history
-- Log de cambios de pesos a lo largo del tiempo
-- ============================================
CREATE TABLE IF NOT EXISTS evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Versiones
  from_version INTEGER,
  to_version INTEGER,

  -- Detalle del cambio
  changes JSONB NOT NULL,
  trigger_type VARCHAR(20) CHECK (trigger_type IN ('ceo_reaction', 'outcome', 'pattern', 'manual')),
  trigger_detail TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- company_profiles
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id
  ON company_profiles(user_id);

-- ceo_context_snapshot
CREATE INDEX IF NOT EXISTS idx_ceo_context_snapshot_user_id
  ON ceo_context_snapshot(user_id);

-- initial_diagnostics
CREATE INDEX IF NOT EXISTS idx_initial_diagnostics_user_id
  ON initial_diagnostics(user_id);

-- entity_deliberations
CREATE INDEX IF NOT EXISTS idx_entity_deliberations_conversation_id
  ON entity_deliberations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_entity_deliberations_entity
  ON entity_deliberations(entity);

-- decision_logs
CREATE INDEX IF NOT EXISTS idx_decision_logs_conversation_id
  ON decision_logs(conversation_id);

CREATE INDEX IF NOT EXISTS idx_decision_logs_ceo_reaction
  ON decision_logs(ceo_reaction);

-- entity_weighting_matrix
CREATE INDEX IF NOT EXISTS idx_entity_weighting_matrix_user_id
  ON entity_weighting_matrix(user_id);

CREATE INDEX IF NOT EXISTS idx_entity_weighting_matrix_user_version
  ON entity_weighting_matrix(user_id, version DESC);

-- evolution_history
CREATE INDEX IF NOT EXISTS idx_evolution_history_user_id
  ON evolution_history(user_id);

CREATE INDEX IF NOT EXISTS idx_evolution_history_created_at
  ON evolution_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Patron: cada usuario solo ve/modifica sus propios datos
-- ============================================

-- ----- company_profiles -----
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su perfil de empresa"
  ON company_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su perfil de empresa"
  ON company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su perfil de empresa"
  ON company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ----- ceo_context_snapshot -----
ALTER TABLE ceo_context_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su contexto CEO"
  ON ceo_context_snapshot FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su contexto CEO"
  ON ceo_context_snapshot FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su contexto CEO"
  ON ceo_context_snapshot FOR UPDATE
  USING (auth.uid() = user_id);

-- ----- initial_diagnostics -----
ALTER TABLE initial_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su diagnostico inicial"
  ON initial_diagnostics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su diagnostico inicial"
  ON initial_diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su diagnostico inicial"
  ON initial_diagnostics FOR UPDATE
  USING (auth.uid() = user_id);

-- ----- entity_deliberations -----
-- (acceso via conversation ownership, mismo patron que deliberations)
ALTER TABLE entity_deliberations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven deliberaciones de entidad de sus conversaciones"
  ON entity_deliberations FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema inserta deliberaciones de entidad"
  ON entity_deliberations FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema actualiza deliberaciones de entidad"
  ON entity_deliberations FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- ----- decision_logs -----
-- (acceso via conversation ownership)
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus logs de decision"
  ON decision_logs FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema inserta logs de decision"
  ON decision_logs FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios actualizan sus logs de decision"
  ON decision_logs FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- ----- entity_weighting_matrix -----
ALTER TABLE entity_weighting_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su matriz de pesos"
  ON entity_weighting_matrix FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean versiones de pesos"
  ON entity_weighting_matrix FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su matriz de pesos"
  ON entity_weighting_matrix FOR UPDATE
  USING (auth.uid() = user_id);

-- ----- evolution_history -----
ALTER TABLE evolution_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su historial de evolucion"
  ON evolution_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema inserta historial de evolucion"
  ON evolution_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS: updated_at automatico
-- Reutiliza la funcion update_updated_at() del schema original
-- ============================================

CREATE TRIGGER company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ceo_context_snapshot_updated_at
  BEFORE UPDATE ON ceo_context_snapshot
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER decision_logs_updated_at
  BEFORE UPDATE ON decision_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VERIFICACION: Listar todas las tablas nuevas
-- ============================================
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'company_profiles',
    'ceo_context_snapshot',
    'initial_diagnostics',
    'entity_deliberations',
    'decision_logs',
    'entity_weighting_matrix',
    'evolution_history'
  )
ORDER BY table_name;
