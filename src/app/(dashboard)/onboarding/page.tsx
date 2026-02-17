'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Loader2, Check, ArrowRight, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import type { Archetype } from '@/lib/types';

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
  const [userPlan, setUserPlan] = useState<string>('trial');

  const [kpi1, setKpi1] = useState('');
  const [kpi2, setKpi2] = useState('');
  const [kpi3, setKpi3] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient();
        const [archetypesResult, subResult] = await Promise.all([
          supabase.from('archetypes').select('*').eq('type', 'archetype'),
          fetch('/api/payments/status'),
        ]);
        if (!archetypesResult.error) {
          setArchetypes(archetypesResult.data || []);
        }
        const subJson = await subResult.json();
        if (subJson.success && subJson.data) {
          setUserPlan(subJson.data.plan || 'trial');
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setArchetypesLoading(false);
      }
    };
    fetchData();
  }, []);

  const isEnterprise = userPlan === 'empresarial';
  const totalSteps = isEnterprise ? 3 : 2;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ceo_kpi_1: kpi1,
          ceo_kpi_2: kpi2,
          ceo_kpi_3: kpi3,
          ceo_inspiration: inspiration,
          ceo_main_goal: mainGoal,
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

  const step1Valid = kpi1.trim() && kpi2.trim() && kpi3.trim() && inspiration.trim() && mainGoal.trim();
  const step2Valid = isEnterprise ? selectedArchetype !== null : true;

  // For non-enterprise: step 1 = business info, step 2 = summary
  // For enterprise: step 1 = business info, step 2 = archetype, step 3 = summary
  const isLastStep = step === totalSteps;
  const isSummaryStep = isLastStep;
  const isArchetypeStep = isEnterprise && step === 2;

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/70 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all';

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
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
                    className={`w-14 h-px ${
                      s < step ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step labels */}
        <div className="text-center mb-8">
          <p className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1">
            Paso {step} de {totalSteps}
          </p>
        </div>

        {/* Step 1: Tu negocio */}
        {step === 1 && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Cuéntanos de tu negocio
              </h2>
            </div>
            <p className="text-white text-sm mb-8 ml-8">
              Con esto tu asesor te dará recomendaciones hechas a la medida.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuánto vendes al mes?</label>
                <input
                  placeholder="Ej: $500,000 MXN mensuales"
                  value={kpi1}
                  onChange={(e) => setKpi1(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/60">O la métrica que revisas todos los días.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuánto te cuesta conseguir un cliente?</label>
                <input
                  placeholder="Ej: $2,000 MXN por cliente"
                  value={kpi2}
                  onChange={(e) => setKpi2(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/60">O tu segunda métrica clave (margen, retención, etc.)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuántos empleados tienes?</label>
                <input
                  placeholder="Ej: 12 empleados"
                  value={kpi3}
                  onChange={(e) => setKpi3(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/60">O cualquier número que te ayude a entender cómo va todo.</p>
              </div>

              <div className="h-px bg-white/[0.08]" />

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿A qué empresario o líder admiras?</label>
                <input
                  placeholder="Ej: Carlos Slim, Steve Jobs, tu papá"
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/60">Tu asesor adoptará parte de su filosofía al aconsejarte.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuál es tu meta principal este año?</label>
                <input
                  placeholder="Ej: Llegar a $2M MXN en ventas"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white/60">ARES evaluará cada decisión pensando en cómo te acerca a esta meta.</p>
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

        {/* Step 2 for Enterprise: Estilo de asesoría */}
        {isArchetypeStep && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Elige tu 5to consejero
              </h2>
            </div>
            <p className="text-white text-sm mb-2 ml-8">
              Este consejero se sumará a tu equipo de asesores y complementará las perspectivas del Consejo.
            </p>
            <p className="text-white/60 text-xs mb-8 ml-8">
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
                          <p className="text-xs mt-1 leading-relaxed text-white/80">
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

        {/* Summary Step (step 2 for non-enterprise, step 3 for enterprise) */}
        {isSummaryStep && !isArchetypeStep && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-1">
              <Check className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">
                Todo listo
              </h2>
            </div>
            <p className="text-white text-sm mb-8 ml-8">
              Revisa que todo esté bien antes de comenzar.
            </p>

            <div className="space-y-4 border border-white/[0.10] bg-white/[0.03] rounded-xl p-6">
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-1.5">Tus números clave</p>
                <p className="text-sm text-white">{kpi1}</p>
                <p className="text-sm text-white">{kpi2}</p>
                <p className="text-sm text-white">{kpi3}</p>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-1.5">Líder que admiras</p>
                <p className="text-sm text-white">{inspiration}</p>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-1.5">Tu meta</p>
                <p className="text-sm text-white">{mainGoal}</p>
              </div>

              {isEnterprise && selectedArchetype && (
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
                        <p className="text-white/80 text-xs mt-0.5">
                          {archetypeShortDesc[selectedArchetype.id] || selectedArchetype.philosophy}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isEnterprise && (
                <>
                  <div className="h-px bg-white/[0.08]" />
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <Lock className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-white font-medium">Consejo de Asesores y Junta de Inversionistas</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        Con el plan Empresarial desbloqueas 5 asesores especializados (CFO, CMO, Legal, Talento + tu consejero custom) y 3 inversionistas expertos para decisiones de capital.
                      </p>
                      <a href="/settings#plan" className="inline-block text-xs text-emerald-400 hover:text-emerald-300 mt-2 transition-colors">
                        Ver planes →
                      </a>
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
