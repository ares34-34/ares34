#!/usr/bin/env tsx
// ============================================
// ARES34 — Crear Tenant (Organización)
// Usage: npm run admin:create-tenant "Empresa S.A."
//        npm run admin:create-tenant "Empresa S.A." -- --plan=empresarial --max-users=10
// ============================================

import { getAdminClient, parseArgs, success, fail, table, info } from './admin-utils';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const companyName = args._positional;
  const plan = args.plan || 'fundador';
  const maxUsers = parseInt(args['max-users'] || '5', 10);
  const notes = args.notes || null;

  if (!companyName) {
    fail('Uso: npm run admin:create-tenant "Nombre de la empresa"');
    console.log('  Opciones:');
    console.log('    --plan=fundador|empresarial  (default: fundador)');
    console.log('    --max-users=N                (default: 5)');
    console.log('    --notes="Nota opcional"');
    process.exit(1);
  }

  info(`Creando tenant: "${companyName}"`);

  const supabase = getAdminClient();

  // Check if tenant already exists
  const { data: existing } = await supabase
    .from('tenants')
    .select('id, company_name')
    .ilike('company_name', companyName)
    .limit(1);

  if (existing && existing.length > 0) {
    fail(`Ya existe un tenant con nombre similar: "${existing[0].company_name}" (${existing[0].id})`);
    process.exit(1);
  }

  // Create tenant
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      company_name: companyName,
      status: 'active',
      max_users: maxUsers,
      plan,
      notes,
    })
    .select()
    .single();

  if (error || !tenant) {
    fail(`Error al crear tenant: ${error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  success(`Tenant creado exitosamente`);
  table({
    'ID': tenant.id,
    'Empresa': tenant.company_name,
    'Status': tenant.status,
    'Plan': tenant.plan,
    'Max usuarios': tenant.max_users,
    'Creado': tenant.created_at,
  });

  console.log('Siguiente paso:');
  console.log(`  npm run admin:create-user -- --email=usuario@empresa.com --password=TempPass123! --name="Nombre" --tenant=${tenant.id}`);
}

main().catch((err) => {
  fail(`Error inesperado: ${err.message}`);
  process.exit(1);
});
