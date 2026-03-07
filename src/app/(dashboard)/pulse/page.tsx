'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Activity, RefreshCw, TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react';

const FOCUS_OPTIONS = [
  { value: 'general', label: 'Diagnóstico General', icon: Activity, description: 'Visión 360° de tu empresa' },
  { value: 'financial', label: 'Salud Financiera', icon: DollarSign, description: 'Flujo, deuda, concentración' },
  { value: 'team', label: 'Equipo', icon: Users, description: 'Organización y talento' },
  { value: 'clients', label: 'Clientes', icon: TrendingUp, description: 'Retención, concentración, churn' },
  { value: 'operations', label: 'Operaciones', icon: Briefcase, description: 'Eficiencia y cuellos de botella' },
];

export default function PulsePage() {
  const [focus, setFocus] = useState('general');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generatePulse() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar pulso');
      setResult(data.analysis);
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">ARES Pulse</h1>
              <p className="text-sm text-white/50">Diagnóstico de salud empresarial</p>
            </div>
          </div>
        </div>

        {/* Focus selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {FOCUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = focus === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setFocus(option.value)}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-purple-500/50 bg-purple-500/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : ''}`} />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Generate button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={generatePulse}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Diagnosticando...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Generar Pulso
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
            <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Analizando la salud de tu empresa...</p>
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
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-h2:text-lg prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-purple-300
              prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-li:text-white/70
              prose-strong:text-white
              prose-ul:space-y-1
            ">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(result) }} />
            </div>
          </div>
        )}

        {/* Empty state description */}
        {!result && !loading && !error && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-8 text-center">
            <Activity className="w-10 h-10 text-purple-400/50 mx-auto mb-4" />
            <h2 className="text-base font-medium text-white mb-2">Pulso de tu negocio</h2>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              ARES analiza el perfil de tu empresa, historial de consultas y contexto para generar un diagnóstico integral de la salud de tu negocio con alertas y recomendaciones priorizadas.
            </p>
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
