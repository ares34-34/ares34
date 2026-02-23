import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getWeightSummary, analyzeDecisionPatterns } from '@/lib/weight-evolution';

export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    // Get weight summary and patterns in parallel
    const [summary, patternsResult] = await Promise.all([
      getWeightSummary(user.id),
      analyzeDecisionPatterns(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        weights: summary.weights,
        version: summary.version,
        totalDecisions: summary.totalDecisions,
        hasCustomWeights: summary.hasCustomWeights,
        patterns: patternsResult.patterns,
        adjustmentSuggested: patternsResult.adjustmentSuggested,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/weights:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener pesos de entidad' },
      { status: 500 }
    );
  }
}
