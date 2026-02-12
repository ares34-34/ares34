import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { UserConfig, Conversation, Archetype, ARESClassification, Perspective } from './types';

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
    // Check if user is in free trial (5 days from account creation)
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (user) {
      const userCreated = new Date(user.created_at);
      const trialEnd = new Date(userCreated.getTime() + 5 * 24 * 60 * 60 * 1000);
      const isInTrial = new Date() < trialEnd;
      return {
        plan: 'trial',
        status: isInTrial ? 'trialing' : 'inactive',
        is_active: isInTrial,
        queries_used: 0,
        queries_limit: 20,
        can_query: isInTrial,
      };
    }
    return {
      plan: 'none',
      status: 'inactive',
      is_active: false,
      queries_used: 0,
      queries_limit: 0,
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

  // First try to increment on subscriptions table
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
