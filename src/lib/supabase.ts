import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { UserConfig, Conversation, Archetype, ARESClassification, Perspective, CompanyDocument } from './types';

// Browser client (for client components)
export function createBrowserClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client (for server components and API routes)
export async function createServerClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can fail in Server Components — this is expected
          }
        },
      },
    }
  );
}

// Admin client (for service role operations - server only)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as UserConfig;
}

export async function saveUserConfig(userId: string, config: Partial<UserConfig>): Promise<UserConfig> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_config')
    .upsert({
      user_id: userId,
      ...config,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar configuración: ${error.message}`);
  return data as UserConfig;
}

export async function getConversations(userId: string, limit: number = 20): Promise<Conversation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      deliberation:deliberations(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error al obtener conversaciones: ${error.message}`);

  return (data || []).map((conv: Record<string, unknown>) => ({
    ...conv,
    deliberation: Array.isArray(conv.deliberation)
      ? conv.deliberation[0] || undefined
      : conv.deliberation || undefined,
  })) as Conversation[];
}

export async function saveConversation(
  userId: string,
  question: string,
  classification: ARESClassification
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      question,
      route_level: classification.level,
      route_reasoning: classification.reasoning,
      route_confidence: classification.confidence,
      route_complexity: classification.complexity,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Error al guardar conversación: ${error.message}`);
  return data.id;
}

export async function saveDeliberation(
  conversationId: string,
  perspectives: Perspective[],
  recommendation: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('deliberations')
    .insert({
      conversation_id: conversationId,
      perspectives,
      recommendation,
    });

  if (error) throw new Error(`Error al guardar deliberación: ${error.message}`);
}

// Subscription helpers
export interface SubscriptionStatus {
  plan: string;
  status: string;
  is_active: boolean;
  queries_used: number;
  queries_limit: number | null;
  can_query: boolean;
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = createAdminClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    // Sin registro de suscripción → dar acceso Fundador
    return {
      plan: 'fundador',
      status: 'active',
      is_active: true,
      queries_used: 0,
      queries_limit: null,
      can_query: true,
    };
  }

  const isActive = ['active', 'trialing'].includes(subscription.status);
  const queriesUsed = subscription.queries_used || 0;
  const queriesLimit = subscription.queries_limit;
  const canQuery = isActive && (queriesLimit === null || queriesUsed < queriesLimit);

  return {
    plan: subscription.plan,
    status: subscription.status,
    is_active: isActive,
    queries_used: queriesUsed,
    queries_limit: queriesLimit,
    can_query: canQuery,
  };
}

export async function incrementQueriesUsed(userId: string): Promise<void> {
  const supabase = createAdminClient();

  // Atomic increment using raw SQL via RPC to avoid race conditions
  // If the RPC function doesn't exist, fall back to regular update
  const { error: rpcError } = await supabase.rpc('increment_queries_used', {
    p_user_id: userId,
  });

  if (rpcError) {
    // Fallback: read-then-write (acceptable for low concurrency)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('queries_used')
      .eq('user_id', userId)
      .single();

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({
          queries_used: (subscription.queries_used || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  }
}

export async function getArchetypes(): Promise<Archetype[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('archetypes')
    .select('*');

  if (error) throw new Error(`Error al obtener arquetipos: ${error.message}`);
  return (data || []) as Archetype[];
}

export async function getArchetypeById(id: string): Promise<Archetype | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('archetypes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Archetype;
}

// --- Company Documents ---

export async function saveDocument(
  userId: string,
  fileName: string,
  fileSize: number,
  storagePath: string
): Promise<CompanyDocument> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('company_documents')
    .insert({
      user_id: userId,
      file_name: fileName,
      file_size: fileSize,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar documento: ${error.message}`);
  return data as CompanyDocument;
}

export async function updateDocumentText(
  docId: string,
  extractedText: string,
  charCount: number
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('company_documents')
    .update({
      extracted_text: extractedText,
      char_count: charCount,
      status: 'ready',
      updated_at: new Date().toISOString(),
    })
    .eq('id', docId);

  if (error) throw new Error(`Error al actualizar documento: ${error.message}`);
}

export async function updateDocumentError(
  docId: string,
  errorMessage: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('company_documents')
    .update({
      status: 'error',
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', docId);

  if (error) throw new Error(`Error al actualizar documento: ${error.message}`);
}

export async function getDocuments(userId: string): Promise<CompanyDocument[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('company_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al obtener documentos: ${error.message}`);
  return (data || []) as CompanyDocument[];
}

export async function deleteDocument(userId: string, docId: string): Promise<void> {
  const supabase = createAdminClient();

  // Get storage path first
  const { data: doc } = await supabase
    .from('company_documents')
    .select('storage_path')
    .eq('id', docId)
    .eq('user_id', userId)
    .single();

  if (doc?.storage_path) {
    await supabase.storage.from('company-documents').remove([doc.storage_path]);
  }

  const { error } = await supabase
    .from('company_documents')
    .delete()
    .eq('id', docId)
    .eq('user_id', userId);

  if (error) throw new Error(`Error al eliminar documento: ${error.message}`);
}

export async function getCompanyContext(userId: string): Promise<{
  companyContext: string;
  documentTexts: string[];
}> {
  const supabase = createAdminClient();

  // Get free-form context
  const { data: config } = await supabase
    .from('user_config')
    .select('company_context')
    .eq('user_id', userId)
    .single();

  // Get extracted text from ready documents (newest first)
  const { data: docs } = await supabase
    .from('company_documents')
    .select('extracted_text')
    .eq('user_id', userId)
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  return {
    companyContext: (config?.company_context as string) || '',
    documentTexts: (docs || [])
      .map(d => (d.extracted_text as string) || '')
      .filter(t => t.length > 0),
  };
}
