#!/usr/bin/env tsx
// ============================================
// ARES34 — Suspender/Reactivar Usuario o Tenant
// Usage:
//   npm run admin:suspend -- --user=user@company.com
//   npm run admin:suspend -- --tenant=UUID
//   npm run admin:suspend -- --user=user@company.com --reactivate
//   npm run admin:suspend -- --tenant=UUID --reactivate
// ============================================

import {
  getAdminClient,
  parseArgs,
  findUserByEmail,
  findTenantById,
  findTenantUserByUserId,
  success,
  fail,
  table,
  info,
} from './admin-utils';

async function suspendUser(email: string, reactivate: boolean) {
  const supabase = getAdminClient();
  const user = await findUserByEmail(email);

  if (!user) {
    fail(`Usuario no encontrado: ${email}`);
    process.exit(1);
  }

  const tenantUser = await findTenantUserByUserId(user.id);
  if (!tenantUser) {
    fail(`El usuario ${email} no está vinculado a ningún tenant`);
    process.exit(1);
  }

  const newStatus = reactivate ? 'active' : 'suspended';
  const action = reactivate ? 'reactivado' : 'suspendido';

  if (tenantUser.status === newStatus) {
    info(`El usuario ${email} ya está ${newStatus}`);
    process.exit(0);
  }

  const { error } = await supabase
    .from('tenant_users')
    .update({ status: newStatus })
    .eq('user_id', user.id);

  if (error) {
    fail(`Error al ${reactivate ? 'reactivar' : 'suspender'} usuario: ${error.message}`);
    process.exit(1);
  }

  // Log the event
  await supabase.from('auth_logs').insert({
    user_id: user.id,
    email,
    event_type: reactivate ? 'user_reactivated_by_admin' : 'user_suspended_by_admin',
    ip_address: '127.0.0.1',
    user_agent: 'ARES34-Admin-CLI',
    metadata: { previous_status: tenantUser.status, new_status: newStatus },
  });

  success(`Usuario ${action}`);
  table({
    'User ID': user.id,
    'Email': email,
    'Status anterior': tenantUser.status,
    'Status nuevo': newStatus,
  });
}

async function suspendTenant(tenantId: string, reactivate: boolean) {
  const supabase = getAdminClient();
  const tenant = await findTenantById(tenantId);

  if (!tenant) {
    fail(`Tenant no encontrado: ${tenantId}`);
    process.exit(1);
  }

  const newStatus = reactivate ? 'active' : 'suspended';
  const action = reactivate ? 'reactivado' : 'suspendido';

  if (tenant.status === newStatus) {
    info(`El tenant "${tenant.company_name}" ya está ${newStatus}`);
    process.exit(0);
  }

  const { error } = await supabase
    .from('tenants')
    .update({ status: newStatus })
    .eq('id', tenantId);

  if (error) {
    fail(`Error al ${reactivate ? 'reactivar' : 'suspender'} tenant: ${error.message}`);
    process.exit(1);
  }

  // Count affected users
  const { count } = await supabase
    .from('tenant_users')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  // Log the event
  await supabase.from('auth_logs').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    email: 'admin@ares34.com',
    event_type: reactivate ? 'tenant_reactivated_by_admin' : 'tenant_suspended_by_admin',
    ip_address: '127.0.0.1',
    user_agent: 'ARES34-Admin-CLI',
    metadata: {
      tenant_id: tenantId,
      company_name: tenant.company_name,
      previous_status: tenant.status,
      new_status: newStatus,
    },
  });

  success(`Tenant ${action}`);
  table({
    'Tenant ID': tenantId,
    'Empresa': tenant.company_name,
    'Status anterior': tenant.status,
    'Status nuevo': newStatus,
    'Usuarios activos afectados': count || 0,
  });

  if (!reactivate) {
    console.log('⚠️  Todos los usuarios de este tenant quedarán bloqueados.');
    console.log('    El middleware verificará el status del tenant en cada request.');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.user;
  const tenantId = args.tenant;
  const reactivate = args.reactivate === 'true';

  if (!email && !tenantId) {
    fail('Uso:');
    console.log('  Suspender usuario:   npm run admin:suspend -- --user=email@empresa.com');
    console.log('  Suspender tenant:    npm run admin:suspend -- --tenant=UUID');
    console.log('  Reactivar usuario:   npm run admin:suspend -- --user=email@empresa.com --reactivate=true');
    console.log('  Reactivar tenant:    npm run admin:suspend -- --tenant=UUID --reactivate=true');
    process.exit(1);
  }

  if (email) {
    await suspendUser(email, reactivate);
  } else if (tenantId) {
    await suspendTenant(tenantId, reactivate);
  }
}

main().catch((err) => {
  fail(`Error inesperado: ${err.message}`);
  process.exit(1);
});
