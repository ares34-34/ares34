#!/usr/bin/env tsx
// ============================================
// ARES34 — Reset Password (Admin)
// Usage: npm run admin:reset-password -- --email=user@company.com --password=NewTemp123!
// ============================================

import { getAdminClient, parseArgs, findUserByEmail, findTenantUserByUserId, success, fail, table, info } from './admin-utils';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.email;
  const newPassword = args.password;
  const forceChange = args['no-force-change'] !== 'true';

  if (!email || !newPassword) {
    fail('Uso: npm run admin:reset-password -- --email=user@company.com --password=NewTemp123!');
    console.log('  Opciones requeridas:');
    console.log('    --email=usuario@empresa.com');
    console.log('    --password=NuevaContraseñaTemporal123!');
    console.log('');
    console.log('  Opciones opcionales:');
    console.log('    --no-force-change=true    (no forzar cambio en próximo login)');
    process.exit(1);
  }

  // Find user
  info(`Buscando usuario ${email}...`);
  const user = await findUserByEmail(email);

  if (!user) {
    fail(`Usuario no encontrado: ${email}`);
    process.exit(1);
  }

  const supabase = getAdminClient();

  // Update password via admin API
  info('Actualizando contraseña...');
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (updateError) {
    fail(`Error al actualizar contraseña: ${updateError.message}`);
    process.exit(1);
  }

  // Update tenant_users: set must_change_password + reset lock
  if (forceChange) {
    const tenantUser = await findTenantUserByUserId(user.id);
    if (tenantUser) {
      const { error: tuError } = await supabase
        .from('tenant_users')
        .update({
          must_change_password: true,
          failed_login_attempts: 0,
          locked_until: null,
        })
        .eq('user_id', user.id);

      if (tuError) {
        fail(`Contraseña actualizada pero error al actualizar tenant_users: ${tuError.message}`);
      }
    }
  }

  // Log the event
  await supabase.from('auth_logs').insert({
    user_id: user.id,
    email,
    event_type: 'password_reset_by_admin',
    ip_address: '127.0.0.1',
    user_agent: 'ARES34-Admin-CLI',
    metadata: { force_change: forceChange },
  });

  success(`Contraseña reseteada exitosamente`);
  table({
    'User ID': user.id,
    'Email': email,
    'Cambio obligatorio': forceChange ? 'Sí (en próximo login)' : 'No',
    'Cuenta desbloqueada': 'Sí (intentos fallidos reseteados)',
  });

  console.log('📋 Instrucciones para el usuario:');
  console.log(`  1. Ir a https://ares34.com/login`);
  console.log(`  2. Iniciar sesión con: ${email} / ${newPassword}`);
  if (forceChange) {
    console.log(`  3. Se le pedirá cambiar su contraseña`);
  }
}

main().catch((err) => {
  fail(`Error inesperado: ${err.message}`);
  process.exit(1);
});
