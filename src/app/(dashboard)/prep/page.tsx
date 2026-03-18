'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText, Send, RefreshCw, Copy } from 'lucide-react';
import type { MeetingType } from '@/lib/types';

const MEETING_TYPES: { value: MeetingType; label: string; description: string }[] = [
  { value: 'board', label: 'Consejo', description: 'Junta de consejo de administración' },
  { value: 'investor', label: 'Inversionistas', description: 'Pitch o update a inversionistas' },
  { value: 'team', label: 'Equipo', description: 'Reunión con tu equipo directivo' },
  { value: 'client', label: 'Cliente', description: 'Reunión con cliente importante' },
  { value: 'vendor', label: 'Proveedor', description: 'Negociación con proveedores' },
  { value: 'partner', label: 'Socio', description: 'Reunión con socios o partners' },
  { value: 'general', label: 'General', description: 'Cualquier otra reunión' },
];

export default function PrepPage() {
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('general');
  const [attendees, setAttendees] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  async function prepareMeeting() {
    if (meetingTopic.trim().length < 5) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_topic: meetingTopic,
          meeting_type: meetingType,
          attendees: attendees || undefined,
          additional_context: additionalContext || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al preparar');
      setResult(data.brief);
      toast.success('Preparación de junta generada');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setError(msg);
      toast.error('Ocurrió un error al preparar la junta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">ARES Prep</h1>
            <p className="text-sm text-white/50">Preparación inteligente de juntas</p>
          </div>
        </div>

        {/* Form */}
        {!result && !loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 space-y-5">
            {/* Meeting type selector */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Tipo de reunión
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEETING_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMeetingType(type.value)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                      meetingType === type.value
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-sm font-medium block">{type.label}</span>
                    <span className="text-xs text-white/40 block mt-0.5">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting topic */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Tema principal de la reunión *
              </label>
              <textarea
                value={meetingTopic}
                onChange={(e) => setMeetingTopic(e.target.value)}
                placeholder="Ej: Negociar renovación de contrato con nuestro cliente principal..."
                rows={2}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Asistentes <span className="text-white/30">(opcional)</span>
              </label>
              <input
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Ej: Director de compras, CEO del cliente, mi CFO"
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Additional context */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Contexto adicional <span className="text-white/30">(opcional)</span>
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Ej: El cliente ha mencionado que está evaluando a la competencia. Nuestro contrato actual es de $2M MXN/año."
                rows={2}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                onClick={prepareMeeting}
                disabled={meetingTopic.trim().length < 5}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Preparar Brief
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-12 text-center">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Preparando tu brief con el contexto de tu empresa...</p>
            <p className="text-sm text-white/40 mt-2">Esto toma ~15 segundos</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => { setResult(null); setError(''); }}
              className="mt-4 px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] transition-all"
            >
              Volver al formulario
            </button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-white/50">Brief generado</span>
              <button
                onClick={() => { setResult(null); setMeetingTopic(''); setAttendees(''); setAdditionalContext(''); }}
                className="text-sm text-white/50 hover:text-white transition-all"
              >
                Nueva preparación
              </button>
            </div>
            <div className="relative rounded-xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
              <button
                onClick={() => copyToClipboard(result)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                title="Copiar preparación"
              >
                <Copy className="w-4 h-4 text-white/40 hover:text-white/80 transition-colors" />
              </button>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h2:text-lg prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-cyan-300
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-white/70 prose-p:leading-relaxed
                prose-li:text-white/70
                prose-strong:text-white
                prose-ul:space-y-1
              ">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(result) }} />
              </div>
            </div>
          </div>
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
