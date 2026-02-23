import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, updateDecisionReaction, updateDecisionOutcome } from '@/lib/supabase';
import { processReactionForWeightEvolution } from '@/lib/weight-evolution';

const VALID_REACTIONS = ['accepted', 'rejected', 'modified', 'deferred'] as const;

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
    const { conversationId, reaction, notes } = body;

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Debes enviar un conversationId válido' },
        { status: 400 }
      );
    }

    if (!reaction || !VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json(
        { success: false, error: 'La reacción debe ser: accepted, rejected, modified o deferred' },
        { status: 400 }
      );
    }

    // 1. Save the CEO reaction
    await updateDecisionReaction(conversationId, reaction, notes);

    // 2. Trigger weight evolution (non-blocking, non-critical)
    processReactionForWeightEvolution(user.id, conversationId, reaction)
      .catch(err => console.error('Error en evolución de pesos (no crítico):', err));

    return NextResponse.json({ success: true, data: { conversationId, reaction } });
  } catch (error) {
    console.error('Error en POST /api/decisions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar tu decisión' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { conversationId, outcome } = body;

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Debes enviar un conversationId válido' },
        { status: 400 }
      );
    }

    if (!outcome || typeof outcome !== 'string' || outcome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes describir el resultado de la decisión' },
        { status: 400 }
      );
    }

    await updateDecisionOutcome(conversationId, outcome.trim());

    return NextResponse.json({ success: true, data: { conversationId, outcome: outcome.trim() } });
  } catch (error) {
    console.error('Error en PATCH /api/decisions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar el resultado' },
      { status: 500 }
    );
  }
}
