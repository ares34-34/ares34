'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface ZoomIntegration {
  id: string;
  email: string;
  status: string;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<MessagingConnection[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [zoomIntegration, setZoomIntegration] = useState<ZoomIntegration | null>(null);
  const [loading, setLoading] = useState(true);

  // WhatsApp form
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappPending, setWhatsappPending] = useState<MessagingConnection | null>(null);
  const [whatsappCode, setWhatsappCode] = useState('');
  const [connectingWhatsapp, setConnectingWhatsapp] = useState(false);
  const [verifyingWhatsapp, setVerifyingWhatsapp] = useState(false);

  // Telegram
  const [telegramPending, setTelegramPending] = useState<MessagingConnection | null>(null);
  const [connectingTelegram, setConnectingTelegram] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync states
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncingOutlook, setSyncingOutlook] = useState(false);

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

  // WhatsApp helpers
  const whatsappConnected = connections.find(
    (c) => c.channel === 'whatsapp' && c.status === 'verified'
  );

  async function connectWhatsapp() {
    if (!whatsappPhone.trim()) return;
    setConnectingWhatsapp(true);
    try {
      const phone = whatsappPhone.startsWith('+') ? whatsappPhone : `+52${whatsappPhone}`;
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'whatsapp', external_id: phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setWhatsappPending(data.connection);
      } else {
        alert(data.error || 'Error al crear conexión');
      }
    } catch {
      alert('Error al conectar WhatsApp');
    } finally {
      setConnectingWhatsapp(false);
    }
  }

  async function verifyWhatsapp() {
    if (!whatsappPending || !whatsappCode) return;
    setVerifyingWhatsapp(true);
    try {
      const res = await fetch('/api/connections/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: whatsappPending.id,
          code: whatsappCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWhatsappPending(null);
        setWhatsappCode('');
        setWhatsappPhone('');
        fetchData();
      } else {
        alert(data.error || 'Código incorrecto');
      }
    } catch {
      alert('Error al verificar');
    } finally {
      setVerifyingWhatsapp(false);
    }
  }

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
      } else {
        alert(data.error || 'Error al crear conexión');
      }
    } catch {
      alert('Error al conectar Telegram');
    } finally {
      setConnectingTelegram(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function disconnectConnection(id: string) {
    try {
      await fetch(`/api/connections?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch {
      // silent
    }
  }

  // Calendar helpers
  const googleConnected = integrations.some(
    (i) => i.provider === 'google_calendar' && i.status === 'connected'
  );
  const outlookConnected = integrations.some(
    (i) => i.provider === 'outlook' && i.status === 'connected'
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
        alert(data.error || 'Error al conectar');
      }
    } catch {
      alert('Error al conectar');
    }
  }

  async function syncCalendar(provider: string) {
    const setSyncing = provider === 'google_calendar' ? setSyncingGoogle : setSyncingOutlook;
    const endpoint = provider === 'google_calendar' ? '/api/calendar/google/sync' : '/api/calendar/outlook/sync';
    setSyncing(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) alert(data.error || 'Error al sincronizar');
      else fetchData();
    } catch {
      alert('Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  }

  async function disconnectCalendar(id: string) {
    try {
      await fetch(`/api/calendar/integrations?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch {
      // silent
    }
  }

  // Zoom helpers
  async function connectZoom() {
    const clientId = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;
    if (!clientId) {
      alert('Zoom no está configurado. Contacta al administrador.');
      return;
    }
    const redirectUri = `${window.location.origin}/api/integrations/zoom/callback`;
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
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
              Conecta tus canales de mensajería, calendarios y herramientas
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
            {/* ============================================================ */}
            {/* SECTION: Mensajería */}
            {/* ============================================================ */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Mensajería
                </h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Agenda citas en tu calendario enviando un mensaje de texto.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp */}
                <div className={`rounded-xl border p-5 ${whatsappConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.10] bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">WhatsApp</div>
                      <div className="text-xs text-white/40">
                        {whatsappConnected
                          ? `${whatsappConnected.external_id} - Conectado`
                          : 'No conectado'}
                      </div>
                    </div>
                    {whatsappConnected && (
                      <Check className="w-4 h-4 text-emerald-400 ml-auto" />
                    )}
                  </div>

                  {whatsappConnected ? (
                    <button
                      onClick={() => disconnectConnection(whatsappConnected.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Unlink className="w-3 h-3" />
                      Desconectar
                    </button>
                  ) : whatsappPending ? (
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">
                        Te enviamos un código de verificación por WhatsApp. Ingrésalo aquí:
                      </p>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-center">
                        <span className="text-lg font-mono text-white tracking-widest">
                          {whatsappPending.verification_code}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={whatsappCode}
                        onChange={(e) => setWhatsappCode(e.target.value)}
                        placeholder="Ingresa el código"
                        maxLength={6}
                        className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white text-center tracking-widest placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                      />
                      <button
                        onClick={verifyWhatsapp}
                        disabled={verifyingWhatsapp || whatsappCode.length !== 6}
                        className="w-full px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-50"
                      >
                        {verifyingWhatsapp ? 'Verificando...' : 'Verificar'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 py-2 rounded-l-lg bg-white/[0.05] border border-r-0 border-white/[0.10] text-sm text-white/40">
                          +52
                        </span>
                        <input
                          type="tel"
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          placeholder="Tu número de WhatsApp"
                          className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-r-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      <button
                        onClick={connectWhatsapp}
                        disabled={connectingWhatsapp || !whatsappPhone.trim()}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-50"
                      >
                        {connectingWhatsapp ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Link2 className="w-3 h-3" />
                        )}
                        Conectar WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {/* Telegram */}
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
                        Envía este código al bot de ARES34 en Telegram:
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
                        <p>2. Envía /start</p>
                        <p>3. Envía el código de arriba</p>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <Shield className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/30">
                  Tu conexión es privada. Solo tú puedes enviar mensajes a tu calendario de ARES34.
                </p>
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION: Calendarios */}
            {/* ============================================================ */}
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
                {/* Google Calendar */}
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
                            Última sync: {new Date(integration.last_sync).toLocaleString('es-MX')}
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
                    <button
                      onClick={() => connectCalendar('google_calendar')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all"
                    >
                      <Link2 className="w-3 h-3" />
                      Conectar
                    </button>
                  )}
                </div>

                {/* Outlook Calendar */}
                <div className={`rounded-xl border p-5 ${outlookConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.10] bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-base font-bold text-blue-400">
                      O
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Outlook Calendar</div>
                      <div className="text-xs text-white/40">
                        {outlookConnected
                          ? integrations.find((i) => i.provider === 'outlook')?.email || 'Conectado'
                          : 'No conectado'}
                      </div>
                    </div>
                    {outlookConnected && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                  </div>

                  {outlookConnected ? (
                    <div className="space-y-2">
                      {(() => {
                        const integration = integrations.find((i) => i.provider === 'outlook');
                        return integration?.last_sync ? (
                          <p className="text-[10px] text-white/30">
                            Última sync: {new Date(integration.last_sync).toLocaleString('es-MX')}
                          </p>
                        ) : null;
                      })()}
                      <div className="flex gap-2">
                        <button
                          onClick={() => syncCalendar('outlook')}
                          disabled={syncingOutlook}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.10] text-xs text-white/70 hover:bg-white/[0.06] transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingOutlook ? 'animate-spin' : ''}`} />
                          Sincronizar
                        </button>
                        <button
                          onClick={() => {
                            const i = integrations.find((i) => i.provider === 'outlook');
                            if (i) disconnectCalendar(i.id);
                          }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Unlink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => connectCalendar('outlook')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all"
                    >
                      <Link2 className="w-3 h-3" />
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION: Videollamadas */}
            {/* ============================================================ */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Videollamadas
                </h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Genera links de Zoom automáticamente al crear eventos.
              </p>

              <div className="max-w-sm">
                <div className={`rounded-xl border p-5 ${zoomIntegration ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.10] bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Video className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Zoom</div>
                      <div className="text-xs text-white/40">
                        {zoomIntegration ? zoomIntegration.email || 'Conectado' : 'No conectado'}
                      </div>
                    </div>
                    {zoomIntegration && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                  </div>

                  {zoomIntegration ? (
                    <button
                      onClick={() => {
                        // Disconnect zoom - need API for this
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Unlink className="w-3 h-3" />
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={connectZoom}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all"
                    >
                      <Link2 className="w-3 h-3" />
                      Conectar Zoom
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
