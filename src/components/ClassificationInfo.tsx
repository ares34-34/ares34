'use client';

import type { ARESClassification } from '@/lib/types';

const complexityMap: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

interface Props {
  classification: ARESClassification;
}

export function ClassificationInfo({ classification }: Props) {
  const confidencePercent = Math.round(classification.confidence * 100);
  const complexityLabel =
    complexityMap[classification.complexity.toLowerCase()] ?? classification.complexity;

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white">
        Confianza: {confidencePercent}%
      </span>
      <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white">
        Complejidad: {complexityLabel}
      </span>
    </div>
  );
}
