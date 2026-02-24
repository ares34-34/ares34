import { NextRequest, NextResponse } from 'next/server';

// ============================================
// OAUTH CALLBACK DESHABILITADO
// ARES34 ya no permite autenticacion via Google OAuth.
// Solo se permite login con email + password,
// donde los usuarios son provisionados manualmente.
// ============================================

export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl;

  // Redirigir a login con mensaje de error
  return NextResponse.redirect(
    `${origin}/login?error=oauth_disabled`
  );
}
