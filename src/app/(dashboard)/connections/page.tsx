'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Plug2,
  MessageCircle,
  Send,
  Video,
  RefreshCw,
  Link2,
  Unlink,
  Calendar,
  Check,
  Copy,
  Phone,
  Shield,
  Clock,
} from 'lucide-react';

interface MessagingConnection {
  id: string;
  channel: string;
  external_id: string;
  status: string;
  verification_code?: string;
  created_at: string;
}

interface CalendarIntegration {
  id: string;
  provider: string;
  email: string;
  status: string;
  last_sync?: string;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<MessagingConnection[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  // Telegram
  const [telegramPending, setTelegramPending] = useState<MessagingConnection | null>(null);
  const [connectingTelegram, setConnectingTelegram] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Google Calendar sync
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [connRes, intRes] = await Promise.all([
        fetch('/api/connections'),
        fetch('/api/calendar/integrations'),
      ]);

      const connData = await connRes.json();
      const intData = await intRes.json();

      if (connRes.ok) setConnections(connData.connections || []);
      if (intRes.ok) setIntegrations(intData.integrations || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Telegram helpers
  const telegramConnected = connections.find(
    (c) => c.channel === 'telegram' && c.status === 'verified'
  );

  async function connectTelegram() {
    setConnectingTelegram(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'telegram', external_id: 'pending' }),
      });
      const data = await res.json();
      if (res.ok) {
        setTelegramPending(data.connection);
        toast.success('Código de verificación generado');
      } else {
        toast.error(data.error || 'Error al crear conexión');
      }
    } catch {
      toast.error('Error al conectar Telegram');
    } finally {
      setConnectingTelegram(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function disconnectConnection(id: string) {
    try {
      await fetch(`/api/connections?id=${id}`, { method: 'DELETE' });
      fetchData();
      toast.success('Conexión desconectada');
    } catch {
      toast.error('Error al desconectar');
    }
  }

  // Google Calendar helpers
  const googleConnected = integrations.some(
    (i) => i.provider === 'google_calendar' && i.status === 'connected'
  );

  async function connectCalendar(provider: string) {
    try {
      const res = await fetch('/api/calendar/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error(data.error || 'Error al conectar');
      }
    } catch {
      toast.error('Error al conectar');
    }
  }

  async function syncCalendar(provider: string) {
    setSyncingGoogle(true);
    try {
      const endpoint = provider === 'google_calendar' ? '/api/calendar/google/sync' : '/api/calendar/outlook/sync';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Error al sincronizar');
      else { fetchData(); toast.success('Calendario sincronizado correctamente'); }
    } catch {
      toast.error('Error al sincronizar');
    } finally {
      setSyncingGoogle(false);
    }
  }

  async function disconnectCalendar(id: string) {
    try {
      await fetch(`/api/calendar/integrations?id=${id}`, { method: 'DELETE' });
      fetchData();
      toast.success('Calendario desconectado');
    } catch {
      toast.error('Error al desconectar calendario');
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Plug2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Conexiones</h1>
            <p className="text-sm text-white/50">
              Conecta tus canales de mensajeria, calendarios y herramientas
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* SECTION: Mensajeria */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Mensajeria
                </h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Agenda citas en tu calendario enviando un mensaje de texto.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Telegram — FUNCIONAL */}
                <div className={`rounded-xl border p-5 ${telegramConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.10] bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Send className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Telegram</div>
                      <div className="text-xs text-white/40">
                        {telegramConnected ? 'Conectado' : 'No conectado'}
                      </div>
                    </div>
                    {telegramConnected && (
                      <Check className="w-4 h-4 text-emerald-400 ml-auto" />
                    )}
                  </div>

                  {telegramConnected ? (
                    <button
                      onClick={() => disconnectConnection(telegramConnected.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Unlink className="w-3 h-3" />
                      Desconectar
                    </button>
                  ) : telegramPending ? (
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">
                        Envia este codigo al bot de ARES34 en Telegram:
                      </p>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 flex items-center justify-between">
                        <span className="text-lg font-mono text-white tracking-widest">
                          {telegramPending.verification_code}
                        </span>
                        <button
                          onClick={() => copyCode(telegramPending.verification_code || '')}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
                        >
                          {copiedCode ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-white/40 space-y-1">
                        <p>1. Busca @ares34_bot en Telegram</p>
                        <p>2. Envia /start</p>
                        <p>3. Envia el codigo de arriba</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-white/40 leading-relaxed">
                        Conecta tu Telegram para consultar a ARES desde tu celular y agendar citas con un mensaje.
                      </p>
                      <button
                        onClick={connectTelegram}
                        disabled={connectingTelegram}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-50"
                      >
                        {connectingTelegram ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Link2 className="w-3 h-3" />
                        )}
                        Conectar Telegram
                      </button>
                    </div>
                  )}
                </div>

                {/* WhatsApp — PROXIMAMENTE */}
                <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 opacity-60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">WhatsApp</div>
                      <div className="text-xs text-white/40">Pronto</div>
                    </div>
                    <Clock className="w-4 h-4 text-white/20 ml-auto" />
                  </div>
                  <button disabled className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs text-white/30 cursor-not-allowed">
                    Proximamente
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <Shield className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/30">
                  Tu conexion es privada. Solo tu puedes enviar mensajes a tu calendario de ARES34.
                </p>
              </div>
            </section>

            {/* SECTION: Calendarios */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Calendarios
                </h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Sincroniza tus calendarios externos para ver todo en un solo lugar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Google Calendar — FUNCIONAL */}
                <div className={`rounded-xl border p-5 ${googleConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.10] bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-base font-bold text-white/70">
                      G
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Google Calendar</div>
                      <div className="text-xs text-white/40">
                        {googleConnected
                          ? integrations.find((i) => i.provider === 'google_calendar')?.email || 'Conectado'
                          : 'No conectado'}
                      </div>
                    </div>
                    {googleConnected && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                  </div>

                  {googleConnected ? (
                    <div className="space-y-2">
                      {(() => {
                        const integration = integrations.find((i) => i.provider === 'google_calendar');
                        return integration?.last_sync ? (
                          <p className="text-[10px] text-white/30">
                            Ultima sync: {new Date(integration.last_sync).toLocaleString('es-MX')}
                          </p>
                        ) : null;
                      })()}
                      <div className="flex gap-2">
                        <button
                          onClick={() => syncCalendar('google_calendar')}
                          disabled={syncingGoogle}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.10] text-xs text-white/70 hover:bg-white/[0.06] transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingGoogle ? 'animate-spin' : ''}`} />
                          Sincronizar
                        </button>
                        <button
                          onClick={() => {
                            const i = integrations.find((i) => i.provider === 'google_calendar');
                            if (i) disconnectCalendar(i.id);
                          }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Unlink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-white/40 leading-relaxed">
                        Conecta Google Calendar para sincronizar tus eventos y verlos junto con tu agenda de ARES.
                      </p>
                      <button
                        onClick={() => connectCalendar('google_calendar')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all"
                      >
                        <Link2 className="w-3 h-3" />
                        Conectar
                      </button>
                    </div>
                  )}
                </div>

                {/* Outlook — PROXIMAMENTE */}
                <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 opacity-60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-base font-bold text-blue-400">
                      O
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Outlook</div>
                      <div className="text-xs text-white/40">Pronto</div>
                    </div>
                    <Clock className="w-4 h-4 text-white/20 ml-auto" />
                  </div>
                  <button disabled className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs text-white/30 cursor-not-allowed">
                    Proximamente
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION: Videollamadas */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Videollamadas
                </h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Genera links de Zoom automaticamente al crear eventos.
              </p>

              <div className="max-w-sm">
                <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 opacity-60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Video className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Zoom</div>
                      <div className="text-xs text-white/40">Pronto</div>
                    </div>
                    <Clock className="w-4 h-4 text-white/20 ml-auto" />
                  </div>
                  <button disabled className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs text-white/30 cursor-not-allowed">
                    Proximamente
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
