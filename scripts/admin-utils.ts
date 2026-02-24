// ============================================
// ARES34 — Admin CLI Utilities
// Shared Supabase admin client + helpers for CLI scripts
// ============================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Singleton admin client
let _adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _adminClient;
}

// ============================================
// Shared types
// ============================================

export interface Tenant {
  id: string;
  company_name: string;
  status: string;
  max_users: number;
  plan: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  status: string;
  must_change_password: boolean;
  password_changed_at: string | null;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
}

// ============================================
// Console helpers
// ============================================

export function success(msg: string) {
  console.log(`\n✅ ${msg}`);
}

export function info(msg: string) {
  console.log(`ℹ️  ${msg}`);
}

export function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
}

export function fail(msg: string) {
  console.error(`\n❌ ${msg}`);
}

export function table(data: Record<string, unknown>) {
  const maxKey = Math.max(...Object.keys(data).map(k => k.length));
  console.log('');
  for (const [key, value] of Object.entries(data)) {
    console.log(`  ${key.padEnd(maxKey + 2)} ${value}`);
  }
  console.log('');
}

// ============================================
// Lookup helpers
// ============================================

export async function findTenantByName(name: string): Promise<Tenant | null> {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .ilike('company_name', `%${name}%`)
    .limit(1)
    .single();
  return data as Tenant | null;
}

export async function findTenantById(id: string): Promise<Tenant | null> {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();
  return data as Tenant | null;
}

export async function findUserByEmail(email: string) {
  const supabase = getAdminClient();
  const { data } = await supabase.auth.admin.listUsers();
  if (!data?.users) return null;
  return data.users.find(u => u.email === email) || null;
}

export async function findTenantUserByUserId(userId: string): Promise<TenantUser | null> {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data as TenantUser | null;
}

export async function logAuthEvent(
  userId: string,
  email: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  const supabase = getAdminClient();
  await supabase.from('auth_logs').insert({
    user_id: userId,
    email,
    event_type: eventType,
    ip_address: '127.0.0.1',
    user_agent: 'ARES34-Admin-CLI',
    metadata: metadata || {},
  });
}

// ============================================
// Arg parsing helper
// ============================================

export function parseArgs(args: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      parsed[key] = valueParts.join('=') || 'true';
    } else {
      // Positional arg
      if (!parsed._positional) parsed._positional = '';
      parsed._positional += (parsed._positional ? ' ' : '') + arg;
    }
  }
  return parsed;
}
