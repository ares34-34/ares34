'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield, Send, RefreshCw, AlertTriangle, FileSignature, Scale, Copy, Check } from 'lucide-react';

// ============================================================
// TAB: COMPLIANCE CHECKER
// ============================================================

const EXAMPLE_QUERIES = [
  '¿Estoy cumpliendo con la nueva reforma de outsourcing?',
  '¿Qué obligaciones tengo con el SAT para facturación 4.0?',
  '¿Cuáles son mis obligaciones con IMSS e INFONAVIT?',
  '¿Necesito un aviso de privacidad para mi sitio web?',
  '¿Qué implica el PTU (reparto de utilidades) este año?',
  '¿Puedo hacer home office permanente según la LFT?',
];

const RISK_BADGES: Record<string, { label: string; color: string }> = {
  bajo: { label: 'Riesgo Bajo', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  medio: { label: 'Riesgo Medio', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  alto: { label: 'Riesgo Alto', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  critico: { label: 'Riesgo Critico', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
};

const AREA_LABELS: Record<string, string> = {
  sat: 'SAT — Fiscal',
  imss: 'IMSS — Seguridad Social',
  infonavit: 'INFONAVIT — Vivienda',
  lft: 'LFT — Laboral',
  lfpdppp: 'LFPDPPP — Datos Personales',
  cofece: 'COFECE — Competencia',
  general: 'General',
};

// ============================================================
// TAB: CONTRACT GENERATOR
// ============================================================

const CONTRACT_TYPES = [
  {
    key: 'nda',
    label: 'NDA',
    description: 'Acuerdo de Confidencialidad',
    icon: '🔒',
  },
  {
    key: 'servicios',
    label: 'Servicios',
    description: 'Prestación de Servicios Profesionales',
    icon: '📋',
  },
  {
    key: 'laboral',
    label: 'Laboral',
    description: 'Contrato Individual de Trabajo',
    icon: '👤',
  },
  {
    key: 'arrendamiento',
    label: 'Arrendamiento',
    description: 'Arrendamiento Comercial',
    icon: '🏢',
  },
  {
    key: 'sociedad',
    label: 'Sociedad',
    description: 'Contrato de Sociedad / Asociación',
    icon: '🤝',
  },
  {
    key: 'proveedor',
    label: 'Proveedor',
    description: 'Contrato con Proveedor',
    icon: '📦',
  },
];

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'compliance' | 'contracts'>('compliance');

  // Compliance state
  const [query, setQuery] = useState('');
  const [complianceResult, setComplianceResult] = useState<{
    analysis: string;
    area: string;
    risk_level: string;
  } | null>(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceError, setComplianceError] = useState('');

  // Contract state
  const [contractType, setContractType] = useState('');
  const [contractPrompt, setContractPrompt] = useState('');
  const [contractResult, setContractResult] = useState<{
    content: string;
    title: string;
    contract_type: string;
  } | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  async function checkCompliance(input?: string) {
    const text = input || query;
    if (text.trim().length < 10) return;

    setComplianceLoading(true);
    setComplianceError('');
    setComplianceResult(null);
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el análisis');
      setComplianceResult({
        analysis: data.analysis,
        area: data.area,
        risk_level: data.risk_level,
      });
      toast.success('Análisis de cumplimiento completado');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setComplianceError(msg);
      toast.error('Ocurrió un error en el análisis de cumplimiento');
    } finally {
      setComplianceLoading(false);
    }
  }

  async function generateContract() {
    if (!contractType || contractPrompt.trim().length < 10) return;

    setContractLoading(true);
    setContractError('');
    setContractResult(null);
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_type: contractType,
          prompt: contractPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar contrato');
      setContractResult({
        content: data.content,
        title: data.title,
        contract_type: data.contract_type,
      });
      toast.success('Contrato generado correctamente');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setContractError(msg);
      toast.error('Ocurrió un error al generar el contrato');
    } finally {
      setContractLoading(false);
    }
  }

  async function copyContract() {
    if (!contractResult) return;
    await navigator.clipboard.writeText(contractResult.content);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">ARES Legal</h1>
            <p className="text-sm text-white/50">Cumplimiento y contratos para tu empresa</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'compliance'
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.04]'
            }`}
          >
            <Scale className="w-4 h-4" />
            Verificar Cumplimiento
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'contracts'
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.04]'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            Generar Contrato
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB: COMPLIANCE */}
        {/* ============================================================ */}
        {activeTab === 'compliance' && (
          <>
            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80">
                ARES Compliance es una herramienta de orientación, no sustituye la asesoría legal formal. Para temas críticos, consulta a un abogado especialista.
              </p>
            </div>

            {/* Input */}
            <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 mb-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                ¿Qué necesitas verificar?
              </label>
              <div className="flex gap-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe tu duda de cumplimiento legal o regulatorio..."
                  rows={2}
                  maxLength={3000}
                  className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
                <button
                  onClick={() => checkCompliance()}
                  disabled={complianceLoading || query.trim().length < 10}
                  className="self-end px-5 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {complianceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {complianceLoading ? 'Analizando...' : 'Verificar'}
                </button>
              </div>
            </div>

            {/* Example queries */}
            {!complianceResult && !complianceLoading && (
              <div className="mb-6">
                <span className="text-sm text-white/50 mb-3 block">Consultas frecuentes</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXAMPLE_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(q);
                        checkCompliance(q);
                      }}
                      className="text-left px-4 py-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {complianceLoading && (
              <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
                <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-white/70">Analizando marco legal mexicano aplicable...</p>
                <p className="text-sm text-white/40 mt-2">Esto toma ~15 segundos</p>
              </div>
            )}

            {/* Error */}
            {complianceError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-400">{complianceError}</p>
              </div>
            )}

            {/* Result */}
            {complianceResult && !complianceLoading && (
              <div className="relative rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <button
                  onClick={() => copyToClipboard(complianceResult.analysis)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                  title="Copiar análisis"
                >
                  <Copy className="w-4 h-4 text-white/40 hover:text-white/80 transition-colors" />
                </button>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${RISK_BADGES[complianceResult.risk_level]?.color || RISK_BADGES.medio.color}`}>
                    {RISK_BADGES[complianceResult.risk_level]?.label || 'Riesgo Medio'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/5 text-white/60">
                    {AREA_LABELS[complianceResult.area] || 'General'}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-white prose-headings:font-semibold
                  prose-h2:text-lg prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-emerald-300
                  prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-white/70 prose-p:leading-relaxed
                  prose-li:text-white/70
                  prose-strong:text-white
                  prose-ul:space-y-1
                ">
                  <div dangerouslySetInnerHTML={{ __html: markdownToHtml(complianceResult.analysis) }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* TAB: CONTRACTS */}
        {/* ============================================================ */}
        {activeTab === 'contracts' && (
          <>
            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80">
                Los contratos generados son borradores que deben ser revisados por un abogado antes de firmarse. ARES no sustituye asesoría legal profesional.
              </p>
            </div>

            {/* Contract Type Selector */}
            {!contractResult && !contractLoading && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Tipo de contrato
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTRACT_TYPES.map((ct) => (
                    <button
                      key={ct.key}
                      onClick={() => setContractType(ct.key)}
                      className={`text-left px-4 py-3 rounded-lg border transition-all ${
                        contractType === ct.key
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="text-lg mb-1">{ct.icon}</div>
                      <div className="text-sm font-medium">{ct.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{ct.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contract Prompt Input */}
            {!contractResult && !contractLoading && (
              <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 mb-6">
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Describe lo que necesitas en el contrato
                </label>
                <textarea
                  value={contractPrompt}
                  onChange={(e) => setContractPrompt(e.target.value)}
                  placeholder="Ej: Necesito un contrato de servicios para un desarrollador freelance que va a trabajar 3 meses en un proyecto de software. El monto es de $150,000 MXN mensuales..."
                  rows={4}
                  maxLength={5000}
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/30">{contractPrompt.length}/5,000 caracteres</p>
                  <button
                    onClick={generateContract}
                    disabled={contractLoading || !contractType || contractPrompt.trim().length < 10}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FileSignature className="w-4 h-4" />
                    Generar Contrato
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {contractLoading && (
              <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
                <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-white/70">Generando contrato con marco legal mexicano...</p>
                <p className="text-sm text-white/40 mt-2">Esto toma ~20 segundos</p>
              </div>
            )}

            {/* Error */}
            {contractError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-400">{contractError}</p>
              </div>
            )}

            {/* Contract Result */}
            {contractResult && !contractLoading && (
              <div>
                {/* Actions bar */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {CONTRACT_TYPES.find((ct) => ct.key === contractResult.contract_type)?.label || 'Contrato'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyContract}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                      onClick={() => {
                        setContractResult(null);
                        setContractPrompt('');
                        setContractType('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Nuevo
                    </button>
                  </div>
                </div>

                {/* Contract content */}
                <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-headings:text-white prose-headings:font-semibold
                    prose-h2:text-lg prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-emerald-300
                    prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-white/70 prose-p:leading-relaxed
                    prose-li:text-white/70
                    prose-strong:text-white
                    prose-ul:space-y-1
                  ">
                    <div dangerouslySetInnerHTML={{ __html: markdownToHtml(contractResult.content) }} />
                  </div>
                </div>
              </div>
            )}
          </>
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
