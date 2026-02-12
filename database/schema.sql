-- ARES34 - Schema de base de datos
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- Tabla: archetypes
-- Arquetipos de consejeros disponibles
-- ============================================
CREATE TABLE archetypes (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('board_default', 'archetype', 'assembly')),
  description TEXT NOT NULL,
  philosophy TEXT NOT NULL,
  prompt_key TEXT NOT NULL
);

-- ============================================
-- Tabla: user_config
-- Configuracion personalizada de cada usuario
-- ============================================
CREATE TABLE user_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ceo_kpi_1 TEXT,
  ceo_kpi_2 TEXT,
  ceo_kpi_3 TEXT,
  ceo_inspiration TEXT,
  ceo_main_goal TEXT,
  custom_board_archetype_id VARCHAR(50) REFERENCES archetypes(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- Tabla: conversations
-- Registro de cada pregunta procesada
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  route_level VARCHAR(20) NOT NULL CHECK (route_level IN ('CEO_LEVEL', 'BOARD_LEVEL', 'ASSEMBLY_LEVEL')),
  route_reasoning TEXT,
  route_confidence NUMERIC(3,2),
  route_complexity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tabla: deliberations
-- Resultado de la deliberacion de agentes
-- ============================================
CREATE TABLE deliberations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  perspectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id)
);

-- ============================================
-- Tabla: decisions
-- Decisiones del usuario sobre recomendaciones
-- ============================================
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_decision TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_user_config_user_id ON user_config(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_deliberations_conversation_id ON deliberations(conversation_id);
CREATE INDEX idx_decisions_conversation_id ON decisions(conversation_id);

-- ============================================
-- Row Level Security (RLS)
-- Cada usuario solo ve sus propios datos
-- ============================================

-- user_config
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propia config"
  ON user_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su propia config"
  ON user_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su propia config"
  ON user_config FOR UPDATE
  USING (auth.uid() = user_id);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus conversaciones"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean conversaciones"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- deliberations (via conversation ownership)
ALTER TABLE deliberations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven deliberaciones de sus conversaciones"
  ON deliberations FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema inserta deliberaciones"
  ON deliberations FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- decisions
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus decisiones"
  ON decisions FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios crean decisiones"
  ON decisions FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- archetypes: lectura publica (no necesitan RLS restrictivo)
ALTER TABLE archetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arquetipos son de lectura publica"
  ON archetypes FOR SELECT
  USING (true);

-- ============================================
-- Funcion para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_config_updated_at
  BEFORE UPDATE ON user_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Tabla: subscriptions
-- Suscripciones de pago de los usuarios
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('inicial', 'pro', 'empresarial', 'trial')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
  provider VARCHAR(20) NOT NULL DEFAULT 'stripe' CHECK (provider IN ('stripe', 'mercadopago', 'manual')),
  provider_subscription_id VARCHAR(255),
  provider_customer_id VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  queries_used INTEGER DEFAULT 0,
  queries_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_provider_sub_id ON subscriptions(provider_subscription_id);

-- subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su suscripcion"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT y UPDATE sin restriccion de auth.uid() porque el webhook
-- (service_role) necesita poder insertar/actualizar suscripciones
CREATE POLICY "Service role inserta suscripciones"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role actualiza suscripciones"
  ON subscriptions FOR UPDATE
  USING (true);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
