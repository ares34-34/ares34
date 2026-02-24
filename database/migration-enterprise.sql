-- ============================================
-- ARES34 - Migracion Enterprise: Acceso Privado
-- Ejecutar en Supabase SQL Editor
-- Fecha: 2026-02-23
-- ============================================

-- ============================================
-- 1. TABLA: tenants
-- ============================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'cancelled')),
  max_users INTEGER DEFAULT 10,
  plan VARCHAR(30) DEFAULT 'enterprise',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- RLS: usuarios ven solo su tenant
CREATE POLICY "Usuarios ven su tenant"
  ON tenants FOR SELECT
  USING (
    id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 2. TABLA: tenant_users (tabla puente)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'user', 'viewer')),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  must_change_password BOOLEAN DEFAULT TRUE,
  password_changed_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id),
  UNIQUE(user_id) -- un usuario solo pertenece a un tenant
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);

ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Usuarios ven su propio registro
CREATE POLICY "Usuarios ven su registro de tenant"
  ON tenant_users FOR SELECT
  USING (user_id = auth.uid());

-- Admins ven todos los usuarios de su tenant
CREATE POLICY "Admins ven usuarios de su tenant"
  ON tenant_users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER tenant_users_updated_at
  BEFORE UPDATE ON tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 3. TABLA: auth_logs (auditoria de autenticacion)
-- ============================================
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  event_type VARCHAR(30) NOT NULL
    CHECK (event_type IN (
      'login_success', 'login_failed', 'password_changed',
      'password_reset', 'account_locked', 'account_unlocked',
      'user_created', 'user_suspended', 'user_deactivated'
    )),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs(email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON auth_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at DESC);

ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins ven logs de su tenant
CREATE POLICY "Admins ven logs de auth de su tenant"
  ON auth_logs FOR SELECT
  USING (
    user_id IN (
      SELECT tu2.user_id FROM tenant_users tu1
      JOIN tenant_users tu2 ON tu1.tenant_id = tu2.tenant_id
      WHERE tu1.user_id = auth.uid() AND tu1.role = 'admin'
    )
  );


-- ============================================
-- 4. Agregar tenant_id a tablas existentes
-- ============================================

-- subscriptions: facturacion por tenant
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);

-- conversations: aislamiento por tenant
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);

-- user_config: aislamiento por tenant
ALTER TABLE user_config ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- company_profiles: aislamiento por tenant
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- company_documents: aislamiento por tenant
ALTER TABLE company_documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);


-- ============================================
-- 5. Backfill: migrar datos existentes
-- ============================================

-- Crear tenant default para usuarios existentes
INSERT INTO tenants (id, company_name, status, plan, notes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ARES34 Cuentas de Prueba',
  'active',
  'enterprise',
  'Tenant default creado durante migracion enterprise. Contiene todas las cuentas de prueba previas.'
)
ON CONFLICT (id) DO NOTHING;

-- Vincular TODOS los usuarios existentes al tenant default
INSERT INTO tenant_users (tenant_id, user_id, role, status, must_change_password)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  'admin',
  'active',
  false  -- usuarios existentes no necesitan cambiar password
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Backfill tenant_id en datos existentes
UPDATE subscriptions
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE conversations
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE user_config
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE company_profiles
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE company_documents
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;


-- ============================================
-- Verificacion
-- ============================================
-- Ejecutar despues de la migracion para verificar:
-- SELECT count(*) FROM tenants;
-- SELECT count(*) FROM tenant_users;
-- SELECT * FROM tenant_users LIMIT 5;
-- SELECT count(*) FROM subscriptions WHERE tenant_id IS NOT NULL;
-- SELECT count(*) FROM conversations WHERE tenant_id IS NOT NULL;
