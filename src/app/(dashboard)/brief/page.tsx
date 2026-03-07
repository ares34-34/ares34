'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Sun, RefreshCw, Clock, AlertTriangle, Target, TrendingUp } from 'lucide-react';

export default function BriefPage() {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateBrief() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brief', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar brief');
      setBrief(data.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">ARES Brief</h1>
              <p className="text-sm text-white/50">Tu briefing ejecutivo del día</p>
            </div>
          </div>
          <button
            onClick={generateBrief}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                Generar Brief de Hoy
              </>
            )}
          </button>
        </div>

        {/* Empty state */}
        {!brief && !loading && !error && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
            <Sun className="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-white mb-2">Tu brief matutino</h2>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              ARES analiza el estado de tu empresa, decisiones pendientes y contexto de mercado para darte un resumen ejecutivo personalizado cada día.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
              {[
                { icon: TrendingUp, label: 'KPIs clave' },
                { icon: Clock, label: 'Decisiones pendientes' },
                { icon: AlertTriangle, label: 'Alertas de riesgo' },
                { icon: Target, label: 'Prioridades del día' },
                { icon: TrendingUp, label: 'Contexto de mercado' },
                { icon: RefreshCw, label: 'Actualizado diario' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <item.icon className="w-3.5 h-3.5 text-amber-400/70" />
                  <span className="text-xs text-white/60">{item.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={generateBrief}
              className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
            >
              Generar mi primer brief
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
            <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Analizando tu empresa y generando el brief...</p>
            <p className="text-sm text-white/40 mt-2">Esto toma ~10 segundos</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={generateBrief}
              className="mt-4 px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Brief content */}
        {brief && !loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-h2:text-lg prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-amber-300
              prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-li:text-white/70
              prose-strong:text-white
              prose-ul:space-y-1
            ">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(brief) }} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.*$)/gim, (match) => {
      if (match.trim() === '' || match.startsWith('<')) return match;
      return `<p>${match}</p>`;
    })
    .replace(/<p><\/p>/g, '');
}
