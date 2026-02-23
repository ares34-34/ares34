const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  // 1. Create storage bucket
  const { data: buckets } = await sb.storage.listBuckets();
  const bucketExists = buckets && buckets.some(b => b.name === 'company-documents');

  if (!bucketExists) {
    const { error } = await sb.storage.createBucket('company-documents', {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['application/pdf']
    });
    if (error) {
      console.log('Bucket error:', error.message);
    } else {
      console.log('OK: Bucket company-documents created');
    }
  } else {
    console.log('OK: Bucket company-documents already exists');
  }

  // 2. Check if company_documents table exists
  const { error: tableErr } = await sb.from('company_documents').select('id').limit(1);
  if (tableErr && tableErr.message.includes('Could not find')) {
    console.log('NEED: Table company_documents does not exist — run SQL migration manually');
    console.log('SQL to run in Supabase SQL Editor:');
    console.log(`
CREATE TABLE company_documents (
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
CREATE INDEX idx_company_docs_user ON company_documents(user_id);
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_docs_select" ON company_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_docs_insert" ON company_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_docs_update" ON company_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_own_docs_delete" ON company_documents FOR DELETE USING (auth.uid() = user_id);
    `);
  } else {
    console.log('OK: Table company_documents exists');
  }

  // 3. Check if company_context column exists
  const { error: colErr } = await sb.from('user_config').select('company_context').limit(1);
  if (colErr && colErr.message.includes('company_context')) {
    console.log('NEED: Column company_context missing — run SQL:');
    console.log("ALTER TABLE user_config ADD COLUMN company_context TEXT DEFAULT '';");
  } else {
    console.log('OK: Column company_context exists');
  }
}

migrate().catch(e => console.error('Fatal:', e.message));
