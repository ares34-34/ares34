'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Loader2, ChevronDown, ChevronUp, Zap, Crown, AlertTriangle } from 'lucide-react';
import type { ARESResponse as ARESResponseType, Conversation, RouteLevel } from '@/lib/types';

interface SubscriptionInfo {
  plan: string;
  status: string;
  is_active: boolean;
  queries_used: number;
  queries_limit: number | null;
  days_left: number | null;
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
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-MX');
}

const levelConfig: Record<RouteLevel, { label: string; color: string; dot: string; bg: string }> = {
  CEO_LEVEL: { label: 'Operativo', color: 'text-blue-400 border-blue-500/30 bg-blue-500/15', dot: 'bg-blue-400', bg: 'border-blue-500/20' },
  BOARD_LEVEL: { label: 'Estratégico', color: 'text-purple-400 border-purple-500/30 bg-purple-500/15', dot: 'bg-purple-400', bg: 'border-purple-500/20' },
  ASSEMBLY_LEVEL: { label: 'Capital', color: 'text-red-400 border-red-500/30 bg-red-500/15', dot: 'bg-red-400', bg: 'border-red-500/20' },
};

const loadingMessages = [
  'Clasificando tu pregunta...',
  'Activando agentes especializados...',
  'Tus asesores están deliberando...',
  'Sintetizando recomendación...',
];

function ARESResponseDisplay({ data }: { data: ARESResponseType }) {
  const level = levelConfig[data.level];
  return (
    <div className={`border ${level.bg} bg-white/[0.04] rounded-2xl p-6 space-y-5 animate-in fade-in duration-500`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${level.dot}`} />
          <h3 className="text-sm font-semibold text-white">Recomendación de ARES</h3>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${level.color}`}>
          {level.label}
        </span>
      </div>

      <div className="rounded-xl bg-white/[0.05] p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
          {data.recommendation}
        </p>
      </div>

      {data.perspectives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Opiniones de tus asesores ({data.perspectives.length})
          </h4>
          <div className="grid gap-3">
            {data.perspectives.map((p, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-4 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white/60">{p.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/70">{p.name}</p>
                    <p className="text-[10px] text-white/35">{p.role}</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-white/55 leading-relaxed">{p.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ARESResponseType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [configReady, setConfigReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch('/api/config');
        const json = await res.json();
        if (!json.success || !json.data || !json.data.onboarding_completed) {
          router.replace('/onboarding');
          return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate loading messages
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < loadingMessages.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  async function fetchConversations() {
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
  }

  async function fetchSubscription() {
    try {
      const res = await fetch('/api/payments/status');
      const json = await res.json();
      if (json.success) {
        setSubscription(json.data);
      }
    } catch {
      // Silently fail
    }
  }

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
        // Handle subscription-specific errors
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
      fetchConversations();
      // Update subscription info with new query count
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
          <Loader2 className="h-4 w-4 animate-spin text-white/40" />
          <p className="text-sm text-white/40">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Subscription status bar */}
        {subscription && (
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            !subscription.is_active
              ? 'border-red-500/20 bg-red-500/5'
              : subscription.plan === 'trial'
                ? 'border-orange-500/20 bg-orange-500/5'
                : 'border-white/10 bg-white/[0.03]'
          }`}>
            <div className="flex items-center gap-3">
              {!subscription.is_active ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : subscription.plan === 'empresarial' ? (
                <Crown className="h-4 w-4 text-yellow-400" />
              ) : (
                <Zap className="h-4 w-4 text-blue-400" />
              )}
              <div>
                <span className={`text-sm font-medium ${
                  !subscription.is_active ? 'text-red-400' : 'text-white/70'
                }`}>
                  {subscription.plan === 'trial' ? 'Prueba gratuita' :
                   subscription.plan === 'inicial' ? 'Plan Inicial' :
                   subscription.plan === 'pro' ? 'Plan Pro' :
                   subscription.plan === 'empresarial' ? 'Plan Empresarial' :
                   'Sin plan'}
                </span>
                {subscription.is_active && subscription.queries_limit && (
                  <span className="text-xs text-white/30 ml-2">
                    {subscription.queries_used}/{subscription.queries_limit} consultas usadas
                  </span>
                )}
                {subscription.is_active && !subscription.queries_limit && subscription.plan !== 'trial' && (
                  <span className="text-xs text-white/30 ml-2">
                    Consultas ilimitadas
                  </span>
                )}
                {!subscription.is_active && (
                  <span className="text-xs text-red-400/60 ml-2">
                    Suscripción inactiva
                  </span>
                )}
              </div>
            </div>
            {(subscription.plan === 'trial' || subscription.plan === 'inicial') && subscription.is_active && (
              <a
                href="/settings#plan"
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80 transition-all"
              >
                Mejorar plan
              </a>
            )}
            {!subscription.is_active && (
              <a
                href="/settings#plan"
                className="text-xs px-3 py-1.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all"
              >
                Elegir plan
              </a>
            )}
          </div>
        )}

        {/* Question Input */}
        <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-6 space-y-4">
          <textarea
            placeholder="¿Qué decisión necesitas tomar? Escribe tu pregunta aquí..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={4}
            maxLength={2000}
            autoFocus
            className="w-full resize-none rounded-xl bg-white/[0.06] p-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/15 leading-relaxed appearance-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/25">
              {question.length}/2000
              {question.length > 0 && ' · ⌘+Enter para enviar'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
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
          <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-white/50 animate-spin" />
              </div>
              <div>
                <p className="text-sm text-white/70 font-medium">{loadingMessages[loadingStep]}</p>
                <p className="text-xs text-white/30 mt-0.5">Esto puede tomar unos segundos</p>
              </div>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-2 pl-11">
              {loadingMessages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i <= loadingStep
                      ? 'w-6 bg-white/40'
                      : 'w-1.5 bg-white/10'
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
            <div className="h-px bg-white/10" />
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-white/35 uppercase tracking-wider">
                Consultas recientes
              </h2>

              {loadingHistory && (
                <div className="space-y-3">
                  <div className="h-16 w-full rounded-xl bg-white/[0.05] animate-pulse" />
                  <div className="h-16 w-full rounded-xl bg-white/[0.05] animate-pulse" />
                </div>
              )}

              {conversations.map((conv) => {
                const level = levelConfig[conv.route_level];
                const isExpanded = expandedId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                    className="border border-white/10 bg-white/[0.03] rounded-xl p-4 cursor-pointer hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${level.dot}`} />
                        <p className="text-sm text-white/65 flex-1 min-w-0">
                          {isExpanded
                            ? conv.question
                            : conv.question.length > 90
                              ? conv.question.slice(0, 90) + '...'
                              : conv.question}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-white/25 whitespace-nowrap">
                          {formatRelativeDate(conv.created_at)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-white/30" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-white/15 group-hover:text-white/30 transition-colors" />
                        )}
                      </div>
                    </div>

                    {isExpanded && conv.deliberation && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3 ml-4">
                        <div className="rounded-xl bg-white/[0.05] p-4">
                          <h4 className="mb-2 text-xs font-medium text-white/35">Recomendación</h4>
                          <p className="whitespace-pre-wrap text-sm text-white/65 leading-relaxed">
                            {conv.deliberation.recommendation}
                          </p>
                        </div>
                        {conv.deliberation.perspectives.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-white/35">Asesores</h4>
                            {conv.deliberation.perspectives.map((p, i) => (
                              <div key={i} className="border border-white/[0.08] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="text-[9px] font-bold text-white/50">{p.name.charAt(0)}</span>
                                  </div>
                                  <p className="text-xs font-medium text-white/45">{p.name} · {p.role}</p>
                                </div>
                                <p className="whitespace-pre-wrap text-xs text-white/40 leading-relaxed ml-7">
                                  {p.response}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loadingHistory && conversations.length === 0 && !response && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-5 w-5 text-white/25" />
            </div>
            <p className="text-white/30 text-sm">
              Escribe tu primera pregunta y ARES activará a tus asesores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
