'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      // Load config and archetypes in parallel
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

  if (loading) {
    return (
      <div className="text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Configuración</h1>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-xl bg-white/5" />
            <div className="h-96 animate-pulse rounded-xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Configuración</h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-ares-blue text-white hover:bg-ares-blue/90"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {/* CEO Agent Section */}
        <Card className="border-0 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Tu CEO Agent</CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza los KPIs y objetivos que guían a tu agente CEO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">KPI Principal</label>
              <Input
                placeholder="Ej: Ingresos mensuales recurrentes"
                value={config.ceo_kpi_1}
                onChange={(e) => setConfig({ ...config, ceo_kpi_1: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">KPI Secundario</label>
              <Input
                placeholder="Ej: Tasa de retención de clientes"
                value={config.ceo_kpi_2}
                onChange={(e) => setConfig({ ...config, ceo_kpi_2: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">KPI Terciario</label>
              <Input
                placeholder="Ej: NPS o satisfacción del cliente"
                value={config.ceo_kpi_3}
                onChange={(e) => setConfig({ ...config, ceo_kpi_3: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tu inspiración de gestión</label>
              <Input
                placeholder="Ej: Steve Jobs, Carlos Slim, etc."
                value={config.ceo_inspiration}
                onChange={(e) => setConfig({ ...config, ceo_inspiration: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tu meta principal de este año</label>
              <Input
                placeholder="Ej: Alcanzar $5M MXN en facturación anual"
                value={config.ceo_main_goal}
                onChange={(e) => setConfig({ ...config, ceo_main_goal: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* 5th Board Member */}
        <Card className="border-0 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Tu 5to Consejero</CardTitle>
            <CardDescription className="text-gray-400">
              Elige el arquetipo que complementa tu consejo directivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {archetypes.map((arch) => {
                const isSelected = config.custom_board_archetype_id === arch.id;
                return (
                  <div
                    key={arch.id}
                    onClick={() =>
                      setConfig({ ...config, custom_board_archetype_id: arch.id })
                    }
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      isSelected
                        ? 'border-ares-blue bg-ares-blue/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-ares-blue' : 'text-gray-200'
                      }`}
                    >
                      {arch.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">{arch.description}</p>
                  </div>
                );
              })}
            </div>
            {archetypes.length === 0 && (
              <p className="text-sm text-gray-500">
                No se encontraron arquetipos disponibles.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bottom save button for mobile */}
        <div className="flex justify-end pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-ares-blue text-white hover:bg-ares-blue/90"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
