#!/usr/bin/env tsx
// ============================================
// ARES34 — Crear Usuario Enterprise
// Usage: npm run admin:create-user -- --email=user@company.com --password=TempPass123! --name="Juan Pérez" --tenant=UUID
//        npm run admin:create-user -- --email=user@company.com --password=TempPass123! --name="Juan" --tenant=UUID --role=admin
// ============================================

import { getAdminClient, parseArgs, findTenantById, success, fail, table, info, warn } from './admin-utils';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.email;
  const password = args.password;
  const name = args.name;
  const tenantId = args.tenant;
  const role = args.role || 'member';
  const mustChangePassword = args['no-change-password'] !== 'true';

  if (!email || !password || !name || !tenantId) {
    fail('Uso: npm run admin:create-user -- --email=x --password=x --name="x" --tenant=UUID');
    console.log('  Opciones requeridas:');
    console.log('    --email=usuario@empresa.com');
    console.log('    --password=ContraseñaTemporal123!');
    console.log('    --name="Nombre Completo"');
    console.log('    --tenant=UUID-del-tenant');
    console.log('');
    console.log('  Opciones opcionales:');
    console.log('    --role=admin|member          (default: member)');
    console.log('    --no-change-password=true     (no forzar cambio de contraseña)');
    process.exit(1);
  }

  // Validate role
  if (!['admin', 'member'].includes(role)) {
    fail('El rol debe ser "admin" o "member"');
    process.exit(1);
  }

  // Verify tenant exists
  info(`Verificando tenant ${tenantId}...`);
  const tenant = await findTenantById(tenantId);
  if (!tenant) {
    fail(`Tenant no encontrado: ${tenantId}`);
    console.log('Tip: usa "npm run admin:create-tenant" primero');
    process.exit(1);
  }

  if (tenant.status !== 'active') {
    fail(`El tenant "${tenant.company_name}" está ${tenant.status}. Actívalo primero.`);
    process.exit(1);
  }

  const supabase = getAdminClient();

  // Check max_users limit
  const { count } = await supabase
    .from('tenant_users')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (count !== null && count >= tenant.max_users) {
    fail(`El tenant "${tenant.company_name}" ya tiene ${count}/${tenant.max_users} usuarios activos. Aumenta el límite primero.`);
    process.exit(1);
  }

  // Check if email already exists in Supabase Auth
  info(`Creando usuario ${email}...`);
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === email);

  if (existingUser) {
    // User exists in auth — check if already in a tenant
    const { data: existingTU } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', existingUser.id)
      .single();

    if (existingTU) {
      fail(`El usuario ${email} ya está asignado al tenant ${existingTU.tenant_id}`);
      process.exit(1);
    }

    // User exists in auth but not in tenant_users — link them
    warn(`El usuario ${email} ya existe en auth. Vinculándolo al tenant...`);

    const { error: tuError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenantId,
        user_id: existingUser.id,
        role,
        status: 'active',
        must_change_password: mustChangePassword,
      });

    if (tuError) {
      fail(`Error al vincular usuario al tenant: ${tuError.message}`);
      process.exit(1);
    }

    // Create user_config if not exists
    const { data: existingConfig } = await supabase
      .from('user_config')
      .select('id')
      .eq('user_id', existingUser.id)
      .single();

    if (!existingConfig) {
      await supabase.from('user_config').insert({
        user_id: existingUser.id,
        tenant_id: tenantId,
        onboarding_completed: false,
      });
    } else {
      // Update tenant_id on existing config
      await supabase
        .from('user_config')
        .update({ tenant_id: tenantId })
        .eq('user_id', existingUser.id);
    }

    // Log the event
    await supabase.from('auth_logs').insert({
      user_id: existingUser.id,
      email,
      event_type: 'user_linked_to_tenant',
      ip_address: '127.0.0.1',
      user_agent: 'ARES34-Admin-CLI',
      metadata: { tenant_id: tenantId, role, linked_existing: true },
    });

    success(`Usuario existente vinculado al tenant`);
    table({
      'User ID': existingUser.id,
      'Email': email,
      'Tenant': `${tenant.company_name} (${tenantId})`,
      'Rol': role,
      'Cambio contraseña': mustChangePassword ? 'Sí (obligatorio en primer login)' : 'No',
    });
    return;
  }

  // Create new user in Supabase Auth
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email verification
    user_metadata: { full_name: name },
  });

  if (createError || !newUser?.user) {
    fail(`Error al crear usuario en auth: ${createError?.message || 'Unknown error'}`);
    process.exit(1);
  }

  // Create tenant_users entry
  const { error: tuError } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenantId,
      user_id: newUser.user.id,
      role,
      status: 'active',
      must_change_password: mustChangePassword,
    });

  if (tuError) {
    fail(`Error al crear tenant_user: ${tuError.message}`);
    // Try to clean up the auth user
    await supabase.auth.admin.deleteUser(newUser.user.id);
    process.exit(1);
  }

  // Create user_config entry
  await supabase.from('user_config').insert({
    user_id: newUser.user.id,
    tenant_id: tenantId,
    onboarding_completed: false,
  });

  // Log the event
  await supabase.from('auth_logs').insert({
    user_id: newUser.user.id,
    email,
    event_type: 'user_created_by_admin',
    ip_address: '127.0.0.1',
    user_agent: 'ARES34-Admin-CLI',
    metadata: { tenant_id: tenantId, role, name },
  });

  success(`Usuario creado exitosamente`);
  table({
    'User ID': newUser.user.id,
    'Email': email,
    'Nombre': name,
    'Tenant': `${tenant.company_name} (${tenantId})`,
    'Rol': role,
    'Cambio contraseña': mustChangePassword ? 'Sí (obligatorio en primer login)' : 'No',
  });

  if (mustChangePassword) {
    console.log('📋 Instrucciones para el usuario:');
    console.log(`  1. Ir a https://ares34.com/login`);
    console.log(`  2. Iniciar sesión con: ${email} / ${password}`);
    console.log(`  3. Se le pedirá cambiar su contraseña en el primer acceso`);
    console.log(`  4. Después completará el onboarding de ARES34`);
  }
}

main().catch((err) => {
  fail(`Error inesperado: ${err.message}`);
  process.exit(1);
});
