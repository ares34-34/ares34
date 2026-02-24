import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr';
import type {
  UserConfig,
  Conversation,
  ARESClassification,
  Perspective,
  CompanyDocument,
  CompanyProfile,
  CEOContextSnapshot,
  EntityDeliberation,
  EntityName,
  EntityPosition,
  TensionPoint,
  EntityWeightingMatrix,
  EntityWeight,
  MemberWeight,
} from './types';

// ============================================================
// SUPABASE CLIENTS
// ============================================================

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

// ============================================================
// USER CONFIG
// ============================================================

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

// ============================================================
// CONVERSATIONS & DELIBERATIONS
// ============================================================

export async function getConversations(userId: string, limit: number = 20): Promise<Conversation[]> {
  const supabase = createAdminClient();

  // Try v2 join (entity_deliberations + decision_logs), fallback to v1
  const v2Result = await supabase
    .from('conversations')
    .select(`
      *,
      deliberation:deliberations(*),
      entity_deliberations_join:entity_deliberations(entity, perspectives, synthesis),
      decision_log_join:decision_logs(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  // If v2 tables don't exist, fall back to legacy join
  if (v2Result.error) {
    const v1Result = await supabase
      .from('conversations')
      .select(`
        *,
        deliberation:deliberations(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (v1Result.error) throw new Error(`Error al obtener conversaciones: ${v1Result.error.message}`);

    return (v1Result.data || []).map((conv: Record<string, unknown>) => ({
      ...conv,
      deliberation: Array.isArray(conv.deliberation)
        ? conv.deliberation[0] || undefined
        : conv.deliberation || undefined,
    })) as Conversation[];
  }

  return (v2Result.data || []).map((conv: Record<string, unknown>) => {
    // Handle deliberation (join returns array, take first)
    const rawDelib = Array.isArray(conv.deliberation)
      ? (conv.deliberation as Record<string, unknown>[])[0] || undefined
      : conv.deliberation || undefined;

    // Handle entity_deliberations from v2 join
    const entityDelibsRaw = Array.isArray(conv.entity_deliberations_join)
      ? conv.entity_deliberations_join as Array<Record<string, unknown>>
      : [];

    // Convert to EntityDeliberation format
    const entityDeliberations = entityDelibsRaw.map((ed: Record<string, unknown>) => ({
      entity_name: ed.entity as EntityName,
      perspectives: (ed.perspectives || []) as Perspective[],
      synthesis: (ed.synthesis || '') as string,
      consensus_level: 0,
    }));

    // Merge entity_deliberations into deliberation object
    const deliberation = rawDelib
      ? {
          ...rawDelib as Record<string, unknown>,
          entity_deliberations: entityDeliberations.length > 0
            ? entityDeliberations
            : (rawDelib as Record<string, unknown>).entity_deliberations || [],
        }
      : undefined;

    // Handle decision_log from v2 join
    const rawDecisionLog = Array.isArray(conv.decision_log_join)
      ? (conv.decision_log_join as Record<string, unknown>[])[0] || undefined
      : conv.decision_log_join || undefined;

    // Return cleaned object (remove raw join keys)
    const { entity_deliberations_join: _ej, decision_log_join: _dj, ...rest } = conv;

    return {
      ...rest,
      deliberation,
      decision_log: rawDecisionLog,
    };
  }) as Conversation[];
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

// ============================================================
// SUBSCRIPTION HELPERS
// ============================================================

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

  // Enterprise: check subscription by tenant_id first
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId)
    .single();

  let subscription = null;

  if (tenantUser?.tenant_id) {
    // Look up subscription by tenant_id
    const { data: tenantSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', tenantUser.tenant_id)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .single();

    subscription = tenantSub;
  }

  if (!subscription) {
    // Fallback: legacy lookup by user_id
    const { data: userSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    subscription = userSub;
  }

  if (!subscription) {
    // Sin registro de suscripción → sin acceso
    return {
      plan: 'none',
      status: 'none',
      is_active: false,
      queries_used: 0,
      queries_limit: null,
      can_query: false,
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

// ============================================================
// COMPANY DOCUMENTS
// ============================================================

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

// ============================================================
// COMPANY CONTEXT (legacy free-form + documents)
// ============================================================

export async function getCompanyContext(userId: string): Promise<{
  companyContext: string;
  documentTexts: string[];
}> {
  const supabase = createAdminClient();

  // Get free-form context from user_config
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

// ============================================================
// COMPANY PROFILE (Onboarding Layer 1 - 50 preguntas factuales)
// ============================================================

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as CompanyProfile;
}

export async function saveCompanyProfile(
  userId: string,
  profile: Partial<CompanyProfile>
): Promise<CompanyProfile> {
  const supabase = createAdminClient();

  // Strip id/user_id/timestamps to avoid upsert conflicts
  const { id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...fields } = profile;

  const { data, error } = await supabase
    .from('company_profiles')
    .upsert({
      user_id: userId,
      ...fields,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar perfil de empresa: ${error.message}`);
  return data as CompanyProfile;
}

// ============================================================
// CEO CONTEXT SNAPSHOT (Onboarding Layer 2 - 28 preguntas conversacionales)
// ============================================================

export async function getCEOContextSnapshot(userId: string): Promise<CEOContextSnapshot | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('ceo_context_snapshot')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as CEOContextSnapshot;
}

export async function saveCEOContextSnapshot(
  userId: string,
  context: Partial<CEOContextSnapshot>
): Promise<CEOContextSnapshot> {
  const supabase = createAdminClient();

  // Strip id/user_id/timestamps to avoid upsert conflicts
  const { id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...fields } = context;

  const { data, error } = await supabase
    .from('ceo_context_snapshot')
    .upsert({
      user_id: userId,
      ...fields,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar contexto del CEO: ${error.message}`);
  return data as CEOContextSnapshot;
}

// ============================================================
// INITIAL DIAGNOSTIC (post-onboarding, generado por IA)
// ============================================================

export interface InitialDiagnostic {
  id: string;
  user_id: string;
  structural_radiography: string | null;
  role_conflict_map: string | null;
  vulnerabilities: string | null;
  hidden_strengths: string | null;
  strategic_questions: string | null;
  generated_at: string;
}

export async function getInitialDiagnostic(userId: string): Promise<InitialDiagnostic | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('initial_diagnostics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as InitialDiagnostic;
}

export async function saveInitialDiagnostic(
  userId: string,
  diagnostic: {
    structural_radiography?: string;
    role_conflict_map?: string;
    vulnerabilities?: string;
    hidden_strengths?: string;
    strategic_questions?: string;
  }
): Promise<InitialDiagnostic> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('initial_diagnostics')
    .upsert({
      user_id: userId,
      ...diagnostic,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar diagnóstico inicial: ${error.message}`);
  return data as InitialDiagnostic;
}

// ============================================================
// ENTITY DELIBERATIONS (deliberación por entidad: csuite/board/assembly)
// ============================================================

export async function saveEntityDeliberation(
  conversationId: string,
  entity: EntityName,
  perspectives: Perspective[],
  synthesis: string,
  tensions: TensionPoint[]
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('entity_deliberations')
    .upsert({
      conversation_id: conversationId,
      entity,
      perspectives,
      synthesis,
      tensions,
    }, { onConflict: 'conversation_id,entity' });

  if (error) throw new Error(`Error al guardar deliberación de entidad (${entity}): ${error.message}`);
}

export async function getEntityDeliberations(
  conversationId: string
): Promise<EntityDeliberation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('entity_deliberations')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Error al obtener deliberaciones de entidad: ${error.message}`);

  return (data || []).map((row: Record<string, unknown>) => ({
    entity_name: row.entity as EntityName,
    perspectives: (row.perspectives || []) as Perspective[],
    synthesis: (row.synthesis || '') as string,
    consensus_level: 0, // Calculated at application layer if needed
  })) as EntityDeliberation[];
}

// ============================================================
// DECISION TRACKING (logs de decisión con reacción del CEO)
// ============================================================

export async function saveDecisionLog(
  conversationId: string,
  entityPositions: EntityPosition[],
  tensionsDetected: TensionPoint[],
  finalSynthesis: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('decision_logs')
    .upsert({
      conversation_id: conversationId,
      entity_positions: entityPositions,
      tensions_detected: tensionsDetected,
      final_synthesis: finalSynthesis,
    }, { onConflict: 'conversation_id' });

  if (error) throw new Error(`Error al guardar log de decisión: ${error.message}`);
}

export async function updateDecisionReaction(
  conversationId: string,
  reaction: 'accepted' | 'rejected' | 'modified' | 'deferred',
  notes?: string
): Promise<void> {
  const supabase = createAdminClient();
  // Upsert: create if not exists, update if exists
  const { error } = await supabase
    .from('decision_logs')
    .upsert({
      conversation_id: conversationId,
      ceo_reaction: reaction,
      reaction_notes: notes || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' });

  if (error) throw new Error(`Error al actualizar reacción del CEO: ${error.message}`);
}

export async function updateDecisionOutcome(
  conversationId: string,
  outcome: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('decision_logs')
    .upsert({
      conversation_id: conversationId,
      real_world_outcome: outcome,
      outcome_recorded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' });

  if (error) throw new Error(`Error al registrar resultado de la decisión: ${error.message}`);
}

// ============================================================
// ENTITY WEIGHTING MATRIX (pesos de influencia por entidad)
// ============================================================

export async function getLatestWeights(userId: string): Promise<EntityWeightingMatrix | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('entity_weighting_matrix')
    .select('*')
    .eq('user_id', userId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  // Map DB columns (csuite_weight, board_weight, assembly_weight as 0-1 decimals)
  // to the TypeScript interface (entity_weights as 0-100 integers)
  return {
    id: data.id,
    user_id: data.user_id,
    entity_weights: [
      { entity: 'csuite' as EntityName, weight: Math.round(Number(data.csuite_weight) * 100) },
      { entity: 'board' as EntityName, weight: Math.round(Number(data.board_weight) * 100) },
      { entity: 'assembly' as EntityName, weight: Math.round(Number(data.assembly_weight) * 100) },
    ] as EntityWeight[],
    member_weights: (Array.isArray(data.member_weights)
      ? data.member_weights
      : []) as MemberWeight[],
    version: data.version,
    reason_for_change: data.reason || null,
    created_at: data.created_at,
  } as EntityWeightingMatrix;
}

export async function saveNewWeights(
  userId: string,
  weights: {
    csuite_weight: number; // 0.0 - 1.0
    board_weight: number;
    assembly_weight: number;
    member_weights?: MemberWeight[];
  },
  reason: string
): Promise<void> {
  const supabase = createAdminClient();

  // Get current max version for this user
  const { data: current } = await supabase
    .from('entity_weighting_matrix')
    .select('version')
    .eq('user_id', userId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (current?.version || 0) + 1;

  const { error } = await supabase
    .from('entity_weighting_matrix')
    .insert({
      user_id: userId,
      version: nextVersion,
      csuite_weight: weights.csuite_weight,
      board_weight: weights.board_weight,
      assembly_weight: weights.assembly_weight,
      member_weights: weights.member_weights || {},
      reason,
    });

  if (error) throw new Error(`Error al guardar nuevos pesos de entidad: ${error.message}`);
}

// ============================================================
// EVOLUTION HISTORY (historial de cambios de pesos)
// ============================================================

export interface EvolutionHistoryEntry {
  id: string;
  user_id: string;
  from_version: number | null;
  to_version: number | null;
  changes: Record<string, unknown>;
  trigger_type: 'ceo_reaction' | 'outcome' | 'pattern' | 'manual';
  trigger_detail: string | null;
  created_at: string;
}

export async function getEvolutionHistory(
  userId: string,
  limit: number = 20
): Promise<EvolutionHistoryEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('evolution_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error al obtener historial de evolución: ${error.message}`);
  return (data || []) as EvolutionHistoryEntry[];
}

export async function saveEvolutionEntry(
  userId: string,
  fromVersion: number,
  toVersion: number,
  changes: Record<string, unknown>,
  triggerType: 'ceo_reaction' | 'outcome' | 'pattern' | 'manual',
  triggerDetail: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('evolution_history')
    .insert({
      user_id: userId,
      from_version: fromVersion,
      to_version: toVersion,
      changes,
      trigger_type: triggerType,
      trigger_detail: triggerDetail,
    });

  if (error) throw new Error(`Error al guardar entrada de evolución: ${error.message}`);
}

// ============================================================
// TENANT & AUTH ENTERPRISE HELPERS
// ============================================================

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'suspended' | 'deactivated';
  must_change_password: boolean;
  password_changed_at: string | null;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  status: 'active' | 'suspended' | 'cancelled';
  max_users: number;
  plan: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getTenantUser(userId: string): Promise<TenantUser | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as TenantUser;
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (error || !data) return null;
  return data as Tenant;
}

export async function updateTenantUser(
  userId: string,
  updates: Partial<Omit<TenantUser, 'id' | 'tenant_id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('tenant_users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw new Error(`Error al actualizar tenant_user: ${error.message}`);
}

export async function logAuthEvent(
  userId: string,
  email: string,
  eventType: string,
  options?: {
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('auth_logs')
    .insert({
      user_id: userId,
      email,
      event_type: eventType,
      ip_address: options?.ip || null,
      user_agent: options?.userAgent || null,
      metadata: options?.metadata || {},
    });

  if (error) {
    // Non-fatal: don't throw, just log
    console.error('Error logging auth event:', error.message);
  }
}

// ============================================================
// ENHANCED COMPANY CONTEXT (combina company_profiles + ceo_context + documents)
// ============================================================

export interface FullCompanyContext {
  companyProfile: CompanyProfile | null;
  ceoContext: CEOContextSnapshot | null;
  companyContext: string; // Legacy free-form from user_config
  documentTexts: string[];
}

export async function getFullCompanyContext(userId: string): Promise<FullCompanyContext> {
  const supabase = createAdminClient();

  // Run all queries in parallel for speed
  const [profileResult, ceoContextResult, configResult, docsResult] = await Promise.all([
    supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('ceo_context_snapshot')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_config')
      .select('company_context')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('company_documents')
      .select('extracted_text')
      .eq('user_id', userId)
      .eq('status', 'ready')
      .order('created_at', { ascending: false }),
  ]);

  return {
    companyProfile: (profileResult.data as CompanyProfile) || null,
    ceoContext: (ceoContextResult.data as CEOContextSnapshot) || null,
    companyContext: (configResult.data?.company_context as string) || '',
    documentTexts: (docsResult.data || [])
      .map((d: Record<string, unknown>) => (d.extracted_text as string) || '')
      .filter((t: string) => t.length > 0),
  };
}
