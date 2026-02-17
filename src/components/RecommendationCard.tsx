'use client';

import type { RouteLevel } from '@/lib/types';

const levelConfig: Record<RouteLevel, { title: string; borderClass: string }> = {
  CEO_LEVEL: {
    title: 'Recomendación CEO',
    borderClass: 'border-l-ares-blue',
  },
  BOARD_LEVEL: {
    title: 'Recomendación del Consejo',
    borderClass: 'border-l-ares-purple',
  },
  ASSEMBLY_LEVEL: {
    title: 'Recomendación de la Asamblea',
    borderClass: 'border-l-ares-red',
  },
};

interface Props {
  level: RouteLevel;
  recommendation: string;
}

export function RecommendationCard({ level, recommendation }: Props) {
  const config = levelConfig[level];

  return (
    <div
      className={`rounded-lg border border-white/10 border-l-4 bg-white/5 p-6 ${config.borderClass}`}
    >
      <h3 className="mb-3 text-lg font-semibold text-white">{config.title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
        {recommendation}
      </p>
    </div>
  );
}
