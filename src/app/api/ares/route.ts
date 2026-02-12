import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserConfig, getSubscriptionStatus, incrementQueriesUsed } from '@/lib/supabase';
import { processARESRequest } from '@/lib/ares-engine';

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

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes enviar una pregunta válida' },
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

    const result = await processARESRequest(user.id, question.trim());

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
