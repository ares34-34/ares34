'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

function getLevelBadge(level: RouteLevel) {
  const config: Record<RouteLevel, { label: string; className: string }> = {
    CEO_LEVEL: { label: 'Nivel CEO', className: 'bg-ares-blue text-white' },
    BOARD_LEVEL: { label: 'Nivel Board', className: 'bg-ares-purple text-white' },
    ASSEMBLY_LEVEL: { label: 'Nivel Asamblea', className: 'bg-ares-red text-white' },
  };
  return config[level];
}

// Inline fallback for ARESResponse component (will be replaced by shared component)
function ARESResponseDisplay({ data }: { data: ARESResponseType }) {
  const badge = getLevelBadge(data.level);
  return (
    <Card className="border-0 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">Recomendación de ARES</CardTitle>
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-white/5 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
            {data.recommendation}
          </p>
        </div>
        {data.perspectives.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400">Perspectivas del consejo</h4>
            {data.perspectives.map((p, i) => (
              <div key={i} className="rounded-lg border border-white/10 p-3">
                <p className="mb-1 text-xs font-semibold text-ares-blue">{p.name} — {p.role}</p>
                <p className="whitespace-pre-wrap text-sm text-gray-300">{p.response}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ARESResponseType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch('/api/conversations');
      const json = await res.json();
      if (json.success) {
        setConversations(json.data);
      }
    } catch {
      // Silently fail on history load
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
      // Refresh history
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

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Question Input */}
        <Card className="border-0 bg-white/5">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Escribe tu pregunta o decisión..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="min-h-[120px] resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus-visible:border-ares-blue focus-visible:ring-ares-blue/30"
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {question.length}/2000 caracteres
                {question.length > 0 && ' · Ctrl+Enter para enviar'}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!question.trim() || loading}
                size="lg"
                className="bg-ares-blue text-white hover:bg-ares-blue/90"
              >
                {loading ? 'Consultando...' : 'Consultar a ARES'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-ares-blue" />
              <p className="text-sm text-gray-400">ARES está deliberando tu pregunta...</p>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-24 w-full bg-white/5" />
              <Skeleton className="h-16 w-full bg-white/5" />
              <Skeleton className="h-16 w-3/4 bg-white/5" />
            </div>
          </div>
        )}

        {/* Response */}
        {response && !loading && <ARESResponseDisplay data={response} />}

        {/* History */}
        <Separator className="bg-white/10" />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-300">Consultas Recientes</h2>

          {loadingHistory && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full bg-white/5" />
              <Skeleton className="h-16 w-full bg-white/5" />
            </div>
          )}

          {!loadingHistory && conversations.length === 0 && (
            <p className="text-sm text-gray-500">
              Aún no tienes consultas. Haz tu primera pregunta a ARES.
            </p>
          )}

          {conversations.map((conv) => {
            const badge = getLevelBadge(conv.route_level);
            const isExpanded = expandedId === conv.id;

            return (
              <Card
                key={conv.id}
                className="cursor-pointer border-0 bg-white/5 transition-colors hover:bg-white/[0.07]"
                onClick={() => setExpandedId(isExpanded ? null : conv.id)}
              >
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-200">
                        {isExpanded
                          ? conv.question
                          : conv.question.length > 80
                            ? conv.question.slice(0, 80) + '...'
                            : conv.question}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge className={badge.className}>{badge.label}</Badge>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeDate(conv.created_at)}
                      </span>
                    </div>
                  </div>

                  {isExpanded && conv.deliberation && (
                    <div className="space-y-3 pt-2">
                      <Separator className="bg-white/10" />
                      <div className="rounded-lg bg-white/5 p-3">
                        <h4 className="mb-2 text-xs font-semibold text-gray-400">Recomendación</h4>
                        <p className="whitespace-pre-wrap text-sm text-gray-300">
                          {conv.deliberation.recommendation}
                        </p>
                      </div>
                      {conv.deliberation.perspectives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-400">Perspectivas</h4>
                          {conv.deliberation.perspectives.map((p, i) => (
                            <div key={i} className="rounded-lg border border-white/10 p-2">
                              <p className="mb-1 text-xs font-semibold text-ares-blue">
                                {p.name} — {p.role}
                              </p>
                              <p className="whitespace-pre-wrap text-xs text-gray-400">
                                {p.response}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
