import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserConfig, getSubscriptionStatus, incrementQueriesUsed } from '@/lib/supabase';
import { processARESRequest } from '@/lib/ares-engine';

// Rate limiting: max 10 requests per minute per user (in-memory, per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

const MAX_QUESTION_LENGTH = 5000;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Estás enviando muchas consultas. Espera un momento antes de intentar de nuevo.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes enviar una pregunta válida' },
        { status: 400 }
      );
    }

    if (question.trim().length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Tu pregunta es demasiado larga. El máximo es ${MAX_QUESTION_LENGTH} caracteres.` },
        { status: 400 }
      );
    }

    const config = await getUserConfig(user.id);
    if (!config?.onboarding_completed) {
      return NextResponse.json(
        { success: false, error: 'Necesitas completar tu configuración primero' },
        { status: 400 }
      );
    }

    // Verificar suscripción activa y cuota de consultas
    const subscription = await getSubscriptionStatus(user.id);

    if (!subscription.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tu suscripción no está activa. Elige un plan para seguir consultando a ARES.',
          code: 'SUBSCRIPTION_INACTIVE',
        },
        { status: 403 }
      );
    }

    if (!subscription.can_query) {
      return NextResponse.json(
        {
          success: false,
          error: `Ya usaste tus ${subscription.queries_limit} consultas de este mes. Actualiza tu plan para consultas ilimitadas.`,
          code: 'QUERY_LIMIT_REACHED',
          queries_used: subscription.queries_used,
          queries_limit: subscription.queries_limit,
        },
        { status: 429 }
      );
    }

    const result = await processARESRequest(user.id, question.trim(), subscription.plan);

    // Incrementar contador de consultas usadas
    await incrementQueriesUsed(user.id);

    return NextResponse.json({
      success: true,
      data: result,
      subscription: {
        plan: subscription.plan,
        queries_used: subscription.queries_used + 1,
        queries_limit: subscription.queries_limit,
      },
    });
  } catch (error) {
    console.error('Error en /api/ares:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo procesar tu pregunta. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
