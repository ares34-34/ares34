'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Pause,
  HelpCircle,
  Building2,
  Users,
  Landmark,
  Loader2,
  MessageSquareText,
} from 'lucide-react';
import type {
  Conversation,
  RouteLevel,
  EntityName,
  Perspective,
  EntityDeliberation,
  TensionPoint,
  DecisionLog,
} from '@/lib/types';

// ============================================================
// TYPES
// ============================================================

type DecisionReaction = 'accepted' | 'rejected' | 'modified' | 'deferred';

type FilterLevel = 'all' | 'CEO_LEVEL' | 'BOARD_LEVEL' | 'ASSEMBLY_LEVEL';

type FilterDecision =
  | 'all'
  | 'accepted'
  | 'rejected'
  | 'modified'
  | 'deferred'
  | 'none';

interface ConversationWithDecision extends Conversation {
  decision_log?: DecisionLog;
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(dateStr);
}

const levelConfig: Record<
  RouteLevel,
  { label: string; color: string; bgColor: string; icon: typeof Building2 }
> = {
  CEO_LEVEL: {
    label: 'CEO',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: Building2,
  },
  BOARD_LEVEL: {
    label: 'Board',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    icon: Users,
  },
  ASSEMBLY_LEVEL: {
    label: 'Asamblea',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    icon: Landmark,
  },
};

const reactionConfig: Record<
  DecisionReaction,
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  accepted: { label: 'Aceptada', icon: CheckCircle2, color: 'text-emerald-400' },
  rejected: { label: 'Rechazada', icon: XCircle, color: 'text-red-400' },
  modified: { label: 'Modificada', icon: Pencil, color: 'text-amber-400' },
  deferred: { label: 'Diferida', icon: Pause, color: 'text-white/50' },
};

// ============================================================
// COMPONENTS
// ============================================================

function LevelBadge({ level }: { level: RouteLevel }) {
  const config = levelConfig[level];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.color}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function ReactionBadge({ reaction }: { reaction: DecisionReaction }) {
  const config = reactionConfig[reaction];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function EntityBadge({ entity }: { entity: EntityName }) {
  const labels: Record<EntityName, string> = {
    csuite: 'C-Suite',
    board: 'Consejo',
    assembly: 'Asamblea',
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-white/50 border border-white/[0.08]">
      {labels[entity]}
    </span>
  );
}

function PerspectiveCard({ perspective }: { perspective: Perspective }) {
  const voteColors: Record<string, string> = {
    for: 'text-emerald-400',
    against: 'text-red-400',
    conditional: 'text-amber-400',
  };
  const voteLabels: Record<string, string> = {
    for: 'A favor',
    against: 'En contra',
    conditional: 'Condicional',
  };

  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/80">{perspective.name}</span>
          <span className="text-xs text-white/40">{perspective.role}</span>
        </div>
        {perspective.vote && (
          <span className={`text-xs font-medium ${voteColors[perspective.vote] || 'text-white/40'}`}>
            {voteLabels[perspective.vote] || perspective.vote}
          </span>
        )}
      </div>
      <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
        {perspective.response}
      </p>
    </div>
  );
}

function ConversationCard({ conversation }: { conversation: ConversationWithDecision }) {
  const [expanded, setExpanded] = useState(false);

  const deliberation = conversation.deliberation;
  const decisionLog = conversation.decision_log;
  const recommendation = deliberation?.recommendation || '';
  const ceoReaction = decisionLog?.ceo_reaction as DecisionReaction | null;
  const realOutcome = decisionLog?.real_world_outcome;

  // Gather all perspectives
  const allPerspectives: Perspective[] = deliberation?.perspectives || [];
  const entityDeliberations: EntityDeliberation[] =
    deliberation?.entity_deliberations || [];
  const tensions: TensionPoint[] =
    deliberation?.tensions_detected || decisionLog?.tensions_detected || [];

  // Truncate recommendation
  const truncatedRec =
    recommendation.length > 200
      ? recommendation.substring(0, 200) + '...'
      : recommendation;

  return (
    <div className="border border-white/[0.10] bg-white/[0.03] rounded-xl overflow-hidden transition-all hover:border-white/[0.15] hover:bg-white/[0.04]">
      {/* Card header — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Top row: date + level badge */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-white/40 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(conversation.created_at)}
              </span>
              <LevelBadge level={conversation.route_level} />
              {ceoReaction && <ReactionBadge reaction={ceoReaction} />}
            </div>

            {/* Question */}
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              {conversation.question}
            </p>

            {/* Recommendation preview */}
            {recommendation && (
              <p className="text-xs text-white/50 leading-relaxed">
                {expanded ? '' : truncatedRec}
              </p>
            )}

            {/* Outcome */}
            {realOutcome && !expanded && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-medium text-emerald-400/70 uppercase tracking-wider">
                  Resultado:
                </span>
                <span className="text-xs text-white/50 truncate">{realOutcome}</span>
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <div className="flex-shrink-0 mt-1">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-white/30" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/30" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
          {/* Full recommendation */}
          {recommendation && (
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Recomendacion ARES
              </h4>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Classification details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                Nivel
              </p>
              <LevelBadge level={conversation.route_level} />
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                Confianza
              </p>
              <p className="text-sm text-white/70">
                {Math.round(conversation.route_confidence * 100)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                Complejidad
              </p>
              <p className="text-sm text-white/70 capitalize">
                {conversation.route_complexity || '—'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                Fecha
              </p>
              <p className="text-sm text-white/70">
                {formatDate(conversation.created_at)}
              </p>
            </div>
          </div>

          {/* Route reasoning */}
          {conversation.route_reasoning && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Razonamiento de clasificacion
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">
                {conversation.route_reasoning}
              </p>
            </div>
          )}

          {/* Entity deliberations */}
          {entityDeliberations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                Deliberaciones por entidad
              </h4>
              <div className="space-y-4">
                {entityDeliberations.map((ed, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <EntityBadge entity={ed.entity_name} />
                      {ed.consensus_level > 0 && (
                        <span className="text-[10px] text-white/40">
                          Consenso: {ed.consensus_level}%
                        </span>
                      )}
                    </div>
                    {ed.synthesis && (
                      <p className="text-xs text-white/50 mb-3 pl-3 border-l border-white/[0.08]">
                        {ed.synthesis}
                      </p>
                    )}
                    <div className="space-y-2 pl-3">
                      {ed.perspectives.map((p, j) => (
                        <PerspectiveCard key={j} perspective={p} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flat perspectives (fallback) */}
          {entityDeliberations.length === 0 && allPerspectives.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                Perspectivas
              </h4>
              <div className="space-y-2">
                {allPerspectives.map((p, j) => (
                  <PerspectiveCard key={j} perspective={p} />
                ))}
              </div>
            </div>
          )}

          {/* Tensions */}
          {tensions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Tensiones detectadas
              </h4>
              <div className="space-y-2">
                {tensions.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400/60 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/60">{t.description}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        Entre {t.between_entities.join(' y ')} — Severidad:{' '}
                        {t.severity === 'high'
                          ? 'Alta'
                          : t.severity === 'medium'
                          ? 'Media'
                          : 'Baja'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision & Outcome */}
          {(ceoReaction || realOutcome) && (
            <div className="pt-2 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Decision y resultado
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ceoReaction && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                      Reaccion del CEO
                    </p>
                    <ReactionBadge reaction={ceoReaction} />
                  </div>
                )}
                {realOutcome && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                      Resultado real
                    </p>
                    <p className="text-sm text-white/70">{realOutcome}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function HistoryPage() {
  const [conversations, setConversations] = useState<ConversationWithDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [filterDecision, setFilterDecision] = useState<FilterDecision>('all');

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        const res = await fetch('/api/conversations');
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Error al cargar el historial');
          return;
        }

        setConversations(data.data || []);
      } catch {
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = [...conversations];

    // Filter by level
    if (filterLevel !== 'all') {
      result = result.filter((c) => c.route_level === filterLevel);
    }

    // Filter by decision
    if (filterDecision !== 'all') {
      if (filterDecision === 'none') {
        result = result.filter((c) => {
          const reaction = (c.decision_log as DecisionLog | undefined)?.ceo_reaction;
          return !reaction;
        });
      } else {
        result = result.filter((c) => {
          const reaction = (c.decision_log as DecisionLog | undefined)?.ceo_reaction;
          return reaction === filterDecision;
        });
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.question.toLowerCase().includes(q) ||
          (c.deliberation?.recommendation || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [conversations, filterLevel, filterDecision, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Historial de decisiones
          </h1>
          <p className="text-sm text-white/50">
            Revisa todas tus consultas anteriores a ARES, las deliberaciones de tu equipo
            y los resultados obtenidos.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar en tus preguntas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.10] rounded-xl text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Level filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
              className="appearance-none pl-9 pr-8 py-2 bg-white/[0.03] border border-white/[0.10] rounded-xl text-sm text-white/70 focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
            >
              <option value="all">Todos los niveles</option>
              <option value="CEO_LEVEL">CEO</option>
              <option value="BOARD_LEVEL">Board</option>
              <option value="ASSEMBLY_LEVEL">Asamblea</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          </div>

          {/* Decision filter */}
          <div className="relative">
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value as FilterDecision)}
              className="appearance-none pl-4 pr-8 py-2 bg-white/[0.03] border border-white/[0.10] rounded-xl text-sm text-white/70 focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
            >
              <option value="all">Todas las decisiones</option>
              <option value="accepted">Aceptadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="modified">Modificadas</option>
              <option value="deferred">Diferidas</option>
              <option value="none">Sin decision</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="text-xs text-white/30 mb-4">
            {filtered.length === conversations.length
              ? `${conversations.length} consulta${conversations.length !== 1 ? 's' : ''}`
              : `${filtered.length} de ${conversations.length} consulta${conversations.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-white/20 animate-spin mb-4" />
            <p className="text-sm text-white/40">Cargando tu historial...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <XCircle className="h-8 w-8 text-red-400/50 mb-4" />
            <p className="text-sm text-white/50">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-white/[0.06] rounded-xl bg-white/[0.01]">
            <MessageSquareText className="h-10 w-10 text-white/10 mb-4" />
            {conversations.length === 0 ? (
              <>
                <p className="text-sm text-white/50 mb-1">
                  Aun no has consultado a ARES.
                </p>
                <p className="text-xs text-white/30">
                  Tu historial de decisiones aparecera aqui.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-white/50 mb-1">
                  No se encontraron resultados.
                </p>
                <p className="text-xs text-white/30">
                  Intenta ajustar los filtros o el texto de busqueda.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((conv) => (
              <ConversationCard key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
