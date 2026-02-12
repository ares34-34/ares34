'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
import type { UserConfig, Archetype } from '@/lib/types';
import { createBrowserClient } from '@/lib/supabase';

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

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [config, setConfig] = useState({
    ceo_kpi_1: '',
    ceo_kpi_2: '',
    ceo_kpi_3: '',
    ceo_inspiration: '',
    ceo_main_goal: '',
    custom_board_archetype_id: '' as string | null,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      const [configRes, archetypesData] = await Promise.all([
        fetch('/api/config'),
        loadArchetypes(),
      ]);
      const configJson = await configRes.json();
      if (!configJson.success || !configJson.data || !configJson.data.onboarding_completed) {
        router.replace('/onboarding');
        return;
      }
      if (configJson.success && configJson.data) {
        const d = configJson.data as UserConfig;
        setConfig({
          ceo_kpi_1: d.ceo_kpi_1 || '',
          ceo_kpi_2: d.ceo_kpi_2 || '',
          ceo_kpi_3: d.ceo_kpi_3 || '',
          ceo_inspiration: d.ceo_inspiration || '',
          ceo_main_goal: d.ceo_main_goal || '',
          custom_board_archetype_id: d.custom_board_archetype_id || null,
        });
      }
      setArchetypes(archetypesData);
    } catch {
      toast.error('Error al cargar tu configuración');
    } finally {
      setLoading(false);
    }
  }

  async function loadArchetypes(): Promise<Archetype[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('archetypes')
      .select('*')
      .eq('type', 'archetype');
    if (error) return [];
    return (data || []) as Archetype[];
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Configuración actualizada');
      } else {
        toast.error(json.error || 'Error al guardar los cambios');
      }
    } catch {
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/12 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-all';

  if (loading) {
    return (
      <div className="text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold mb-6">Configuración</h1>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-xl bg-white/[0.05]" />
            <div className="h-96 animate-pulse rounded-xl bg-white/[0.05]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Configuración</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>

        {/* Tu asesor */}
        <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Tu asesor personal</h2>
            <p className="text-xs text-white/35">
              Estos datos ayudan a ARES a darte recomendaciones más relevantes
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/50 font-medium">El número que más te importa</label>
              <input
                placeholder="Ej: Ventas mensuales, facturación, clientes nuevos"
                value={config.ceo_kpi_1}
                onChange={(e) => setConfig({ ...config, ceo_kpi_1: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50 font-medium">Segundo número importante</label>
              <input
                placeholder="Ej: Clientes que se quedan, margen de ganancia"
                value={config.ceo_kpi_2}
                onChange={(e) => setConfig({ ...config, ceo_kpi_2: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50 font-medium">Tercer número importante</label>
              <input
                placeholder="Ej: Satisfacción de clientes, productividad del equipo"
                value={config.ceo_kpi_3}
                onChange={(e) => setConfig({ ...config, ceo_kpi_3: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="h-px bg-white/[0.08]" />

            <div className="space-y-2">
              <label className="text-sm text-white/50 font-medium">Un líder que admires</label>
              <input
                placeholder="Ej: Carlos Slim, Steve Jobs, tu papá, un mentor"
                value={config.ceo_inspiration}
                onChange={(e) => setConfig({ ...config, ceo_inspiration: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50 font-medium">Tu meta principal de este año</label>
              <input
                placeholder="Ej: Facturar $5M MXN, abrir una segunda sucursal"
                value={config.ceo_main_goal}
                onChange={(e) => setConfig({ ...config, ceo_main_goal: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Estilo de asesoría */}
        <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Tu estilo de asesoría</h2>
            <p className="text-xs text-white/35">
              Elige el tipo de consejero extra que quieres en tu equipo
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {archetypes.map((arch) => {
              const isSelected = config.custom_board_archetype_id === arch.id;
              const emoji = archetypeEmoji[arch.id] || '🧠';
              const shortDesc = archetypeShortDesc[arch.id] || arch.description;

              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setConfig({ ...config, custom_board_archetype_id: arch.id })}
                  className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
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
                        <h3 className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {arch.name}
                        </h3>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-400" />
                          </div>
                        )}
                      </div>
                      <p className={`mt-1 text-xs leading-relaxed ${isSelected ? 'text-white/50' : 'text-white/35'}`}>
                        {shortDesc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {archetypes.length === 0 && (
            <p className="text-sm text-white/25">
              No se encontraron estilos de asesoría disponibles.
            </p>
          )}
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
