'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, Upload, Trash2, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import type { UserConfig, CompanyDocument } from '@/lib/types';

// Legacy type for backward compat - archetypes are no longer user-selectable
interface LegacyArchetype {
  id: string;
  name: string;
  description: string;
  philosophy: string;
  type: string;
  prompt_key: string;
}
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
  const [archetypes, setArchetypes] = useState<LegacyArchetype[]>([]);
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState({
    ceo_kpi_1: '',
    ceo_kpi_2: '',
    ceo_kpi_3: '',
    ceo_inspiration: '',
    ceo_main_goal: '',
    custom_board_archetype_id: '' as string | null,
    company_context: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      const [configRes, archetypesData, docsRes] = await Promise.all([
        fetch('/api/config'),
        loadArchetypes(),
        fetch('/api/uploads/documents'),
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
          company_context: d.company_context || '',
        });
      }
      setArchetypes(archetypesData);
      const docsJson = await docsRes.json();
      if (docsJson.success) {
        setDocuments(docsJson.data || []);
      }
    } catch {
      toast.error('Error al cargar tu configuración');
    } finally {
      setLoading(false);
    }
  }

  async function loadArchetypes(): Promise<LegacyArchetype[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('archetypes')
      .select('*')
      .eq('type', 'archetype');
    if (error) return [];
    return (data || []) as LegacyArchetype[];
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

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] input-glow transition-all';

  if (loading) {
    return (
      <div className="text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold mb-6">Configuración</h1>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-xl bg-white/[0.04] border border-white/[0.06]" />
            <div className="h-96 animate-pulse rounded-xl bg-white/[0.04] border border-white/[0.06]" />
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
            className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 cursor-pointer flex items-center gap-2 btn-glow"
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
        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-5 card-glow backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Tu asesor personal</h2>
            <p className="text-xs text-white/50">
              Estos datos ayudan a ARES a darte recomendaciones más relevantes
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium">¿Cuánto vendes al mes? (o la métrica que más vigilas)</label>
              <input
                placeholder="Ej: $500,000 MXN mensuales, 200 clientes activos"
                value={config.ceo_kpi_1}
                onChange={(e) => setConfig({ ...config, ceo_kpi_1: e.target.value })}
                className={inputClass}
              />
              <p className="text-xs text-white/30">Este es el número que revisas todos los días.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium">¿Cuánto te cuesta conseguir un cliente? (o tu segunda métrica clave)</label>
              <input
                placeholder="Ej: $2,000 por cliente, 15% de margen de ganancia"
                value={config.ceo_kpi_2}
                onChange={(e) => setConfig({ ...config, ceo_kpi_2: e.target.value })}
                className={inputClass}
              />
              <p className="text-xs text-white/30">El segundo número más importante para tu negocio.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium">¿Cuántos empleados tienes? (o tu tercera métrica clave)</label>
              <input
                placeholder="Ej: 12 empleados, 85% de clientes satisfechos"
                value={config.ceo_kpi_3}
                onChange={(e) => setConfig({ ...config, ceo_kpi_3: e.target.value })}
                className={inputClass}
              />
              <p className="text-xs text-white/30">Otro número que te ayude a entender cómo va tu negocio.</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium">¿A qué empresario o líder admiras?</label>
              <input
                placeholder="Ej: Carlos Slim, Steve Jobs, tu papá, un mentor"
                value={config.ceo_inspiration}
                onChange={(e) => setConfig({ ...config, ceo_inspiration: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium">¿Cuál es tu meta principal este año?</label>
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
        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-5 card-glow backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Tu estilo de asesoría</h2>
            <p className="text-xs text-white/50">
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
                      ? 'border-emerald-500/30 bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/[0.05]'
                      : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15]'
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
                        <h3 className="text-sm font-semibold text-white">
                          {arch.name}
                        </h3>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="h-3 w-3 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <p className={`mt-1 text-xs leading-relaxed ${isSelected ? 'text-white/70' : 'text-white/50'}`}>
                        {shortDesc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {archetypes.length === 0 && (
            <p className="text-sm text-white/40">
              No se encontraron estilos de asesoría disponibles.
            </p>
          )}
        </div>

        {/* Contexto de tu empresa */}
        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-5 card-glow backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Contexto de tu empresa</h2>
            <p className="text-xs text-white/50">
              Describe tu empresa, industria, modelo de negocio, estructura, retos actuales. Entre más contexto, mejores las recomendaciones de tus 9 asesores.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={8}
              placeholder="Ej: Somos una distribuidora de materiales de construcción en Monterrey con 15 años. Facturamos $45M MXN al año. Tenemos 3 sucursales y 80 empleados. Nuestro principal reto es la competencia de precio contra cadenas grandes..."
              value={config.company_context}
              onChange={(e) => {
                if (e.target.value.length <= 5000) {
                  setConfig({ ...config, company_context: e.target.value });
                }
              }}
              className={`${inputClass} resize-none`}
            />
            <div className="flex justify-between">
              <p className="text-xs text-white/30">
                Este texto se comparte con todos tus asesores en cada consulta.
              </p>
              <span className={`text-xs ${config.company_context.length > 4500 ? 'text-amber-400' : 'text-white/25'}`}>
                {config.company_context.length}/5,000
              </span>
            </div>
          </div>
        </div>

        {/* Documentos de tu empresa */}
        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-5 card-glow backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Documentos de tu empresa</h2>
            <p className="text-xs text-white/50">
              Sube estados financieros, planes de negocio, organigramas u otros PDFs. ARES extrae el texto y lo usa para asesorarte mejor.
            </p>
          </div>

          {/* Upload zone */}
          <label
            className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
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
                <Loader2 className="h-5 w-5 text-white/40 animate-spin" />
                <span className="text-xs text-white/40">Subiendo y procesando...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-white/40" />
                <span className="text-xs text-white/50">
                  {documents.length >= 10
                    ? 'Límite de 10 documentos alcanzado'
                    : 'Haz clic para subir un PDF (máx. 10 MB)'}
                </span>
              </>
            )}
          </label>

          {/* Document list */}
          {documents.length > 0 && (
            <div className="space-y-2">
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
        </div>

        {/* Seguridad */}
        <div className="border border-white/[0.10] bg-white/[0.04] rounded-2xl p-6 space-y-5 card-glow backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-semibold text-white mb-1">Seguridad</h2>
              <p className="text-xs text-white/50">
                Gestiona tu contraseña de acceso
              </p>
            </div>
          </div>

          <a
            href="/change-password"
            className="block w-full text-center py-2.5 rounded-full border border-white/[0.15] text-white/80 text-sm font-medium hover:bg-white/[0.06] hover:border-white/25 transition-all cursor-pointer"
          >
            Cambiar contraseña
          </a>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-30 cursor-pointer flex items-center gap-2 btn-glow"
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
