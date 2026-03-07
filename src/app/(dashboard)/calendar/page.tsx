'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  RefreshCw,
  Link2,
  Unlink,
  Clock,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface CalEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  source: string;
}

interface Integration {
  id: string;
  provider: string;
  email: string;
  status: string;
  last_sync?: string;
}

// ============================================================
// HELPERS
// ============================================================

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am to 10pm

const EVENT_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#06b6d4', label: 'Cyan' },
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Start on Monday
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

// ============================================================
// COMPONENT
// ============================================================

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  // New event form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newColor, setNewColor] = useState('#6366f1');
  const [createError, setCreateError] = useState('');

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(weekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(weekEnd);
      end.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/integrations');
      const data = await res.json();
      if (res.ok) {
        setIntegrations(data.integrations || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchIntegrations();
  }, [fetchEvents, fetchIntegrations]);

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }

  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  function openCreateModal(date?: Date, hour?: number) {
    const target = date || new Date();
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setNewDate(`${y}-${m}-${d}`);
    if (hour !== undefined) {
      setNewStartTime(`${String(hour).padStart(2, '0')}:00`);
      setNewEndTime(`${String(hour + 1).padStart(2, '0')}:00`);
    }
    setShowCreateModal(true);
    setCreateError('');
  }

  async function handleCreateEvent() {
    if (!newTitle.trim()) {
      setCreateError('El título es obligatorio.');
      return;
    }
    if (!newDate) {
      setCreateError('Selecciona una fecha.');
      return;
    }

    setCreateError('');
    try {
      const startISO = new Date(`${newDate}T${newStartTime}:00`).toISOString();
      const endISO = new Date(`${newDate}T${newEndTime}:00`).toISOString();

      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          start_time: startISO,
          end_time: endISO,
          color: newColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reset and refresh
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewColor('#6366f1');
      fetchEvents();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear evento');
    }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      await fetch(`/api/calendar?id=${eventId}`, { method: 'DELETE' });
      fetchEvents();
    } catch {
      // silent
    }
  }

  async function connectGoogle() {
    setConnectingGoogle(true);
    try {
      const res = await fetch('/api/calendar/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google_calendar' }),
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert('Error al conectar con Google Calendar');
    } finally {
      setConnectingGoogle(false);
    }
  }

  async function disconnectIntegration(integrationId: string) {
    try {
      await fetch(`/api/calendar/integrations?id=${integrationId}`, { method: 'DELETE' });
      fetchIntegrations();
    } catch {
      // silent
    }
  }

  // Get events for a specific day and hour
  function getEventsForSlot(date: Date, hour: number): CalEvent[] {
    return events.filter((e) => {
      const start = new Date(e.start_time);
      const startHour = start.getHours();
      return isSameDay(start, date) && startHour === hour;
    });
  }

  // Calculate event duration in hours
  function getEventDuration(event: CalEvent): number {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }

  const googleConnected = integrations.some(
    (i) => i.provider === 'google_calendar' && i.status === 'connected'
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">ARES Calendar</h1>
              <p className="text-sm text-white/50">Tu agenda ejecutiva</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                showIntegrations
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/20 text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Integraciones</span>
            </button>
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo evento
            </button>
          </div>
        </div>

        {/* Integrations Panel */}
        {showIntegrations && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 mb-6">
            <h3 className="text-sm font-medium text-white mb-4">Conecta tus calendarios</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Google Calendar */}
              <div className={`rounded-lg border p-4 ${googleConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.08] bg-white/[0.02]'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
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
                </div>
                {googleConnected ? (
                  <button
                    onClick={() => {
                      const integration = integrations.find((i) => i.provider === 'google_calendar');
                      if (integration) disconnectIntegration(integration.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Unlink className="w-3 h-3" />
                    Desconectar
                  </button>
                ) : (
                  <button
                    onClick={connectGoogle}
                    disabled={connectingGoogle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {connectingGoogle ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                    Conectar
                  </button>
                )}
              </div>

              {/* Outlook */}
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">
                    O
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Outlook</div>
                    <div className="text-xs text-white/40">Pronto</div>
                  </div>
                </div>
                <button disabled className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs text-white/30 cursor-not-allowed">
                  Próximamente
                </button>
              </div>

              {/* Apple Calendar */}
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                    A
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Apple Calendar</div>
                    <div className="text-xs text-white/40">Pronto</div>
                  </div>
                </div>
                <button disabled className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs text-white/30 cursor-not-allowed">
                  Próximamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="p-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Hoy
            </button>
            <button
              onClick={nextWeek}
              className="p-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-medium text-white">
            {MONTHS_ES[weekStart.getMonth()]} {weekStart.getFullYear()}
          </h2>
          {loading && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
        </div>

        {/* Week Grid */}
        <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.08]">
            <div className="p-2" />
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={`p-3 text-center border-l border-white/[0.06] ${
                  isToday(date) ? 'bg-indigo-500/10' : ''
                }`}
              >
                <div className="text-xs text-white/40">{DAYS_ES[date.getDay()]}</div>
                <div className={`text-lg font-medium mt-0.5 ${
                  isToday(date) ? 'text-indigo-400' : 'text-white/80'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.04]">
                <div className="p-2 text-right pr-3">
                  <span className="text-xs text-white/30">{formatHour(hour)}</span>
                </div>
                {weekDates.map((date, dayIdx) => {
                  const slotEvents = getEventsForSlot(date, hour);
                  return (
                    <div
                      key={dayIdx}
                      className={`relative min-h-[48px] border-l border-white/[0.06] cursor-pointer hover:bg-white/[0.03] transition-colors ${
                        isToday(date) ? 'bg-indigo-500/[0.03]' : ''
                      }`}
                      onClick={() => openCreateModal(date, hour)}
                    >
                      {slotEvents.map((event) => {
                        const duration = getEventDuration(event);
                        const startMin = new Date(event.start_time).getMinutes();
                        return (
                          <div
                            key={event.id}
                            className="absolute left-0.5 right-0.5 rounded-md px-2 py-1 text-xs overflow-hidden z-10 group"
                            style={{
                              backgroundColor: `${event.color}25`,
                              borderLeft: `3px solid ${event.color}`,
                              top: `${(startMin / 60) * 100}%`,
                              height: `${Math.max(duration * 48 - 2, 20)}px`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="font-medium text-white/90 truncate">{event.title}</div>
                            {duration >= 1 && (
                              <div className="text-white/40 text-[10px] flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(event.start_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(event.end_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/20 transition-all"
                            >
                              <X className="w-3 h-3 text-white/60" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-white/[0.15] bg-[#0a0e14] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-medium text-white">Nuevo evento</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Título</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nombre del evento"
                    className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Descripción</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detalles opcionales..."
                    rows={2}
                    className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Inicio</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Fin</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Color</label>
                  <div className="flex gap-2">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewColor(c.value)}
                        className={`w-7 h-7 rounded-full transition-all ${
                          newColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0e14]' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {createError && (
                  <p className="text-sm text-red-400">{createError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="flex-1 px-4 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
                  >
                    Crear evento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
