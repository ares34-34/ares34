'use client';

import { useState } from 'react';
import type { Perspective } from '@/lib/types';
import {
  DollarSign,
  Megaphone,
  Scale,
  Users,
  TrendingUp,
  Shield,
  Building,
  Sparkles,
  User,
  ChevronDown,
} from 'lucide-react';

const roleConfig: Record<string, { label: string; icon: React.ElementType }> = {
  CFO: { label: 'Director de Finanzas (CFO)', icon: DollarSign },
  CMO: { label: 'Director de Marketing (CMO)', icon: Megaphone },
  CLO: { label: 'Director Jurídico (CLO)', icon: Scale },
  CHRO: { label: 'Director de Capital Humano (CHRO)', icon: Users },
  VC: { label: 'Capital de Riesgo (VC)', icon: TrendingUp },
  LP: { label: 'Socio Limitado (LP)', icon: Shield },
  FO: { label: 'Oficina Familiar (FO)', icon: Building },
  ARCHETYPE: { label: '', icon: Sparkles },
  CEO: { label: 'Tu CEO Agent', icon: User },
};

interface Props {
  perspective: Perspective;
}

export function PerspectiveCard({ perspective }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const config = roleConfig[perspective.role] ?? { label: perspective.name, icon: Sparkles };
  const displayLabel =
    perspective.role === 'ARCHETYPE' ? perspective.name : config.label;
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
      >
        <Icon className="h-5 w-5 shrink-0 text-white" />
        <span className="flex-1 text-sm font-medium text-white">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
            {perspective.response}
          </p>
        </div>
      )}
    </div>
  );
}
