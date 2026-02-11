'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { UserConfig, Archetype } from '@/lib/types';
import { createBrowserClient } from '@/lib/supabase';

export default function SettingsPage() {
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

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors';

  if (loading) {
    return (
      <div className="text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold mb-6">Configuración</h1>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />
            <div className="h-96 animate-pulse rounded-xl bg-white/[0.03]" />
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
            className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Tu asesor */}
        <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Tu asesor personal</h2>
            <p className="text-xs text-white/25">
              Estos datos ayudan a ARES a darte recomendaciones más relevantes
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/40">El número que más te importa</label>
              <input
                placeholder="Ej: Ventas mensuales, facturación, clientes nuevos"
                value={config.ceo_kpi_1}
                onChange={(e) => setConfig({ ...config, ceo_kpi_1: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Segundo número importante</label>
              <input
                placeholder="Ej: Clientes que se quedan, margen de ganancia"
                value={config.ceo_kpi_2}
                onChange={(e) => setConfig({ ...config, ceo_kpi_2: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Tercer número importante</label>
              <input
                placeholder="Ej: Satisfacción de clientes, productividad del equipo"
                value={config.ceo_kpi_3}
                onChange={(e) => setConfig({ ...config, ceo_kpi_3: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="h-px bg-white/[0.05]" />

            <div className="space-y-2">
              <label className="text-sm text-white/40">Un líder que admires</label>
              <input
                placeholder="Ej: Carlos Slim, Steve Jobs, tu papá, un mentor"
                value={config.ceo_inspiration}
                onChange={(e) => setConfig({ ...config, ceo_inspiration: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Tu meta principal de este año</label>
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
        <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Tu estilo de asesoría</h2>
            <p className="text-xs text-white/25">
              Elige el tipo de consejero extra que quieres en tu equipo
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {archetypes.map((arch) => {
              const isSelected = config.custom_board_archetype_id === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setConfig({ ...config, custom_board_archetype_id: arch.id })}
                  className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white/30 bg-white/[0.06]'
                      : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <h3 className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                    {arch.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/25">{arch.description}</p>
                </button>
              );
            })}
          </div>

          {archetypes.length === 0 && (
            <p className="text-sm text-white/15">
              No se encontraron estilos de asesoría disponibles.
            </p>
          )}
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-30 cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
