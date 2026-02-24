import { NextResponse } from 'next/server';

// ============================================
// REGISTRO PUBLICO DESHABILITADO
// ARES34 es ahora una plataforma enterprise privada.
// Los usuarios son creados manualmente por administradores
// via scripts CLI (npm run admin:create-user).
// ============================================

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'El registro no está disponible. ARES34 es una plataforma privada por invitación. Contacta a tu administrador para obtener acceso.',
    },
    { status: 403 }
  );
}
