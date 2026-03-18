'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Crown,
  AlertTriangle,
  Users,
  Building2,
  Landmark,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ArrowLeftRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Lock,
  MessageSquarePlus,
  Search,
  Copy,
} from 'lucide-react';
import type {
  ARESResponse as ARESResponseType,
  Conversation,
  RouteLevel,
  EntityName,
  Perspective,
  EntityDeliberation,
  TensionPoint,
  PerspectiveVote,
} from '@/lib/types';

// ============================================================
// TYPES
// ============================================================

interface SubscriptionInfo {
  plan: string;
  status: string;
  is_active: boolean;
  queries_used: number;
  queries_limit: number | null;
  days_left: number | null;
}

type DecisionReaction = 'accepted' | 'rejected' | 'modified' | 'deferred';

// ============================================================
// HELPERS
// ============================================================

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-MX');
}

const levelConfig: Record<RouteLevel, {
  label: string;
  color: string;
  dot: string;
  bg: string;
  glowClass: string;
  dotGlow: string;
}> = {
  CEO_LEVEL: {
    label: 'Operativo',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/15',
    dot: 'bg-blue-400',
    bg: 'border-blue-500/20',
    glowClass: 'card-glow-blue',
    dotGlow: 'history-dot-blue',
  },
  BOARD_LEVEL: {
    label: 'Estratégico',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/15',
    dot: 'bg-purple-400',
    bg: 'border-purple-500/20',
    glowClass: 'card-glow-purple',
    dotGlow: 'history-dot-purple',
  },
  ASSEMBLY_LEVEL: {
    label: 'Capital',
    color: 'text-red-400 border-red-500/30 bg-red-500/15',
    dot: 'bg-red-400',
    bg: 'border-red-500/20',
    glowClass: 'card-glow-red',
    dotGlow: 'history-dot-red',
  },
};

const entityConfig: Record<EntityName, {
  label: string;
  icon: typeof Users;
  color: string;
  borderColor: string;
  bgColor: string;
  dotColor: string;
  description: string;
}> = {
  csuite: {
    label: 'C-Suite + Atlas',
    icon: Users,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    bgColor: 'bg-blue-500/[0.06]',
    dotColor: 'bg-blue-400',
    description: '9 directores ejecutivos + síntesis de Atlas',
  },
  board: {
    label: 'Consejo de Administración',
    icon: Building2,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    bgColor: 'bg-purple-500/[0.06]',
    dotColor: 'bg-purple-400',
    description: '5 consejeros independientes y patrimoniales',
  },
  assembly: {
    label: 'Asamblea de Accionistas',
    icon: Landmark,
    color: 'text-red-400',
    borderColor: 'border-red-500/20',
    bgColor: 'bg-red-500/[0.06]',
    dotColor: 'bg-red-400',
    description: '3 accionistas con arquetipos distintos',
  },
};

const voteConfig: Record<string, {
  label: string;
  color: string;
  bg: string;
}> = {
  for: { label: 'A Favor', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  against: { label: 'En Contra', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  conditional: { label: 'Condicional', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
};

const tensionSeverityConfig: Record<string, {
  label: string;
  color: string;
  bg: string;
}> = {
  low: { label: 'Baja', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  medium: { label: 'Media', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  high: { label: 'Alta', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const loadingMessages = [
  'Clasificando tu pregunta...',
  'Activando las 3 entidades de gobierno...',
  'Los 17 asesores están deliberando...',
  'Detectando tensiones entre entidades...',
  'ARES34 sintetiza la recomendación final...',
];

// ============================================================
// AGENT DESCRIPTIONS (for tooltips)
// ============================================================

const agentDescriptions: Record<string, string> = {
  // C-Suite
  'Patrick': 'Analiza impacto financiero, flujo de efectivo, costos y retorno de inversión.',
  'Mauricio': 'Evalúa viabilidad operativa, procesos, plazos y recursos necesarios.',
  'Alejandra': 'Perspectiva de mercado, posicionamiento de marca y percepción del cliente.',
  'Jay': 'Evalúa factibilidad técnica, infraestructura y deuda tecnológica.',
  'Cathy': 'Analiza impacto en equipo, cultura organizacional y talento.',
  'Bret': 'Revisa riesgos legales, cumplimiento regulatorio y contratos.',
  'Roger': 'Evalúa posición competitiva, tendencias y ventajas estratégicas.',
  'Pablo': 'Perspectiva comercial: ventas, canales y relación con clientes.',
  'JC': 'Analiza con datos, métricas y evidencia cuantitativa.',
  'Atlas': 'Sintetiza las perspectivas de los 9 directores en una recomendación.',
  // Board
  'Victoria': 'Gobierno corporativo: estructura, procesos de decisión y mejores prácticas.',
  'Santiago': 'Solidez financiera a nivel consejo, estructura de capital y valuación.',
  'Carmen': 'Riesgos regulatorios, cumplimiento y exposición legal.',
  'Fernando': 'Perspectiva del accionista mayoritario, retorno y protección patrimonial.',
  'Gabriela': 'Perspectiva de familia, legado, sucesión y armonía entre generaciones.',
  // Assembly
  'Andrés': 'Accionista fundador-operador: crecimiento, reinversión y visión de largo plazo.',
  'Helena': 'Inversionista racional: retorno, valuación y disciplina financiera.',
  'Tomás': 'Accionista familiar: preservación patrimonial, riesgo y estabilidad.',
};

// ============================================================
// AGENT TOOLTIP COMPONENT
// ============================================================

function AgentTooltip({ name }: { name: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const description = agentDescriptions[name];
  if (!description) return null;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span className="ml-1 w-3.5 h-3.5 rounded-full bg-white/[0.08] text-white/30 text-[8px] font-bold flex items-center justify-center cursor-help hover:bg-white/[0.15] hover:text-white/50 transition-all">
        ?
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg bg-black/95 border border-white/[0.15] text-[11px] text-white/80 leading-relaxed shadow-xl z-50 pointer-events-none">
          {description}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white/[0.15]" />
        </span>
      )}
    </span>
  );
}

// ============================================================
// VOTE BADGE COMPONENT
// ============================================================

function VoteBadge({ vote }: { vote: PerspectiveVote }) {
  if (!vote) return null;
  const config = voteConfig[vote];
  if (!config) return null;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}

// ============================================================
// VOTE SUMMARY BAR (within an entity)
// ============================================================

function VoteSummaryBar({ perspectives }: { perspectives: Perspective[] }) {
  const forCount = perspectives.filter(p => p.vote === 'for').length;
  const againstCount = perspectives.filter(p => p.vote === 'against').length;
  const conditionalCount = perspectives.filter(p => p.vote === 'conditional').length;
  const noVote = perspectives.length - forCount - againstCount - conditionalCount;
  const total = perspectives.length;

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-3 text-[10px]">
      {forCount > 0 && (
        <span className="flex items-center gap-1 text-emerald-400">
          <ThumbsUp className="h-3 w-3" /> {forCount}
        </span>
      )}
      {againstCount > 0 && (
        <span className="flex items-center gap-1 text-red-400">
          <ThumbsDown className="h-3 w-3" /> {againstCount}
        </span>
      )}
      {conditionalCount > 0 && (
        <span className="flex items-center gap-1 text-amber-400">
          <AlertCircle className="h-3 w-3" /> {conditionalCount}
        </span>
      )}
      {noVote > 0 && (
        <span className="text-white/30">{noVote} sin voto</span>
      )}
    </div>
  );
}

// ============================================================
// ENTITY SECTION COMPONENT (expandable)
// ============================================================

function EntitySection({ deliberation, defaultExpanded = false }: {
  deliberation: EntityDeliberation;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const config = entityConfig[deliberation.entity_name];
  const Icon = config.icon;

  return (
    <div className={`border ${config.borderColor} ${config.bgColor} rounded-xl overflow-hidden transition-all`}>
      {/* Entity Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="text-left">
            <h4 className={`text-sm font-semibold ${config.color}`}>{config.label}</h4>
            <p className="text-[10px] text-white/40">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VoteSummaryBar perspectives={deliberation.perspectives} />
          {/* Consensus badge */}
          <span className="text-[10px] text-white/40 font-medium">
            {deliberation.consensus_level}% consenso
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </div>
      </button>

      {/* Entity Content — expandable */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06]">
          {/* Entity synthesis */}
          <div className="mt-3 rounded-lg bg-white/[0.04] border border-white/[0.06] p-4">
            <h5 className="text-xs font-medium text-white/50 mb-2">
              {deliberation.entity_name === 'csuite' ? 'Síntesis de Atlas' :
               deliberation.entity_name === 'board' ? 'Síntesis del Consejo' :
               'Síntesis de la Asamblea'}
            </h5>
            <p className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
              {deliberation.synthesis}
            </p>
          </div>

          {/* Individual perspectives */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Perspectivas individuales ({deliberation.perspectives.length})
            </h5>
            {deliberation.perspectives.map((p, i) => (
              <div key={i} className="border border-white/[0.06] rounded-lg p-3 hover:bg-white/[0.03] hover:border-white/[0.12] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center ring-1 ring-white/10`}>
                      <span className="text-[11px] font-bold text-white/80">{p.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center">
                        {p.name}
                        <AgentTooltip name={p.name} />
                      </p>
                      <p className="text-[10px] text-white/40">{p.role}</p>
                    </div>
                  </div>
                  <VoteBadge vote={p.vote} />
                </div>
                <p className="whitespace-pre-wrap text-sm text-white/70 leading-relaxed ml-9">
                  {p.response}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AGENT INTRO MODAL (shown once on first response)
// ============================================================

const ENTITY_AGENTS = {
  csuite: {
    title: 'C-Suite — Tu equipo directivo',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    agents: [
      { name: 'Patrick', role: 'CFO', desc: 'Finanzas, costos y retorno de inversión' },
      { name: 'Mauricio', role: 'COO', desc: 'Operaciones, procesos y ejecución' },
      { name: 'Alejandra', role: 'CMO', desc: 'Marketing, marca y posicionamiento' },
      { name: 'Jay', role: 'CTO', desc: 'Tecnología, sistemas e infraestructura' },
      { name: 'Cathy', role: 'CHRO', desc: 'Talento, cultura y equipo' },
      { name: 'Bret', role: 'CLO', desc: 'Legal, cumplimiento y contratos' },
      { name: 'Roger', role: 'CSO', desc: 'Estrategia y posición competitiva' },
      { name: 'Pablo', role: 'CCO', desc: 'Ventas, canales y clientes' },
      { name: 'JC', role: 'CDO', desc: 'Datos, métricas y evidencia' },
    ],
    synthesizer: { name: 'Atlas', desc: 'Sintetiza las 9 perspectivas para ti' },
  },
  board: {
    title: 'Consejo de Administración',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    agents: [
      { name: 'Victoria', role: 'Gobierno Corp.', desc: 'Estructura y mejores prácticas' },
      { name: 'Santiago', role: 'Finanzas', desc: 'Capital, valuación y solidez' },
      { name: 'Carmen', role: 'Riesgos', desc: 'Cumplimiento y exposición legal' },
      { name: 'Fernando', role: 'Patrimonial', desc: 'Retorno y protección del accionista' },
      { name: 'Gabriela', role: 'Familia', desc: 'Legado, sucesión y armonía' },
    ],
  },
  assembly: {
    title: 'Asamblea de Accionistas',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10',
    agents: [
      { name: 'Andrés', role: 'Fundador', desc: 'Crecimiento y reinversión' },
      { name: 'Helena', role: 'Inversionista', desc: 'Retorno y disciplina financiera' },
      { name: 'Tomás', role: 'Familiar', desc: 'Estabilidad y preservación' },
    ],
  },
};

function AgentIntroModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/[0.12] bg-[#0e1117] rounded-2xl shadow-2xl">
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.08]">
          <h2 className="text-lg font-bold text-white">Tu equipo de asesores</h2>
          <p className="text-white/50 text-sm mt-1">
            17 agentes de IA especializados deliberan cada pregunta que haces.
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {Object.entries(ENTITY_AGENTS).map(([key, entity]) => (
            <div key={key} className={`border ${entity.borderColor} ${entity.bgColor} rounded-xl p-4`}>
              <h3 className={`text-sm font-semibold ${entity.color} mb-3`}>{entity.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {entity.agents.map(agent => (
                  <div key={agent.name} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-white/70">{agent.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white">
                        <span className="font-semibold">{agent.name}</span>
                        <span className="text-white/40 ml-1">— {agent.role}</span>
                      </p>
                      <p className="text-[10px] text-white/40 truncate">{agent.desc}</p>
                    </div>
                  </div>
                ))}
                {'synthesizer' in entity && entity.synthesizer && (
                  <div className="flex items-center gap-2.5 sm:col-span-2 mt-1 pt-2 border-t border-white/[0.06]">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-emerald-400">{entity.synthesizer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold">{entity.synthesizer.name}</p>
                      <p className="text-[10px] text-white/40">{entity.synthesizer.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all cursor-pointer"
          >
            Entendido — Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TENSION DISPLAY COMPONENT
// ============================================================

function TensionDisplay({ tensions }: { tensions: TensionPoint[] }) {
  if (!tensions || tensions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        <h4 className="text-xs font-medium text-amber-400 uppercase tracking-wider">
          Tensiones detectadas
        </h4>
      </div>
      {tensions.map((t, i) => {
        const severity = tensionSeverityConfig[t.severity] || tensionSeverityConfig.low;
        const entityA = entityConfig[t.between_entities[0]];
        const entityB = entityConfig[t.between_entities[1]];
        return (
          <div key={i} className={`border ${severity.bg} rounded-lg p-3 flex items-start gap-3`}>
            <ArrowLeftRight className={`h-4 w-4 mt-0.5 shrink-0 ${severity.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${entityA.color}`}>{entityA.label}</span>
                <span className="text-[10px] text-white/30">vs</span>
                <span className={`text-xs font-medium ${entityB.color}`}>{entityB.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${severity.bg} ${severity.color} font-medium`}>
                  {severity.label}
                </span>
              </div>
              <p className="text-xs text-white/60">{t.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// DECISION TRACKING COMPONENT
// ============================================================

function DecisionTracker({ conversationId, initialReaction }: {
  conversationId: string;
  initialReaction?: string | null;
}) {
  const [reaction, setReaction] = useState<DecisionReaction | null>(
    (initialReaction as DecisionReaction) || null
  );
  const [saving, setSaving] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [outcomeSaved, setOutcomeSaved] = useState(false);

  const reactions: { value: DecisionReaction; label: string; icon: typeof CheckCircle2; color: string; bg: string }[] = [
    { value: 'accepted', label: 'Acepto', icon: CheckCircle2, color: 'text-emerald-400', bg: 'hover:bg-emerald-500/15 hover:border-emerald-500/30' },
    { value: 'rejected', label: 'Rechazo', icon: XCircle, color: 'text-red-400', bg: 'hover:bg-red-500/15 hover:border-red-500/30' },
    { value: 'modified', label: 'Modifico', icon: TrendingUp, color: 'text-amber-400', bg: 'hover:bg-amber-500/15 hover:border-amber-500/30' },
    { value: 'deferred', label: 'Difiero', icon: Clock, color: 'text-blue-400', bg: 'hover:bg-blue-500/15 hover:border-blue-500/30' },
  ];

  async function handleReaction(r: DecisionReaction) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, reaction: r }),
      });
      const json = await res.json();
      if (json.success) {
        setReaction(r);
        toast.success('Decisión registrada');
      } else {
        toast.error(json.error || 'Error al registrar tu decisión');
      }
    } catch {
      toast.error('Error de conexión al registrar tu decisión');
    } finally {
      setSaving(false);
    }
  }

  async function handleOutcome() {
    if (!outcome.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/decisions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, outcome: outcome.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setOutcomeSaved(true);
        toast.success('Resultado registrado');
      } else {
        toast.error(json.error || 'Error al registrar el resultado');
      }
    } catch {
      toast.error('Error de conexión al registrar el resultado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="h-px bg-white/[0.06]" />

      {/* Decision buttons */}
      {!reaction ? (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Tu decisión
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {reactions.map((r) => {
              const RIcon = r.icon;
              return (
                <button
                  key={r.value}
                  onClick={() => handleReaction(r.value)}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/70 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${r.bg}`}
                >
                  <RIcon className={`h-3.5 w-3.5 ${r.color}`} />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Reaction confirmation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Tu decisión:</span>
              {(() => {
                const r = reactions.find(rx => rx.value === reaction);
                if (!r) return null;
                const RIcon = r.icon;
                return (
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${r.color}`}>
                    <RIcon className="h-3.5 w-3.5" />
                    {r.label}
                  </span>
                );
              })()}
            </div>
            {!showOutcome && !outcomeSaved && (
              <button
                onClick={() => setShowOutcome(true)}
                className="text-[10px] text-white/40 hover:text-white/70 transition-colors underline cursor-pointer"
              >
                Registrar resultado
              </button>
            )}
          </div>

          {/* Outcome form */}
          {showOutcome && !outcomeSaved && (
            <div className="space-y-2">
              <textarea
                placeholder="¿Qué pasó con esta decisión? Describe el resultado real..."
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full resize-none rounded-lg bg-white/[0.06] border border-white/[0.08] p-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-white/20 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleOutcome}
                  disabled={!outcome.trim() || saving}
                  className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all disabled:opacity-30 cursor-pointer"
                >
                  {saving ? 'Guardando...' : 'Guardar resultado'}
                </button>
              </div>
            </div>
          )}

          {outcomeSaved && (
            <p className="text-[10px] text-emerald-400/60 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Resultado registrado
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN RESPONSE DISPLAY
// ============================================================

function ARESResponseDisplay({ data }: { data: ARESResponseType }) {
  const level = levelConfig[data.level];

  // Group deliberations by entity
  const csuiteDelib = data.entityDeliberations?.find(d => d.entity_name === 'csuite');
  const boardDelib = data.entityDeliberations?.find(d => d.entity_name === 'board');
  const assemblyDelib = data.entityDeliberations?.find(d => d.entity_name === 'assembly');

  return (
    <div className={`border ${level.bg} bg-white/[0.04] rounded-2xl p-6 space-y-5 response-enter backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${level.dot} ${level.dotGlow}`} />
          <h3 className="text-sm font-semibold text-white">Recomendación de ARES34</h3>
        </div>
        <div className="flex items-center gap-2">
          {data.entitiesConsulted && data.entitiesConsulted.length > 0 && (
            <span className="text-[10px] text-white/40">
              {data.entitiesConsulted.length === 3 ? '3 entidades' :
               data.entitiesConsulted.length === 1 ? 'C-Suite' : `${data.entitiesConsulted.length} entidades`}
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${level.color}`}>
            {level.label}
          </span>
        </div>
      </div>

      {/* Layer 1: ARES Final Recommendation — always visible */}
      <div className="relative rounded-xl bg-white/[0.06] border border-white/[0.06] p-5">
        <button
          onClick={() => {
            navigator.clipboard.writeText(data.recommendation);
            toast.success('Copiado al portapapeles');
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          title="Copiar recomendación"
        >
          <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white/80 transition-colors" />
        </button>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90 pr-8">
          {data.recommendation}
        </p>
      </div>

      {/* Tensions between entities */}
      {data.tensions && data.tensions.length > 0 && (
        <TensionDisplay tensions={data.tensions} />
      )}

      {/* Layer 2: C-Suite + Atlas — expandable */}
      {csuiteDelib && (
        <EntitySection deliberation={csuiteDelib} />
      )}

      {/* Layer 3: Board — expandable */}
      {boardDelib && (
        <EntitySection deliberation={boardDelib} />
      )}

      {/* Layer 4: Assembly — expandable */}
      {assemblyDelib && (
        <EntitySection deliberation={assemblyDelib} />
      )}

      {/* Fallback: flat perspectives for legacy format */}
      {(!data.entityDeliberations || data.entityDeliberations.length === 0) && data.perspectives && data.perspectives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Opiniones de tus asesores ({data.perspectives.length})
          </h4>
          <div className="grid gap-3">
            {data.perspectives.map((p, i) => (
              <div key={i} className="border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/[0.14] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center ring-1 ring-white/10">
                      <span className="text-[11px] font-bold text-white/80">{p.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center">
                        {p.name}
                        <AgentTooltip name={p.name} />
                      </p>
                      <p className="text-[10px] text-white/40">{p.role}</p>
                    </div>
                  </div>
                  <VoteBadge vote={p.vote} />
                </div>
                <p className="whitespace-pre-wrap text-sm text-white/75 leading-relaxed">{p.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Tracking */}
      <DecisionTracker
        conversationId={data.conversationId}
        initialReaction={null}
      />
    </div>
  );
}

// ============================================================
// HISTORY ITEM — ENTITY-GROUPED DISPLAY
// ============================================================

function HistoryEntitySection({ deliberation }: { deliberation: EntityDeliberation }) {
  const [expanded, setExpanded] = useState(false);
  const config = entityConfig[deliberation.entity_name];
  const Icon = config.icon;

  return (
    <div className={`border ${config.borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-3 w-3 ${config.color}`} />
          <span className={`text-[11px] font-medium ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <VoteSummaryBar perspectives={deliberation.perspectives} />
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-white/30" />
          ) : (
            <ChevronDown className="h-3 w-3 text-white/30" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/[0.06]">
          <p className="mt-2 text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
            {deliberation.synthesis}
          </p>
          {deliberation.perspectives.map((p, i) => (
            <div key={i} className="border border-white/[0.04] rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-white/60">{p.name} · {p.role}</span>
                <VoteBadge vote={p.vote} />
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed whitespace-pre-wrap">{p.response}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ARESResponseType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<RouteLevel | 'ALL'>('ALL');
  const [configReady, setConfigReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [showAgentIntro, setShowAgentIntro] = useState(false);
  const [onboardingPending, setOnboardingPending] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      const json = await res.json();
      if (json.success) {
        setConversations(json.data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/status');
      const json = await res.json();
      if (json.success) {
        setSubscription(json.data);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch('/api/config');
        const json = await res.json();
        // Accept EITHER v1 or v2 onboarding
        const hasOnboarding =
          json.success && json.data && (json.data.onboarding_completed || json.data.onboarding_v2_completed);
        if (!hasOnboarding) {
          setOnboardingPending(true);
        }
        setConfigReady(true);
        fetchConversations();
        fetchSubscription();
      } catch {
        setConfigReady(true);
        fetchConversations();
        fetchSubscription();
      }
    }
    checkConfig();
  }, [fetchConversations, fetchSubscription]);

  // Animate loading messages
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < loadingMessages.length - 1 ? s + 1 : s));
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setResponse(null);
    setLoadingStep(0);

    try {
      const res = await fetch('/api/ares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.code === 'SUBSCRIPTION_INACTIVE') {
          toast.error('Tu suscripción no está activa. Elige un plan para continuar.');
          fetchSubscription();
          return;
        }
        if (json.code === 'QUERY_LIMIT_REACHED') {
          toast.error(`Llegaste al límite de ${json.queries_limit} consultas este mes.`);
          fetchSubscription();
          return;
        }
        toast.error(json.error || 'Error al procesar tu pregunta');
        return;
      }
      setResponse(json.data);
      setQuestion('');
      toast.success('Recomendación de ARES recibida');
      // Show agent intro modal on first response ever
      if (!localStorage.getItem('ares34_agent_intro_seen')) {
        setShowAgentIntro(true);
        localStorage.setItem('ares34_agent_intro_seen', '1');
      }
      fetchConversations();
      if (json.subscription) {
        setSubscription((prev) => prev ? {
          ...prev,
          queries_used: json.subscription.queries_used,
        } : prev);
      }
    } catch {
      toast.error('No se pudo conectar con ARES. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (!configReady) {
    return (
      <div className="text-white flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <p className="text-sm text-white/60">Cargando...</p>
        </div>
      </div>
    );
  }

  // Gate: onboarding not completed — show prompt to complete it
  if (onboardingPending) {
    return (
      <div className="text-white">
        <div className="mx-auto max-w-2xl mt-12 sm:mt-20">
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8 sm:p-12 text-center backdrop-blur-sm">
            {/* Lock icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="h-7 w-7 text-emerald-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Configura tu empresa para activar ARES Core
            </h1>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
              ARES Core necesita conocer tu empresa para darte recomendaciones personalizadas.
              Completa el onboarding y desbloquea el poder de tus 17 asesores de IA.
            </p>

            {/* Features preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="border border-blue-500/15 bg-blue-500/[0.04] rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center mx-auto mb-2">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-xs text-white/50">9 directores de C-Suite</p>
              </div>
              <div className="border border-purple-500/15 bg-purple-500/[0.04] rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center mx-auto mb-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-xs text-white/50">5 consejeros de administración</p>
              </div>
              <div className="border border-red-500/15 bg-red-500/[0.04] rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center mx-auto mb-2">
                  <Landmark className="h-4 w-4 text-red-400" />
                </div>
                <p className="text-xs text-white/50">3 accionistas de asamblea</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/onboarding')}
              className="px-8 py-3.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Completar configuración
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-white/30 text-xs mt-6">
              Mientras tanto, puedes usar el resto de módulos: Brief, Escenarios, Legal, Calendario y más.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Agent Intro Modal */}
      {showAgentIntro && (
        <AgentIntroModal onClose={() => setShowAgentIntro(false)} />
      )}

      <div className="mx-auto max-w-3xl space-y-8">

        {/* Subscription status bar */}
        {subscription && (
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-sm transition-all ${
            !subscription.is_active
              ? 'border-red-500/20 bg-red-500/[0.06]'
              : subscription.plan === 'trial'
                ? 'border-orange-500/20 bg-orange-500/[0.06]'
                : 'border-white/[0.08] bg-white/[0.03]'
          }`}>
            <div className="flex items-center gap-3">
              {!subscription.is_active ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <Crown className="h-4 w-4 text-yellow-400" />
              )}
              <div>
                <span className={`text-sm font-medium ${
                  !subscription.is_active ? 'text-red-400' : 'text-white'
                }`}>
                  {subscription.plan === 'fundador' ? 'Plan Fundador' :
                   subscription.plan === 'empresarial' ? 'Plan Empresarial' :
                   'Plan Activo'}
                </span>
                {subscription.is_active && !subscription.queries_limit && (
                  <span className="text-xs text-white/40 ml-2">
                    Consultas ilimitadas
                  </span>
                )}
                {subscription.is_active && subscription.queries_limit && (
                  <span className="text-xs text-white/40 ml-2">
                    {subscription.queries_used}/{subscription.queries_limit} consultas usadas
                  </span>
                )}
                {!subscription.is_active && (
                  <span className="text-xs text-red-400/60 ml-2">
                    Suscripción inactiva
                  </span>
                )}
              </div>
            </div>
            {!subscription.is_active && (
              <a
                href="/settings#plan"
                className="text-xs px-3 py-1.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all btn-glow"
              >
                Activar plan
              </a>
            )}
          </div>
        )}

        {/* Question Input */}
        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-4 card-glow backdrop-blur-sm">
          <textarea
            placeholder="¿Qué decisión necesitas tomar? Escribe tu pregunta aquí..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={4}
            maxLength={2000}
            autoFocus
            className="w-full resize-none rounded-xl bg-white/[0.06] border border-white/[0.08] p-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] input-glow leading-relaxed appearance-none disabled:opacity-50 transition-all"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30">
              {question.length}/2000
              {question.length > 0 && <span className="text-white/50"> · ⌘+Enter para enviar</span>}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 btn-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Consultar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-4 backdrop-blur-sm response-enter">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 spinner-glow rounded-full">
                <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]" />
                <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400/60 animate-spin" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">{loadingMessages[loadingStep]}</p>
                <p className="text-xs text-white/30 mt-0.5">17 asesores deliberando en paralelo</p>
              </div>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-2 pl-11">
              {loadingMessages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i <= loadingStep
                      ? 'w-6 bg-emerald-400/60'
                      : 'w-1.5 bg-white/[0.12]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Response */}
        {response && !loading && <ARESResponseDisplay data={response} />}

        {/* History */}
        {(conversations.length > 0 || loadingHistory) && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Consultas recientes
              </h2>

              {/* Search & Filter */}
              {conversations.length > 0 && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar en tu historial..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.10] text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {([
                      { key: 'ALL' as const, label: 'Todos', color: 'bg-white/80 text-black' },
                      { key: 'CEO_LEVEL' as const, label: 'CEO', color: 'bg-blue-500 text-white' },
                      { key: 'BOARD_LEVEL' as const, label: 'Board', color: 'bg-purple-500 text-white' },
                      { key: 'ASSEMBLY_LEVEL' as const, label: 'Asamblea', color: 'bg-red-500 text-white' },
                    ] as const).map((pill) => (
                      <button
                        key={pill.key}
                        onClick={() => setLevelFilter(pill.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          levelFilter === pill.key
                            ? pill.color
                            : 'border border-white/[0.10] text-white/50 hover:text-white/70 hover:border-white/20'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loadingHistory && (
                <div className="space-y-3">
                  <div className="h-16 w-full rounded-xl bg-white/[0.04] animate-pulse border border-white/[0.06]" />
                  <div className="h-16 w-full rounded-xl bg-white/[0.04] animate-pulse border border-white/[0.06]" />
                </div>
              )}

              {(() => {
                const filteredConversations = conversations.filter((conv) => {
                  const matchesSearch = searchQuery === '' || conv.question.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesLevel = levelFilter === 'ALL' || conv.route_level === levelFilter;
                  return matchesSearch && matchesLevel;
                });

                if (!loadingHistory && conversations.length > 0 && filteredConversations.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
                      <p className="text-sm text-white/40">No se encontraron consultas con esos filtros</p>
                      <button
                        onClick={() => { setSearchQuery(''); setLevelFilter('ALL'); }}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  );
                }

                return filteredConversations.map((conv) => {
                const level = levelConfig[conv.route_level];
                const isExpanded = expandedId === conv.id;

                // Try to extract entity deliberations from the deliberation object
                const entityDelibs = conv.deliberation?.entity_deliberations || [];

                return (
                  <div
                    key={conv.id}
                    onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                    className={`border border-white/[0.08] bg-white/[0.03] rounded-xl p-4 cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.14] transition-all group backdrop-blur-sm ${level.glowClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${level.dot} ${level.dotGlow}`} />
                        <p className="text-sm text-white/80 flex-1 min-w-0">
                          {isExpanded
                            ? conv.question
                            : conv.question.length > 90
                              ? conv.question.slice(0, 90) + '...'
                              : conv.question}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-white/30 whitespace-nowrap">
                          {formatRelativeDate(conv.created_at)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-white/40" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                        )}
                      </div>
                    </div>

                    {isExpanded && conv.deliberation && (
                      <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 ml-4" onClick={(e) => e.stopPropagation()}>
                        {/* Main recommendation */}
                        <div className="rounded-xl bg-white/[0.05] border border-white/[0.06] p-4">
                          <h4 className="mb-2 text-xs font-medium text-white/50">Recomendación de ARES34</h4>
                          <p className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                            {conv.deliberation.recommendation}
                          </p>
                        </div>

                        {/* Tensions */}
                        {conv.deliberation.tensions_detected && conv.deliberation.tensions_detected.length > 0 && (
                          <TensionDisplay tensions={conv.deliberation.tensions_detected} />
                        )}

                        {/* Entity sections in history */}
                        {entityDelibs.length > 0 ? (
                          <div className="space-y-2">
                            {entityDelibs.map((ed, i) => (
                              <HistoryEntitySection key={i} deliberation={ed} />
                            ))}
                          </div>
                        ) : (
                          /* Fallback: legacy flat perspectives */
                          conv.deliberation.perspectives.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-medium text-white/40">Asesores</h4>
                              {conv.deliberation.perspectives.map((p, i) => (
                                <div key={i} className="border border-white/[0.06] rounded-lg p-3 hover:border-white/[0.12] transition-all">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center ring-1 ring-white/10">
                                        <span className="text-[9px] font-bold text-white/70">{p.name.charAt(0)}</span>
                                      </div>
                                      <p className="text-xs font-medium text-white/70">{p.name} · {p.role}</p>
                                    </div>
                                    <VoteBadge vote={p.vote} />
                                  </div>
                                  <p className="whitespace-pre-wrap text-xs text-white/60 leading-relaxed ml-7">
                                    {p.response}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {/* Decision tracking in history */}
                        <DecisionTracker
                          conversationId={conv.id}
                          initialReaction={conv.decision_log?.ceo_reaction}
                        />
                      </div>
                    )}
                  </div>
                );
              });
              })()}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loadingHistory && conversations.length === 0 && !response && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
              <MessageSquarePlus className="h-7 w-7 text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">
              Hazle tu primera pregunta a ARES
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
              Escribe cualquier duda estratégica, financiera o legal y tu consejo de administración con IA deliberará para darte una recomendación.
            </p>
            <p className="text-white/25 text-xs mt-4">
              9 C-Suite + 5 Consejeros + 3 Accionistas deliberarán tu decisión
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

