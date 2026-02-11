'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ARESResponse as ARESResponseType, Conversation, RouteLevel } from '@/lib/types';

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

const levelConfig: Record<RouteLevel, { label: string; color: string }> = {
  CEO_LEVEL: { label: 'Operativo', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  BOARD_LEVEL: { label: 'Estratégico', color: 'text-purple-400 border-purple-400/30 bg-purple-400/10' },
  ASSEMBLY_LEVEL: { label: 'Capital', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
};

function ARESResponseDisplay({ data }: { data: ARESResponseType }) {
  const level = levelConfig[data.level];
  return (
    <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Lo que recomienda ARES</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${level.color}`}>
          {level.label}
        </span>
      </div>

      <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
          {data.recommendation}
        </p>
      </div>

      {data.perspectives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-white/30">Lo que opinan tus asesores</h4>
          {data.perspectives.map((p, i) => (
            <div key={i} className="border border-white/[0.05] rounded-xl p-4">
              <p className="mb-2 text-xs font-semibold text-white/50">{p.name} — {p.role}</p>
              <p className="whitespace-pre-wrap text-sm text-white/40">{p.response}</p>
            </div>
          ))}
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
      } catch {
        // If config check fails, still show dashboard
        setConfigReady(true);
        fetchConversations();
      }
    }
    checkConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleSubmit() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Error al procesar tu pregunta');
        return;
      }
      setResponse(json.data);
      setQuestion('');
      fetchConversations();
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
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/40" />
          <p className="text-sm text-white/30">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Question Input */}
        <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-6 space-y-4">
          <textarea
            placeholder="¿Qué decisión necesitas tomar? Escribe aquí tu pregunta..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={4}
            maxLength={2000}
            className="w-full resize-none bg-transparent border-none text-white text-sm placeholder:text-white/20 focus:outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
            <span className="text-xs text-white/15">
              {question.length}/2000
              {question.length > 0 && ' · Ctrl+Enter para enviar'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Consultando...' : 'Consultar a ARES'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
              <p className="text-sm text-white/30">ARES está analizando tu pregunta...</p>
            </div>
            <div className="space-y-3">
              <div className="h-24 w-full rounded-xl bg-white/[0.03] animate-pulse" />
              <div className="h-16 w-full rounded-xl bg-white/[0.03] animate-pulse" />
              <div className="h-16 w-3/4 rounded-xl bg-white/[0.03] animate-pulse" />
            </div>
          </div>
        )}

        {/* Response */}
        {response && !loading && <ARESResponseDisplay data={response} />}

        {/* Separator */}
        <div className="h-px bg-white/[0.05]" />

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-white/30">Consultas recientes</h2>

          {loadingHistory && (
            <div className="space-y-3">
              <div className="h-16 w-full rounded-xl bg-white/[0.03] animate-pulse" />
              <div className="h-16 w-full rounded-xl bg-white/[0.03] animate-pulse" />
            </div>
          )}

          {!loadingHistory && conversations.length === 0 && (
            <p className="text-sm text-white/15">
              Aún no has hecho preguntas. Escribe tu primera consulta arriba.
            </p>
          )}

          {conversations.map((conv) => {
            const level = levelConfig[conv.route_level];
            const isExpanded = expandedId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white/60 flex-1 min-w-0">
                    {isExpanded
                      ? conv.question
                      : conv.question.length > 80
                        ? conv.question.slice(0, 80) + '...'
                        : conv.question}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${level.color}`}>
                      {level.label}
                    </span>
                    <span className="text-xs text-white/15 whitespace-nowrap">
                      {formatRelativeDate(conv.created_at)}
                    </span>
                  </div>
                </div>

                {isExpanded && conv.deliberation && (
                  <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-3">
                    <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-4">
                      <h4 className="mb-2 text-xs font-medium text-white/25">Lo que recomienda ARES</h4>
                      <p className="whitespace-pre-wrap text-sm text-white/50">
                        {conv.deliberation.recommendation}
                      </p>
                    </div>
                    {conv.deliberation.perspectives.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-white/25">Opiniones de tus asesores</h4>
                        {conv.deliberation.perspectives.map((p, i) => (
                          <div key={i} className="border border-white/[0.05] rounded-xl p-3">
                            <p className="mb-1 text-xs font-medium text-white/40">
                              {p.name} — {p.role}
                            </p>
                            <p className="whitespace-pre-wrap text-xs text-white/30">
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
      </div>
    </div>
  );
}
