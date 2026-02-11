'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import type { Archetype } from '@/lib/types';

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

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s === step
                    ? 'bg-white text-black'
                    : s < step
                    ? 'bg-white/20 text-white'
                    : 'bg-white/[0.06] text-white/25'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-14 h-px ${
                    s < step ? 'bg-white/20' : 'bg-white/[0.06]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Tu asesor personal */}
        {step === 1 && (
          <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Personaliza tu asesor
            </h2>
            <p className="text-white/30 text-sm mb-8">
              Dinos qué números te importan más y cómo piensas. ARES se adapta a ti.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white/40">El número que más te importa</label>
                <input
                  placeholder="Ej: Ventas mensuales, facturación, clientes nuevos"
                  value={kpi1}
                  onChange={(e) => setKpi1(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/40">Segundo número importante</label>
                <input
                  placeholder="Ej: Clientes que se quedan, margen de ganancia"
                  value={kpi2}
                  onChange={(e) => setKpi2(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/40">Tercer número importante</label>
                <input
                  placeholder="Ej: Satisfacción de clientes, productividad del equipo"
                  value={kpi3}
                  onChange={(e) => setKpi3(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/40">Un líder que admires</label>
                <input
                  placeholder="Ej: Carlos Slim, Steve Jobs, tu papá, un mentor"
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/40">Tu meta principal de este año</label>
                <input
                  placeholder="Ej: Facturar $2M MXN, abrir una segunda sucursal"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Estilo de asesoría */}
        {step === 2 && (
          <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Elige tu estilo de asesoría
            </h2>
            <p className="text-white/30 text-sm mb-8">
              Elige el tipo de consejero extra que quieres en tu equipo. Cada uno piensa diferente.
            </p>

            {archetypesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {archetypes.map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetype(arch)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedArchetype?.id === arch.id
                        ? 'border-white/30 bg-white/[0.06]'
                        : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <h3 className={`font-semibold text-sm mb-2 ${
                      selectedArchetype?.id === arch.id ? 'text-white' : 'text-white/70'
                    }`}>
                      {arch.name}
                    </h3>
                    <p className="text-white/25 text-xs mb-2 line-clamp-3">{arch.description}</p>
                    <p className="text-white/15 text-xs italic line-clamp-2">{arch.philosophy}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full border border-white/15 text-white/50 text-sm hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Todo listo
            </h2>
            <p className="text-white/30 text-sm mb-8">
              Revisa que todo esté bien antes de comenzar.
            </p>

            <div className="space-y-4 border border-white/[0.05] bg-white/[0.02] rounded-xl p-6">
              <div>
                <p className="text-xs text-white/25 mb-1">Tus números clave</p>
                <p className="text-sm text-white">{kpi1}, {kpi2}, {kpi3}</p>
              </div>
              <div className="h-px bg-white/[0.05]" />
              <div>
                <p className="text-xs text-white/25 mb-1">Líder que admiras</p>
                <p className="text-sm text-white">{inspiration}</p>
              </div>
              <div className="h-px bg-white/[0.05]" />
              <div>
                <p className="text-xs text-white/25 mb-1">Tu meta</p>
                <p className="text-sm text-white">{mainGoal}</p>
              </div>
              <div className="h-px bg-white/[0.05]" />
              <div>
                <p className="text-xs text-white/25 mb-1">Tu estilo de asesoría</p>
                <p className="text-sm text-white font-semibold">{selectedArchetype?.name}</p>
                <p className="text-white/25 text-xs italic mt-1">{selectedArchetype?.philosophy}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-white/15 text-white/50 text-sm hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Guardando...' : 'Comenzar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
