'use client';

import type { RouteLevel } from '@/lib/types';

const levelConfig: Record<RouteLevel, { label: string; classes: string }> = {
  CEO_LEVEL: {
    label: 'Nivel CEO',
    classes: 'bg-ares-blue/10 text-ares-blue border-ares-blue',
  },
  BOARD_LEVEL: {
    label: 'Nivel Board',
    classes: 'bg-ares-purple/10 text-ares-purple border-ares-purple',
  },
  ASSEMBLY_LEVEL: {
    label: 'Nivel Asamblea',
    classes: 'bg-ares-red/10 text-ares-red border-ares-red',
  },
};

interface Props {
  level: RouteLevel;
}

export function LevelBadge({ level }: Props) {
  const config = levelConfig[level];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
