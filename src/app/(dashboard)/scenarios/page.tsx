'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { GitBranch, Send, RefreshCw, Lightbulb } from 'lucide-react';

const EXAMPLE_SCENARIOS = [
  '¿Qué pasa si abro una segunda sucursal en Guadalajara?',
  '¿Qué pasa si pierdo a mi cliente más grande?',
  '¿Qué pasa si subo mis precios un 20%?',
  '¿Qué pasa si contrato un COO para delegar operaciones?',
  '¿Qué pasa si el tipo de cambio sube a $22 MXN por dólar?',
  '¿Qué pasa si lanzo una línea de producto completamente nueva?',
];

export default function ScenariosPage() {
  const [hypothesis, setHypothesis] = useState('');
  const [result, setResult] = useState<{ analysis: string; category: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyzeScenario(input?: string) {
    const text = input || hypothesis;
    if (text.trim().length < 10) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al analizar');
      setResult({ analysis: data.analysis, category: data.category });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  const categoryLabels: Record<string, { label: string; color: string }> = {
    expansion: { label: 'Expansión', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    financial: { label: 'Financiero', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    hiring: { label: 'Equipo', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    product: { label: 'Producto', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    market: { label: 'Mercado', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    regulatory: { label: 'Regulatorio', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
    crisis: { label: 'Crisis', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
    general: { label: 'General', color: 'text-white/60 border-white/20 bg-white/5' },
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">ARES Scenarios</h1>
            <p className="text-sm text-white/50">Motor de escenarios &quot;¿Qué pasa si...?&quot;</p>
          </div>
        </div>

        {/* Input */}
        <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 mb-6">
          <label className="block text-sm font-medium text-white/70 mb-3">
            Plantea tu escenario hipotético
          </label>
          <div className="flex gap-3">
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="¿Qué pasa si..."
              rows={2}
              maxLength={2000}
              className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <button
              onClick={() => analyzeScenario()}
              disabled={loading || hypothesis.trim().length < 10}
              className="self-end px-5 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Analizando...' : 'Analizar'}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">{hypothesis.length}/2,000 caracteres</p>
        </div>

        {/* Example scenarios */}
        {!result && !loading && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400/70" />
              <span className="text-sm text-white/50">Escenarios de ejemplo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLE_SCENARIOS.map((scenario, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setHypothesis(scenario);
                    analyzeScenario(scenario);
                  }}
                  className="text-left px-4 py-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Analizando escenario con el contexto de tu empresa...</p>
            <p className="text-sm text-white/40 mt-2">Esto toma ~15 segundos</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
            {/* Category badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoryLabels[result.category]?.color || categoryLabels.general.color}`}>
                {categoryLabels[result.category]?.label || 'General'}
              </span>
            </div>
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-h2:text-lg prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-blue-300
              prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-li:text-white/70
              prose-strong:text-white
              prose-ul:space-y-1
            ">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(result.analysis) }} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

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
