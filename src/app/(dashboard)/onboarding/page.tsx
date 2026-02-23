'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Loader2, Check, ArrowRight, ArrowLeft, Sparkles, Building2, Brain, Target, Upload, Trash2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Archetype, CompanyDocument } from '@/lib/types';

const archetypeEmoji: Record<string, string> = {
  arch_visionary: '🚀',
  arch_value: '💰',
  arch_product: '🎯',
  arch_data: '📊',
  arch_execution: '⚡',
  arch_institution: '🏛️',
  arch_strategic: '♟️',
  arch_mission: '🌍',
};

const archetypeShortDesc: Record<string, string> = {
  arch_visionary: 'Piensa en grande, rompe reglas y apuesta por lo que viene',
  arch_value: 'Cuida cada peso, busca retorno y protege tu capital',
  arch_product: 'Todo gira alrededor de lo que el cliente necesita',
  arch_data: 'Las decisiones se toman con números, no con corazonadas',
  arch_execution: 'Menos planes, más acción. Resultados medibles cada semana',
  arch_institution: 'Construye sistemas, procesos y equipos que duren',
  arch_strategic: 'Ve 3 pasos adelante y posiciona la empresa a largo plazo',
  arch_mission: 'El negocio existe para resolver un problema real del mundo',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [archetypesLoading, setArchetypesLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('fundador');

  // Capa 1: Identidad del negocio
  const [businessType, setBusinessType] = useState('');
  const [revenueModel, setRevenueModel] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [geography, setGeography] = useState('');

  // Capa 2: La mente del CEO
  const [inspiration, setInspiration] = useState('');
  const [kpis, setKpis] = useState('');
  const [successDefinition, setSuccessDefinition] = useState('');
  const [strength, setStrength] = useState('');

  // Capa 3: Contexto estratégico
  const [yearlyPriorities, setYearlyPriorities] = useState('');
  const [topChallenges, setTopChallenges] = useState('');
  const [sleeplessDecisions, setSleeplessDecisions] = useState('');
  const [hasInvestors, setHasInvestors] = useState('');

  // Documentos
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Archetype
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient();
        const [archetypesResult, subResult, docsResult] = await Promise.all([
          supabase.from('archetypes').select('*').eq('type', 'archetype'),
          fetch('/api/payments/status'),
          fetch('/api/uploads/documents'),
        ]);
        if (!archetypesResult.error) {
          setArchetypes(archetypesResult.data || []);
        }
        const subJson = await subResult.json();
        if (subJson.success && subJson.data) {
          setUserPlan(subJson.data.plan || 'trial');
        }
        const docsJson = await docsResult.json();
        if (docsJson.success && docsJson.data) {
          setDocuments(docsJson.data);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setArchetypesLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasFullAccess = userPlan === 'empresarial' || userPlan === 'fundador';
  // 3 capas + documentos + archetype + summary = 6 steps (full), 4 steps (basic)
  const totalSteps = hasFullAccess ? 6 : 4;

  async function handleUpload(file: File) {
    if (documents.length >= 10) {
      toast.error('Máximo 10 documentos. Elimina uno antes de subir otro.');
      return;
    }
    if (file.type !== 'application/pdf') {
      toast.error('Solo se aceptan archivos PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede pesar más de 10 MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        toast.success('Documento subido correctamente');
        setDocuments((prev) => [json.data, ...prev]);
      } else {
        toast.error(json.error || 'Error al subir el documento');
      }
    } catch {
      toast.error('Error de conexión al subir el documento');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(docId: string) {
    try {
      const res = await fetch('/api/uploads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      });
      const json = await res.json();
      if (json.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        toast.success('Documento eliminado');
      } else {
        toast.error(json.error || 'Error al eliminar el documento');
      }
    } catch {
      toast.error('Error de conexión al eliminar');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Pack the 3 layers into the 5 existing DB fields
      const businessIdentity = [
        `Giro: ${businessType}`,
        `Modelo de ingresos: ${revenueModel}`,
        `Mercado: ${targetMarket}`,
        `Tamaño: ${companySize}`,
        `Geografía: ${geography}`,
      ].join('\n');

      const ceoKpis = kpis;

      const ceoMindset = [
        `Fortaleza como líder: ${strength}`,
        `Define éxito en 12 meses como: ${successDefinition}`,
      ].join('\n');

      const strategicContext = [
        `Prioridades del año: ${yearlyPriorities}`,
        `Retos más urgentes: ${topChallenges}`,
        `Decisiones que le quitan el sueño: ${sleeplessDecisions}`,
        `Inversionistas o socios: ${hasInvestors}`,
      ].join('\n');

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ceo_kpi_1: businessIdentity,
          ceo_kpi_2: ceoKpis,
          ceo_kpi_3: ceoMindset,
          ceo_inspiration: inspiration,
          ceo_main_goal: strategicContext,
          custom_board_archetype_id: selectedArchetype?.id || null,
          onboarding_completed: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        console.error('Error al guardar configuración:', data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setLoading(false);
    }
  };

  // Validation per step
  const step1Valid = businessType.trim() && revenueModel.trim() && targetMarket.trim() && companySize.trim();
  const step2Valid = inspiration.trim() && kpis.trim() && successDefinition.trim();
  const step3Valid = yearlyPriorities.trim() && topChallenges.trim();
  const archetypeStepValid = hasFullAccess ? selectedArchetype !== null : true;

  const isDocumentsStep = hasFullAccess && step === 4;
  const isArchetypeStep = hasFullAccess && step === 5;
  const isSummaryStep = step === totalSteps;

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-12 app-ambient-bg">
      {/* Subtle ambient background effects */}
      <div className="app-glow-1" />
      <div className="app-glow-2" />
      <div className="app-glow-3" />
      <div className="app-grid-subtle" />
      <div className="app-orb app-orb-1" />
      <div className="app-orb app-orb-2" />
      <div className="app-orb app-orb-3" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s === step
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : s < step
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.06] text-white border border-white/15'
                  }`}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < totalSteps && (
                  <div
                    className={`w-10 h-px ${
                      s < step ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step label */}
        <div className="text-center mb-8">
          <p className="text-xs text-emerald-400/80 uppercase tracking-wider">
            Paso {step} de {totalSteps}
          </p>
        </div>

        {/* ===================== CAPA 1: Identidad del negocio ===================== */}
        {step === 1 && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Building2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Tu negocio hoy
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-8 ml-8">
              Para que ARES entienda tu empresa y te dé recomendaciones relevantes.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿A qué se dedica tu empresa?</label>
                <input
                  placeholder="Ej: Vendemos software de contabilidad para restaurantes"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/40">El giro exacto de tu negocio.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cómo gana dinero tu empresa?</label>
                <input
                  placeholder="Ej: Suscripción mensual de $999 MXN por restaurante"
                  value={revenueModel}
                  onChange={(e) => setRevenueModel(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/40">Tu modelo de ingresos principal.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm text-white font-medium">¿A quién le vendes?</label>
                  <input
                    placeholder="Ej: Restaurantes medianos en CDMX"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-xs text-white/40">B2B, B2C, o ambos.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-medium">¿Dónde operas?</label>
                  <input
                    placeholder="Ej: CDMX y Monterrey"
                    value={geography}
                    onChange={(e) => setGeography(e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-xs text-white/40">Ciudades o regiones.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿De qué tamaño es tu empresa?</label>
                <input
                  placeholder="Ej: 8 empleados, $200K MXN/mes en ventas, llevamos 2 años"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/40">Empleados, ingresos aproximados y etapa.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== CAPA 2: La mente del CEO ===================== */}
        {step === 2 && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Brain className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Cómo piensas y decides
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-8 ml-8">
              Para que tu asesor hable tu idioma y se adapte a tu estilo.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Qué líderes o autores inspiran cómo manejas tu negocio?</label>
                <input
                  placeholder="Ej: Carlos Slim, mi papá, El método Lean Startup"
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/40">Tu asesor adoptará parte de su filosofía al aconsejarte.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuáles son tus 3 a 5 números clave que revisas siempre?</label>
                <textarea
                  placeholder={"Ej:\n- Ventas mensuales: $500K MXN\n- Costo por cliente: $2,000 MXN\n- Retención de clientes: 85%\n- Margen neto: 22%"}
                  value={kpis}
                  onChange={(e) => setKpis(e.target.value)}
                  rows={4}
                  className={textareaClass}
                />
                <p className="text-xs text-white/40">Tus KPIs no negociables — los que revisas diario o semanal.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cómo defines éxito para ti en los próximos 12 meses?</label>
                <input
                  placeholder="Ej: Facturar $2M MXN y tener un equipo de 15 personas"
                  value={successDefinition}
                  onChange={(e) => setSuccessDefinition(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/40">ARES evaluará cada decisión pensando en cómo te acerca a esto.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuál es tu mayor fortaleza como líder?</label>
                <input
                  placeholder="Ej: Soy bueno vendiendo y armando relaciones comerciales"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/40">Opcional: tu punto ciego también ayuda a darte mejor consejo.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white text-sm hover:text-white hover:border-white/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== CAPA 3: Contexto estratégico ===================== */}
        {step === 3 && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Target className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Dónde estás parado hoy
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-8 ml-8">
              Para que ARES entienda tu realidad actual y te dé consejo que sirva de verdad.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuáles son tus prioridades para este año?</label>
                <textarea
                  placeholder={"Ej:\n- Lanzar la versión premium del producto\n- Contratar un director comercial\n- Abrir mercado en Guadalajara"}
                  value={yearlyPriorities}
                  onChange={(e) => setYearlyPriorities(e.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuáles son los 2 o 3 retos más urgentes que enfrentas hoy?</label>
                <textarea
                  placeholder={"Ej:\n- No logro retener talento clave\n- El flujo de caja está muy justo\n- La competencia bajó precios 30%"}
                  value={topChallenges}
                  onChange={(e) => setTopChallenges(e.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Qué decisiones te quitan el sueño ahorita?</label>
                <textarea
                  placeholder="Ej: Si debo levantar inversión o seguir bootstrapped, si despido al gerente de ventas..."
                  value={sleeplessDecisions}
                  onChange={(e) => setSleeplessDecisions(e.target.value)}
                  rows={2}
                  className={textareaClass}
                />
                <p className="text-xs text-white/40">Opcional pero muy útil — ARES te ayuda justo con estas.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Tienes inversionistas o socios que influyen en tus decisiones?</label>
                <input
                  placeholder="Ej: Tengo un socio al 40%, sin inversionistas externos"
                  value={hasInvestors}
                  onChange={(e) => setHasInvestors(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white text-sm hover:text-white hover:border-white/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!step3Valid}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== Step 4: Documentos de tu empresa ===================== */}
        {isDocumentsStep && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <FileText className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Documentos de tu empresa
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-2 ml-8">
              Sube estados financieros, planes de negocio u otros PDFs para que tus asesores conozcan tu empresa a fondo.
            </p>
            <p className="text-white/40 text-xs mb-8 ml-8">
              Este paso es opcional — puedes subir documentos después en Configuración.
            </p>

            {/* Upload zone */}
            <label
              className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                uploading
                  ? 'border-white/[0.08] bg-white/[0.02] cursor-wait'
                  : 'border-white/[0.12] bg-white/[0.02] hover:border-white/[0.20] hover:bg-white/[0.04]'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading || documents.length >= 10}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-white/40 animate-spin" />
                  <span className="text-sm text-white/40">Subiendo y procesando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-white/40" />
                  <span className="text-sm text-white/50">
                    {documents.length >= 10
                      ? 'Límite de 10 documentos alcanzado'
                      : 'Haz clic para subir un PDF (máx. 10 MB)'}
                  </span>
                </>
              )}
            </label>

            {/* Document list */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/40">{documents.length} de 10 documentos</p>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03]"
                  >
                    <FileText className="h-4 w-4 text-white/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{doc.file_name}</p>
                      <p className="text-xs text-white/30">{formatFileSize(doc.file_size)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.status === 'processing' && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Procesando
                        </span>
                      )}
                      {doc.status === 'ready' && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <Check className="h-3 w-3" />
                          Listo
                        </span>
                      )}
                      {doc.status === 'error' && (
                        <span className="flex items-center gap-1 text-[10px] text-red-400" title={doc.error_message || ''}>
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Eliminar documento"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white/30 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white text-sm hover:text-white hover:border-white/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== Step 5: Archetype ===================== */}
        {isArchetypeStep && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Elige tu 5to consejero
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-2 ml-8">
              Este consejero se sumará a tu equipo de asesores y complementará las perspectivas del Consejo.
            </p>
            <p className="text-white/40 text-xs mb-8 ml-8">
              Cada uno piensa diferente — elige el que más se alinee contigo.
            </p>

            {archetypesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {archetypes.map((arch) => {
                  const isSelected = selectedArchetype?.id === arch.id;
                  const emoji = archetypeEmoji[arch.id] || '🧠';
                  const shortDesc = archetypeShortDesc[arch.id] || arch.description;

                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setSelectedArchetype(arch)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/[0.05]'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                          isSelected ? 'bg-emerald-500/15' : 'bg-white/[0.06]'
                        }`}>
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-white">
                              {arch.name}
                            </h3>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="h-3 w-3 text-emerald-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs mt-1 leading-relaxed text-white/60">
                            {shortDesc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white text-sm hover:text-white hover:border-white/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={() => setStep(6)}
                disabled={!archetypeStepValid}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== Summary Step ===================== */}
        {isSummaryStep && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Check className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Todo listo
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-8 ml-8">
              Revisa que todo esté bien antes de comenzar.
            </p>

            <div className="space-y-4 border border-white/[0.10] bg-white/[0.03] rounded-xl p-6">
              {/* Capa 1 */}
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-2">Tu negocio</p>
                <div className="space-y-1 text-sm text-white/80">
                  <p>{businessType}</p>
                  <p className="text-white/50 text-xs">Modelo: {revenueModel} · Mercado: {targetMarket}</p>
                  <p className="text-white/50 text-xs">Tamaño: {companySize} · Geografía: {geography || 'No especificada'}</p>
                </div>
              </div>

              <div className="h-px bg-white/[0.08]" />

              {/* Capa 2 */}
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-2">Tu estilo de liderazgo</p>
                <div className="space-y-1 text-sm text-white/80">
                  <p>Inspiración: {inspiration}</p>
                  <p className="text-white/50 text-xs">KPIs: {kpis.split('\n').filter(k => k.trim()).join(' · ')}</p>
                  <p className="text-white/50 text-xs">Éxito en 12 meses: {successDefinition}</p>
                  {strength && <p className="text-white/50 text-xs">Fortaleza: {strength}</p>}
                </div>
              </div>

              <div className="h-px bg-white/[0.08]" />

              {/* Capa 3 */}
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-2">Tu contexto actual</p>
                <div className="space-y-1 text-sm text-white/80">
                  <p className="text-white/50 text-xs">Prioridades: {yearlyPriorities.split('\n').filter(k => k.trim()).join(' · ')}</p>
                  <p className="text-white/50 text-xs">Retos: {topChallenges.split('\n').filter(k => k.trim()).join(' · ')}</p>
                  {sleeplessDecisions && <p className="text-white/50 text-xs">Te quita el sueño: {sleeplessDecisions}</p>}
                  {hasInvestors && <p className="text-white/50 text-xs">Socios/inversión: {hasInvestors}</p>}
                </div>
              </div>

              {documents.length > 0 && (
                <>
                  <div className="h-px bg-white/[0.08]" />
                  <div>
                    <p className="text-xs text-emerald-400 font-medium mb-2">Documentos</p>
                    <p className="text-white/50 text-xs">
                      {documents.length} {documents.length === 1 ? 'documento subido' : 'documentos subidos'}
                    </p>
                  </div>
                </>
              )}

              {hasFullAccess && selectedArchetype && (
                <>
                  <div className="h-px bg-white/[0.08]" />
                  <div>
                    <p className="text-xs text-emerald-400 font-medium mb-1.5">Tu 5to consejero</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-lg">
                        {archetypeEmoji[selectedArchetype.id] || '🧠'}
                      </div>
                      <div>
                        <p className="text-sm text-white font-semibold">{selectedArchetype.name}</p>
                        <p className="text-white/60 text-xs mt-0.5">
                          {archetypeShortDesc[selectedArchetype.id] || selectedArchetype.philosophy}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white text-sm hover:text-white hover:border-white/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Comenzar a usar ARES'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
