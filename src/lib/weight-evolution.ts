// ============================================================
// ARES34 — Motor de Evolución de Pesos por Entidad
// Analiza patrones de decisión del CEO y ajusta la influencia
// relativa de C-Suite, Board y Assembly en síntesis futuras
// ============================================================

import { createClient } from '@supabase/supabase-js';
import {
  getLatestWeights,
  saveNewWeights,
  saveEvolutionEntry,
} from './supabase';
import type {
  EntityName,
} from './types';

// ============================================================
// CONSTANTS
// ============================================================

// Default entity weights (equal at start: 33/33/33)
const DEFAULT_ENTITY_WEIGHTS: Record<EntityName, number> = {
  csuite: 0.34,
  board: 0.33,
  assembly: 0.33,
};

// Weight adjustment magnitudes per reaction type
const WEIGHT_ADJUSTMENTS = {
  // When CEO accepts the recommendation, reward entities whose vote matched
  accepted: {
    aligned_boost: 0.02,    // Entities that voted "for" get +2%
    misaligned_penalty: -0.01, // Entities that voted "against" get -1%
  },
  // When CEO rejects, penalize entities that pushed for the recommendation
  rejected: {
    aligned_penalty: -0.02,   // Entities that voted "for" get -2% (they were wrong)
    misaligned_boost: 0.01,   // Entities that voted "against" get +1% (they were right)
  },
  // When CEO modifies, slight boost to "conditional" entities (they saw nuance)
  modified: {
    conditional_boost: 0.015,
    decisive_penalty: -0.005,
  },
  // Deferred = no weight change (CEO is undecided)
  deferred: {
    no_change: 0,
  },
};

// Guard rails: entity weights can never go below or above these
const MIN_ENTITY_WEIGHT = 0.10;  // No entity goes below 10%
const MAX_ENTITY_WEIGHT = 0.60;  // No entity goes above 60%

// How many past decisions to analyze for patterns
const PATTERN_WINDOW = 20;

// Minimum decisions before pattern analysis kicks in
const MIN_DECISIONS_FOR_PATTERNS = 5;

// ============================================================
// ADMIN CLIENT
// ============================================================

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// GET EFFECTIVE WEIGHTS (returns current or default)
// ============================================================

export async function getEffectiveWeights(
  userId: string
): Promise<Record<EntityName, number>> {
  const matrix = await getLatestWeights(userId);

  if (!matrix || !matrix.entity_weights || matrix.entity_weights.length === 0) {
    return { ...DEFAULT_ENTITY_WEIGHTS };
  }

  const weights: Record<EntityName, number> = { ...DEFAULT_ENTITY_WEIGHTS };
  for (const ew of matrix.entity_weights) {
    weights[ew.entity] = ew.weight / 100; // Convert from 0-100 to 0-1
  }

  return weights;
}

// ============================================================
// PROCESS A CEO REACTION — Update Weights
// ============================================================

export async function processReactionForWeightEvolution(
  userId: string,
  conversationId: string,
  reaction: 'accepted' | 'rejected' | 'modified' | 'deferred'
): Promise<void> {
  // Deferred reactions don't affect weights
  if (reaction === 'deferred') return;

  try {
    const supabase = createAdminClient();

    // Get entity deliberations for this conversation
    const { data: entityDelibs } = await supabase
      .from('entity_deliberations')
      .select('entity, perspectives')
      .eq('conversation_id', conversationId);

    if (!entityDelibs || entityDelibs.length === 0) return;

    // Get current weights
    const currentWeights = await getEffectiveWeights(userId);
    const matrix = await getLatestWeights(userId);
    const currentVersion = matrix?.version || 0;

    // Calculate weight adjustments based on reaction
    const adjustments: Record<EntityName, number> = {
      csuite: 0,
      board: 0,
      assembly: 0,
    };

    for (const ed of entityDelibs) {
      const entity = ed.entity as EntityName;
      const perspectives = ed.perspectives as Array<{ vote: string | null }>;

      // Count votes for this entity
      const votes = perspectives.map(p => p.vote).filter(Boolean);
      const forCount = votes.filter(v => v === 'for').length;
      const againstCount = votes.filter(v => v === 'against').length;
      const conditionalCount = votes.filter(v => v === 'conditional').length;
      const total = votes.length;

      if (total === 0) continue;

      const forRatio = forCount / total;
      const againstRatio = againstCount / total;
      const conditionalRatio = conditionalCount / total;

      if (reaction === 'accepted') {
        // CEO accepted → entities that voted "for" were right
        if (forRatio > 0.5) {
          adjustments[entity] += WEIGHT_ADJUSTMENTS.accepted.aligned_boost;
        } else if (againstRatio > 0.5) {
          adjustments[entity] += WEIGHT_ADJUSTMENTS.accepted.misaligned_penalty;
        }
      } else if (reaction === 'rejected') {
        // CEO rejected → entities that voted "for" were wrong
        if (forRatio > 0.5) {
          adjustments[entity] += WEIGHT_ADJUSTMENTS.rejected.aligned_penalty;
        } else if (againstRatio > 0.5) {
          adjustments[entity] += WEIGHT_ADJUSTMENTS.rejected.misaligned_boost;
        }
      } else if (reaction === 'modified') {
        // CEO modified → conditional entities had the best read
        if (conditionalRatio > 0.3) {
          adjustments[entity] += WEIGHT_ADJUSTMENTS.modified.conditional_boost;
        } else if (forRatio > 0.7 || againstRatio > 0.7) {
          // Too decisive entities get a slight penalty
          adjustments[entity] += WEIGHT_ADJUSTMENTS.modified.decisive_penalty;
        }
      }
    }

    // Check if any adjustment is non-zero
    const hasChanges = Object.values(adjustments).some(v => v !== 0);
    if (!hasChanges) return;

    // Apply adjustments and normalize
    const newWeights: Record<EntityName, number> = { ...currentWeights };
    for (const entity of Object.keys(adjustments) as EntityName[]) {
      newWeights[entity] = Math.max(
        MIN_ENTITY_WEIGHT,
        Math.min(MAX_ENTITY_WEIGHT, newWeights[entity] + adjustments[entity])
      );
    }

    // Normalize to sum to 1.0
    const sum = newWeights.csuite + newWeights.board + newWeights.assembly;
    newWeights.csuite = newWeights.csuite / sum;
    newWeights.board = newWeights.board / sum;
    newWeights.assembly = newWeights.assembly / sum;

    // Only save if change is meaningful (> 0.5% shift in any entity)
    const maxDelta = Math.max(
      Math.abs(newWeights.csuite - currentWeights.csuite),
      Math.abs(newWeights.board - currentWeights.board),
      Math.abs(newWeights.assembly - currentWeights.assembly)
    );

    if (maxDelta < 0.005) return; // Changes too small to bother saving

    // Save new weights
    const newVersion = currentVersion + 1;

    await saveNewWeights(
      userId,
      {
        csuite_weight: Number(newWeights.csuite.toFixed(4)),
        board_weight: Number(newWeights.board.toFixed(4)),
        assembly_weight: Number(newWeights.assembly.toFixed(4)),
      },
      `Ajuste automático por reacción del CEO: ${reaction} (conversación ${conversationId.slice(0, 8)})`
    );

    // Save evolution history entry
    await saveEvolutionEntry(
      userId,
      currentVersion,
      newVersion,
      {
        adjustments,
        before: currentWeights,
        after: newWeights,
        reaction,
        conversation_id: conversationId,
      },
      'ceo_reaction',
      `CEO ${reaction === 'accepted' ? 'aceptó' :
        reaction === 'rejected' ? 'rechazó' :
        'modificó'} la recomendación`
    );

  } catch (error) {
    // Weight evolution is non-critical — log but don't fail the request
    console.error('Error al procesar evolución de pesos:', error);
  }
}

// ============================================================
// ANALYZE DECISION PATTERNS — Periodic Deeper Analysis
// ============================================================

export async function analyzeDecisionPatterns(userId: string): Promise<{
  patterns: DecisionPattern[];
  adjustmentSuggested: boolean;
}> {
  const supabase = createAdminClient();

  // Get recent decision logs with entity positions
  const { data: recentDecisions } = await supabase
    .from('decision_logs')
    .select('*, conversation:conversations(route_level)')
    .eq('user_id', userId)
    .not('ceo_reaction', 'is', null)
    .order('created_at', { ascending: false })
    .limit(PATTERN_WINDOW);

  if (!recentDecisions || recentDecisions.length < MIN_DECISIONS_FOR_PATTERNS) {
    return { patterns: [], adjustmentSuggested: false };
  }

  const patterns: DecisionPattern[] = [];

  // Pattern 1: Overall acceptance rate
  const reactions = recentDecisions.map(d => d.ceo_reaction as string);
  const acceptedCount = reactions.filter(r => r === 'accepted').length;
  const rejectedCount = reactions.filter(r => r === 'rejected').length;
  const modifiedCount = reactions.filter(r => r === 'modified').length;
  const total = reactions.length;

  patterns.push({
    type: 'acceptance_rate',
    description: `Tasa de aceptación: ${Math.round((acceptedCount / total) * 100)}% (${acceptedCount}/${total})`,
    metric: acceptedCount / total,
  });

  // Pattern 2: Rejection trend (increasing rejections = system not aligned)
  if (rejectedCount > total * 0.3) {
    patterns.push({
      type: 'high_rejection',
      description: `Alta tasa de rechazo: ${Math.round((rejectedCount / total) * 100)}% de las últimas ${total} decisiones`,
      metric: rejectedCount / total,
    });
  }

  // Pattern 3: Heavy modification (CEO always adjusting)
  if (modifiedCount > total * 0.4) {
    patterns.push({
      type: 'high_modification',
      description: `Alta tasa de modificación: ${Math.round((modifiedCount / total) * 100)}% — ARES está cerca pero no exacto`,
      metric: modifiedCount / total,
    });
  }

  return {
    patterns,
    adjustmentSuggested: rejectedCount > total * 0.3 || modifiedCount > total * 0.5,
  };
}

// ============================================================
// WEIGHT SUMMARY FOR UI DISPLAY
// ============================================================

export async function getWeightSummary(userId: string): Promise<{
  weights: Record<EntityName, number>;
  version: number;
  totalDecisions: number;
  hasCustomWeights: boolean;
}> {
  const supabase = createAdminClient();

  const [matrix, decisionCountResult] = await Promise.all([
    getLatestWeights(userId),
    supabase
      .from('decision_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('ceo_reaction', 'is', null),
  ]);

  const weights = matrix
    ? {
        csuite: Math.round(Number(matrix.entity_weights.find(e => e.entity === 'csuite')?.weight || 34)),
        board: Math.round(Number(matrix.entity_weights.find(e => e.entity === 'board')?.weight || 33)),
        assembly: Math.round(Number(matrix.entity_weights.find(e => e.entity === 'assembly')?.weight || 33)),
      } as Record<EntityName, number>
    : { csuite: 34, board: 33, assembly: 33 } as Record<EntityName, number>;

  return {
    weights,
    version: matrix?.version || 0,
    totalDecisions: decisionCountResult.count || 0,
    hasCustomWeights: (matrix?.version || 0) > 0,
  };
}

// ============================================================
// TYPES
// ============================================================

export interface DecisionPattern {
  type: 'acceptance_rate' | 'high_rejection' | 'high_modification' | 'entity_bias';
  description: string;
  metric: number; // 0-1
}
