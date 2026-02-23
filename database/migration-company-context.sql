-- Migration: Contexto de empresa + documentos
-- Ejecutar en Supabase SQL Editor

-- 1. Nueva tabla para documentos de la empresa
CREATE TABLE IF NOT EXISTS company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  char_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_docs_user ON company_documents(user_id);

-- RLS
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_docs_select" ON company_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_own_docs_insert" ON company_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_docs_update" ON company_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_own_docs_delete" ON company_documents
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Agregar campo de contexto libre a user_config
ALTER TABLE user_config ADD COLUMN IF NOT EXISTS company_context TEXT DEFAULT '';

-- 3. NOTA: Crear bucket "company-documents" en Supabase Dashboard → Storage
--    - Bucket privado
--    - Max file size: 10MB
--    - Allowed MIME types: application/pdf
