'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
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

  const [kpi1, setKpi1] = useState('');
  const [kpi2, setKpi2] = useState('');
  const [kpi3, setKpi3] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);

  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('archetypes')
          .select('*')
          .eq('type', 'archetype');
        if (error) throw error;
        setArchetypes(data || []);
      } catch (err) {
        console.error('Error al cargar arquetipos:', err);
      } finally {
        setArchetypesLoading(false);
      }
    };
    fetchArchetypes();
  }, []);

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
  const step2Valid = selectedArchetype !== null;

  const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm placeholder:text-white/70 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all';

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s === step
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : s < step
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/[0.06] text-white border border-white/15'
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-14 h-px ${
                    s < step ? 'bg-green-500/30' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="text-center mb-8">
          <p className="text-xs text-white uppercase tracking-wider mb-1">
            Paso {step} de 3
          </p>
        </div>

        {/* Step 1: Tu asesor personal */}
        {step === 1 && (
          <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Personaliza tu asesor
            </h2>
            <p className="text-white text-sm mb-8">
              Necesitamos conocer tu negocio para darte recomendaciones relevantes.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuánto vendes al mes? (o la métrica que más vigilas)</label>
                <input
                  placeholder="Ej: $500,000 MXN mensuales, 200 clientes activos"
                  value={kpi1}
                  onChange={(e) => setKpi1(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white">Este es el número que revisas todos los días.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuánto te cuesta conseguir un cliente? (o tu segunda métrica clave)</label>
                <input
                  placeholder="Ej: $2,000 por cliente, 15% de margen de ganancia"
                  value={kpi2}
                  onChange={(e) => setKpi2(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white">El segundo número más importante para tu negocio.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuántos empleados tienes? (o tu tercera métrica clave)</label>
                <input
                  placeholder="Ej: 12 empleados, 85% de clientes satisfechos"
                  value={kpi3}
                  onChange={(e) => setKpi3(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white">Otro número que te ayude a entender cómo va tu negocio.</p>
              </div>

              <div className="h-px bg-white/[0.08]" />

              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿A qué empresario o líder admiras?</label>
                <input
                  placeholder="Ej: Carlos Slim, Steve Jobs, tu papá, un mentor"
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white">Tu CEO virtual adoptará parte de su filosofía al aconsejarte.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">¿Cuál es tu meta principal este año?</label>
                <input
                  placeholder="Ej: Llegar a $2M MXN en ventas, abrir una segunda sucursal"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-white">ARES evaluará cada decisión pensando en cómo te acerca a esta meta.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Estilo de asesoría */}
        {step === 2 && (
          <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Elige tu estilo de asesoría
            </h2>
            <p className="text-white text-sm mb-2">
              Elige el tipo de consejero que quieres como 5to miembro de tu equipo.
            </p>
            <p className="text-white text-xs mb-8">
              Cada uno piensa diferente y complementará a los demás asesores.
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
                          ? 'border-white/30 bg-white/10 shadow-lg shadow-white/[0.03]'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                          isSelected ? 'bg-white/15' : 'bg-white/[0.06]'
                        }`}>
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold text-sm ${
                              isSelected ? 'text-white' : 'text-white'
                            }`}>
                              {arch.name}
                            </h3>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="h-3 w-3 text-green-400" />
                              </div>
                            )}
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${
                            isSelected ? 'text-white' : 'text-white'
                          }`}>
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
                className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Todo listo
            </h2>
            <p className="text-white text-sm mb-8">
              Revisa que todo esté bien antes de comenzar.
            </p>

            <div className="space-y-4 border border-white/10 bg-white/[0.03] rounded-xl p-6">
              <div>
                <p className="text-xs text-white font-medium mb-1.5">Tus números clave</p>
                <p className="text-sm text-white">{kpi1}, {kpi2}, {kpi3}</p>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div>
                <p className="text-xs text-white font-medium mb-1.5">Líder que admiras</p>
                <p className="text-sm text-white">{inspiration}</p>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div>
                <p className="text-xs text-white font-medium mb-1.5">Tu meta</p>
                <p className="text-sm text-white">{mainGoal}</p>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div>
                <p className="text-xs text-white font-medium mb-1.5">Tu estilo de asesoría</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center text-lg">
                    {archetypeEmoji[selectedArchetype?.id || ''] || '🧠'}
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">{selectedArchetype?.name}</p>
                    <p className="text-white text-xs mt-0.5">
                      {archetypeShortDesc[selectedArchetype?.id || ''] || selectedArchetype?.philosophy}
                    </p>
                  </div>
                </div>
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
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Comenzar'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
