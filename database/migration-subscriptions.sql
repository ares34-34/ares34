-- ============================================
-- ARES34 - Migracion: Tabla subscriptions
-- Ejecutar en Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/gxtbvsdclblkngycdmkz/sql/new
-- ============================================

-- Crear tabla subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id ON subscriptions(provider_subscription_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden VER su propia suscripcion
CREATE POLICY "Usuarios ven su suscripcion"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT y UPDATE abiertos porque el webhook usa service_role key
-- (service_role bypasses RLS de todos modos, pero por si acaso)
CREATE POLICY "Service role inserta suscripciones"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role actualiza suscripciones"
  ON subscriptions FOR UPDATE
  USING (true);

-- Trigger para actualizar updated_at automaticamente
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Verificacion: si todo salio bien, esta query debe devolver la estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
