'use client';

import type { ARESResponse as ARESResponseType } from '@/lib/types';
import { LevelBadge } from './LevelBadge';
import { ClassificationInfo } from './ClassificationInfo';
import { PerspectiveCard } from './PerspectiveCard';
import { RecommendationCard } from './RecommendationCard';

interface Props {
  response: ARESResponseType;
}

export default function ARESResponse({ response }: Props) {
  const { level, perspectives, recommendation, classification } = response;

  return (
    <div className="space-y-6">
      {/* Header with level badge and classification info */}
      <div className="flex flex-wrap items-center gap-4">
        <LevelBadge level={level} />
        <ClassificationInfo classification={classification} />
      </div>

      {/* Perspectives (not shown for CEO) */}
      {level !== 'CEO_LEVEL' && perspectives.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">
            {level === 'BOARD_LEVEL'
              ? 'Perspectivas del Consejo'
              : 'Perspectivas de la Asamblea'}
          </h3>
          {perspectives.map((perspective, index) => (
            <PerspectiveCard key={index} perspective={perspective} />
          ))}
        </div>
      )}

      {/* Recommendation */}
      <RecommendationCard level={level} recommendation={recommendation} />
    </div>
  );
}
