'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Archetype } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [archetypesLoading, setArchetypesLoading] = useState(true);

  // Step 1 fields
  const [kpi1, setKpi1] = useState('');
  const [kpi2, setKpi2] = useState('');
  const [kpi3, setKpi3] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [mainGoal, setMainGoal] = useState('');

  // Step 2 fields
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

  return (
    <div className="min-h-screen bg-ares-dark flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s === step
                    ? 'bg-ares-blue text-white'
                    : s < step
                    ? 'bg-ares-green text-white'
                    : 'bg-white/10 text-gray-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 ${
                    s < step ? 'bg-ares-green' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: CEO Agent Config */}
        {step === 1 && (
          <Card className="bg-[#0F2440] border-white/10">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Configura tu <span className="text-ares-blue">CEO Agent</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Tu agente personal que te asesora en decisiones operativas del día a día.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">KPI Principal</label>
                  <Input
                    placeholder="Ej: MRR mensual"
                    value={kpi1}
                    onChange={(e) => setKpi1(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">KPI Secundario</label>
                  <Input
                    placeholder="Ej: Tasa de churn"
                    value={kpi2}
                    onChange={(e) => setKpi2(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">KPI Terciario</label>
                  <Input
                    placeholder="Ej: NPS de clientes"
                    value={kpi3}
                    onChange={(e) => setKpi3(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tu inspiración de gestión</label>
                  <Input
                    placeholder="Ej: Ray Dalio, Carlos Slim, Steve Jobs"
                    value={inspiration}
                    onChange={(e) => setInspiration(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tu meta principal de este año</label>
                  <Input
                    placeholder="Ej: Llegar a $2M MRR para diciembre"
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="bg-ares-blue hover:bg-ares-blue/90 text-white cursor-pointer"
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose 5th Board Member */}
        {step === 2 && (
          <Card className="bg-[#0F2440] border-white/10">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Elige tu <span className="text-ares-purple">5to Consejero</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Este arquetipo se sumará a tu consejo directivo junto al CFO, CMO, CLO y CHRO.
              </p>

              {archetypesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {archetypes.map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setSelectedArchetype(arch)}
                      className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedArchetype?.id === arch.id
                          ? 'border-ares-blue ring-2 ring-ares-blue bg-ares-blue/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <h3 className="font-bold text-white text-sm mb-2">{arch.name}</h3>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-3">{arch.description}</p>
                      <p className="text-gray-500 text-xs italic line-clamp-2">{arch.philosophy}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-white/10 text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!step2Valid}
                  className="bg-ares-blue hover:bg-ares-blue/90 text-white cursor-pointer"
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Summary & Confirm */}
        {step === 3 && (
          <Card className="bg-[#0F2440] border-white/10">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                ¡Listo! Bienvenido a <span className="text-ares-blue">ARES34</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Revisa tu configuración antes de comenzar.
              </p>

              <div className="space-y-4 bg-white/5 rounded-lg p-6">
                <div>
                  <p className="text-sm text-gray-400">Tus KPIs</p>
                  <p className="text-white">{kpi1}, {kpi2}, {kpi3}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tu inspiración</p>
                  <p className="text-white">{inspiration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tu meta</p>
                  <p className="text-white">{mainGoal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tu 5to consejero</p>
                  <p className="text-white font-semibold">{selectedArchetype?.name}</p>
                  <p className="text-gray-400 text-sm italic">{selectedArchetype?.philosophy}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-white/10 text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                  Anterior
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={loading}
                  className="bg-ares-green hover:bg-ares-green/90 text-white cursor-pointer"
                >
                  {loading ? 'Guardando...' : 'Comenzar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
