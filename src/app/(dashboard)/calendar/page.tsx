'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Video,
  CheckCircle2,
  Circle,
  Flag,
  ArrowRight,
  Search,
  Layers,
  GripVertical,
  Sun,
  Moon,
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
  zoom_link?: string;
}

interface CalTask {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  label?: string;
  snoozed_until?: string;
  completed_at?: string;
}

interface Integration {
  id: string;
  provider: string;
  email: string;
  status: string;
  last_sync?: string;
}

type ViewMode = 'week' | 'day';

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

const PRIORITY_CONFIG = {
  high: { color: '#ef4444', label: 'Alta', icon: '!' },
  medium: { color: '#f59e0b', label: 'Media', icon: '-' },
  low: { color: '#6b7280', label: 'Baja', icon: '↓' },
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [tasks, setTasks] = useState<CalTask[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showTaskSidebar, setShowTaskSidebar] = useState(true);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncingOutlook, setSyncingOutlook] = useState(false);

  // Command bar
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [commandMode, setCommandMode] = useState<'task' | 'event'>('task');
  const commandRef = useRef<HTMLInputElement>(null);

  // Create modal state
  const [createMode, setCreateMode] = useState<'event' | 'task'>('event');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [createError, setCreateError] = useState('');

  // Drag state
  const [draggingTask, setDraggingTask] = useState<CalTask | null>(null);

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Columns for the grid
  const gridDates = viewMode === 'week' ? weekDates : [currentDate];
  const gridCols = viewMode === 'week' ? 7 : 1;

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = viewMode === 'week' ? new Date(weekStart) : new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = viewMode === 'week' ? new Date(weekEnd) : new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      const data = await res.json();
      if (res.ok) setEvents(data.events || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [viewMode, weekStart.toISOString(), weekEnd.toISOString(), currentDate.toISOString()]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/tasks');
      const data = await res.json();
      if (res.ok) setTasks(data.tasks || []);
    } catch { /* silent */ }
  }, []);

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/integrations');
      const data = await res.json();
      if (res.ok) setIntegrations(data.integrations || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchTasks();
    fetchIntegrations();
  }, [fetchEvents, fetchTasks, fetchIntegrations]);

  // ============================================================
  // KEYBOARD SHORTCUT: Cmd+K
  // ============================================================

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
        setCommandInput('');
        setTimeout(() => commandRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setShowCommandBar(false);
        setShowCreateModal(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================
  // NAVIGATION
  // ============================================================

  function prev() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1));
    setCurrentDate(d);
  }

  function next() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1));
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // ============================================================
  // CREATE EVENT
  // ============================================================

  function openCreateModal(date?: Date, hour?: number) {
    const target = date || new Date();
    setNewDate(formatDateISO(target));
    if (hour !== undefined) {
      setNewStartTime(`${String(hour).padStart(2, '0')}:00`);
      setNewEndTime(`${String(hour + 1).padStart(2, '0')}:00`);
    }
    setCreateMode('event');
    setShowCreateModal(true);
    setCreateError('');
  }

  async function handleCreateEvent() {
    if (!newTitle.trim()) { setCreateError('El título es obligatorio.'); return; }
    if (!newDate) { setCreateError('Selecciona una fecha.'); return; }
    setCreateError('');
    try {
      const startISO = new Date(`${newDate}T${newStartTime}:00`).toISOString();
      const endISO = new Date(`${newDate}T${newEndTime}:00`).toISOString();
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim(), start_time: startISO, end_time: endISO, color: newColor }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowCreateModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear evento');
    }
  }

  // ============================================================
  // CREATE TASK
  // ============================================================

  async function handleCreateTask() {
    if (!newTitle.trim()) { setCreateError('El título es obligatorio.'); return; }
    setCreateError('');
    try {
      const res = await fetch('/api/calendar/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          priority: newPriority,
          due_date: newDate || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowCreateModal(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear tarea');
    }
  }

  function resetForm() {
    setNewTitle(''); setNewDescription(''); setNewColor('#6366f1'); setNewPriority('medium');
  }

  // ============================================================
  // TASK ACTIONS
  // ============================================================

  async function toggleTaskComplete(task: CalTask) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await fetch('/api/calendar/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      fetchTasks();
    } catch { /* silent */ }
  }

  async function snoozeTaskTo(taskId: string, when: 'tomorrow' | 'next_week') {
    const d = new Date();
    if (when === 'tomorrow') { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); }
    else { d.setDate(d.getDate() + (8 - d.getDay())); d.setHours(9, 0, 0, 0); }
    try {
      await fetch('/api/calendar/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, action: 'snooze', snoozed_until: d.toISOString() }),
      });
      fetchTasks();
    } catch { /* silent */ }
  }

  async function deleteTask(taskId: string) {
    try {
      await fetch(`/api/calendar/tasks?id=${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch { /* silent */ }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      await fetch(`/api/calendar?id=${eventId}`, { method: 'DELETE' });
      fetchEvents();
    } catch { /* silent */ }
  }

  // ============================================================
  // DRAG & DROP: Task → Calendar slot
  // ============================================================

  async function handleDropOnSlot(date: Date, hour: number) {
    if (!draggingTask) return;
    const startISO = new Date(`${formatDateISO(date)}T${String(hour).padStart(2, '0')}:00:00`).toISOString();
    const endISO = new Date(`${formatDateISO(date)}T${String(hour + 1).padStart(2, '0')}:00:00`).toISOString();
    try {
      await fetch('/api/calendar/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggingTask.id, action: 'schedule', scheduled_start: startISO, scheduled_end: endISO }),
      });
      // Also create a calendar event for it
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `📋 ${draggingTask.title}`, start_time: startISO, end_time: endISO, color: PRIORITY_CONFIG[draggingTask.priority].color }),
      });
      fetchTasks();
      fetchEvents();
    } catch { /* silent */ }
    setDraggingTask(null);
  }

  // ============================================================
  // COMMAND BAR SUBMIT
  // ============================================================

  async function handleCommandSubmit() {
    if (!commandInput.trim()) return;
    try {
      if (commandMode === 'task') {
        await fetch('/api/calendar/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: commandInput.trim(), priority: 'medium' }),
        });
        fetchTasks();
      } else {
        const startISO = new Date().toISOString();
        const end = new Date(); end.setHours(end.getHours() + 1);
        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: commandInput.trim(), start_time: startISO, end_time: end.toISOString(), color: '#6366f1' }),
        });
        fetchEvents();
      }
    } catch { /* silent */ }
    setCommandInput('');
    setShowCommandBar(false);
  }

  // ============================================================
  // INTEGRATIONS
  // ============================================================

  async function connectGoogle() {
    setConnectingGoogle(true);
    try {
      const res = await fetch('/api/calendar/integrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'google_calendar' }) });
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { /* silent */ } finally { setConnectingGoogle(false); }
  }
  async function connectOutlook() {
    setConnectingOutlook(true);
    try {
      const res = await fetch('/api/calendar/integrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'outlook' }) });
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { /* silent */ } finally { setConnectingOutlook(false); }
  }
  async function syncGoogle() {
    setSyncingGoogle(true);
    try { const res = await fetch('/api/calendar/google/sync', { method: 'POST' }); if (res.ok) { fetchEvents(); fetchIntegrations(); } } catch { /* silent */ } finally { setSyncingGoogle(false); }
  }
  async function syncOutlook() {
    setSyncingOutlook(true);
    try { const res = await fetch('/api/calendar/outlook/sync', { method: 'POST' }); if (res.ok) { fetchEvents(); fetchIntegrations(); } } catch { /* silent */ } finally { setSyncingOutlook(false); }
  }
  async function disconnectIntegration(integrationId: string) {
    try { await fetch(`/api/calendar/integrations?id=${integrationId}`, { method: 'DELETE' }); fetchIntegrations(); } catch { /* silent */ }
  }

  // ============================================================
  // EVENT HELPERS
  // ============================================================

  function getEventsForSlot(date: Date, hour: number): CalEvent[] {
    return events.filter((e) => {
      const start = new Date(e.start_time);
      return isSameDay(start, date) && start.getHours() === hour;
    });
  }

  function getEventDuration(event: CalEvent): number {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }

  const googleConnected = integrations.some((i) => i.provider === 'google_calendar' && i.status === 'connected');
  const outlookConnected = integrations.some((i) => i.provider === 'outlook' && i.status === 'connected');

  // Filter tasks: exclude snoozed
  const now = new Date();
  const activeTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (t.snoozed_until && new Date(t.snoozed_until) > now) return false;
    return true;
  });
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">ARES Calendar</h1>
              <p className="text-sm text-white/50">
                Tu agenda ejecutiva
                <span className="ml-2 text-white/30 text-xs">⌘K para crear rápido</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-xs transition-all ${viewMode === 'day' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/50 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5 inline mr-1" />Día
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-xs transition-all ${viewMode === 'week' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/50 hover:text-white'}`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />Semana
              </button>
            </div>

            <button
              onClick={() => setShowTaskSidebar(!showTaskSidebar)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all ${showTaskSidebar ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-white/[0.08] text-white/50 hover:text-white'}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tareas</span>
              {activeTasks.length > 0 && (
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] px-1.5 py-0.5 rounded-full">{activeTasks.length}</span>
              )}
            </button>

            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all ${showIntegrations ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-white/[0.08] text-white/50 hover:text-white'}`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Integraciones</span>
            </button>

            <button
              onClick={() => { setCreateMode('event'); setShowCreateModal(true); setCreateError(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>

        {/* Integrations Panel */}
        {showIntegrations && (
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5 mb-6">
            <h3 className="text-sm font-medium text-white mb-4">Conecta tus calendarios</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Google */}
              <div className={`rounded-lg border p-4 ${googleConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.08] bg-white/[0.02]'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">G</div>
                  <div>
                    <div className="text-sm font-medium text-white">Google Calendar</div>
                    <div className="text-xs text-white/40">{googleConnected ? integrations.find((i) => i.provider === 'google_calendar')?.email || 'Conectado' : 'No conectado'}</div>
                  </div>
                </div>
                {googleConnected ? (
                  <div className="flex gap-2">
                    <button onClick={syncGoogle} disabled={syncingGoogle} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.10] text-xs text-white/70 hover:bg-white/[0.06] disabled:opacity-50">
                      <RefreshCw className={`w-3 h-3 ${syncingGoogle ? 'animate-spin' : ''}`} />Sincronizar
                    </button>
                    <button onClick={() => { const i = integrations.find((i) => i.provider === 'google_calendar'); if (i) disconnectIntegration(i.id); }} className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10">
                      <Unlink className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={connectGoogle} disabled={connectingGoogle} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50">
                    {connectingGoogle ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}Conectar
                  </button>
                )}
              </div>
              {/* Outlook */}
              <div className={`rounded-lg border p-4 ${outlookConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.08] bg-white/[0.02]'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">O</div>
                  <div>
                    <div className="text-sm font-medium text-white">Outlook</div>
                    <div className="text-xs text-white/40">{outlookConnected ? integrations.find((i) => i.provider === 'outlook')?.email || 'Conectado' : 'No conectado'}</div>
                  </div>
                </div>
                {outlookConnected ? (
                  <div className="flex gap-2">
                    <button onClick={syncOutlook} disabled={syncingOutlook} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.10] text-xs text-white/70 hover:bg-white/[0.06] disabled:opacity-50">
                      <RefreshCw className={`w-3 h-3 ${syncingOutlook ? 'animate-spin' : ''}`} />Sincronizar
                    </button>
                    <button onClick={() => { const i = integrations.find((i) => i.provider === 'outlook'); if (i) disconnectIntegration(i.id); }} className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10">
                      <Unlink className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={connectOutlook} disabled={connectingOutlook} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50">
                    {connectingOutlook ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}Conectar
                  </button>
                )}
              </div>
              {/* Apple */}
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">A</div>
                  <div>
                    <div className="text-sm font-medium text-white">Apple Calendar</div>
                    <div className="text-xs text-white/40">Pronto</div>
                  </div>
                </div>
                <button disabled className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs text-white/30 cursor-not-allowed">Próximamente</button>
              </div>
            </div>
          </div>
        )}

        {/* Main layout: Calendar + Task sidebar */}
        <div className="flex gap-4">
          {/* Calendar */}
          <div className="flex-1 min-w-0">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={prev} className="p-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                  Hoy
                </button>
                <button onClick={next} className="p-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-lg font-medium text-white">
                {viewMode === 'day'
                  ? `${DAYS_ES[currentDate.getDay()]} ${currentDate.getDate()} de ${MONTHS_ES[currentDate.getMonth()]}`
                  : `${MONTHS_ES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
                }
              </h2>
              {loading && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
            </div>

            {/* Grid */}
            <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] overflow-hidden">
              {/* Day headers */}
              <div className={`grid border-b border-white/[0.08]`} style={{ gridTemplateColumns: `60px repeat(${gridCols}, 1fr)` }}>
                <div className="p-2" />
                {gridDates.map((date, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center border-l border-white/[0.06] ${isToday(date) ? 'bg-indigo-500/10' : ''}`}
                  >
                    <div className="text-xs text-white/40">{DAYS_ES[date.getDay()]}</div>
                    <div className={`text-lg font-medium mt-0.5 ${isToday(date) ? 'text-indigo-400' : 'text-white/80'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              <div className="max-h-[600px] overflow-y-auto">
                {HOURS.map((hour) => (
                  <div key={hour} className="border-b border-white/[0.04]" style={{ display: 'grid', gridTemplateColumns: `60px repeat(${gridCols}, 1fr)` }}>
                    <div className="p-2 text-right pr-3">
                      <span className="text-xs text-white/30">{formatHour(hour)}</span>
                    </div>
                    {gridDates.map((date, dayIdx) => {
                      const slotEvents = getEventsForSlot(date, hour);
                      return (
                        <div
                          key={dayIdx}
                          className={`relative min-h-[48px] border-l border-white/[0.06] cursor-pointer hover:bg-white/[0.03] transition-colors ${
                            isToday(date) ? 'bg-indigo-500/[0.03]' : ''
                          } ${draggingTask ? 'bg-indigo-500/[0.02] hover:bg-indigo-500/[0.08]' : ''}`}
                          onClick={() => openCreateModal(date, hour)}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('!bg-indigo-500/10'); }}
                          onDragLeave={(e) => { e.currentTarget.classList.remove('!bg-indigo-500/10'); }}
                          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('!bg-indigo-500/10'); handleDropOnSlot(date, hour); }}
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
                                <div className="font-medium text-white/90 truncate flex items-center gap-1">
                                  {event.title}
                                  {event.zoom_link && <Video className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />}
                                  {event.source !== 'ares' && (
                                    <span className="text-[8px] px-1 py-0.5 rounded bg-white/10 text-white/40 uppercase flex-shrink-0">{event.source}</span>
                                  )}
                                </div>
                                {duration >= 1 && (
                                  <div className="text-white/40 text-[10px] flex items-center gap-1 mt-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {new Date(event.start_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(event.end_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/20 transition-all">
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
          </div>

          {/* Task Sidebar */}
          {showTaskSidebar && (
            <div className="w-72 shrink-0">
              <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    Tareas
                  </h3>
                  <button
                    onClick={() => { setCreateMode('task'); setShowCreateModal(true); setCreateError(''); }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Active tasks */}
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {activeTasks.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">Sin tareas pendientes</p>
                  )}
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingTask(task)}
                      onDragEnd={() => setDraggingTask(null)}
                      className="group flex items-start gap-2 p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] cursor-grab active:cursor-grabbing transition-all"
                    >
                      <button onClick={() => toggleTaskComplete(task)} className="mt-0.5 shrink-0">
                        <Circle className="w-4 h-4 text-white/30 hover:text-indigo-400 transition-colors" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Flag className="w-3 h-3 shrink-0" style={{ color: PRIORITY_CONFIG[task.priority].color }} />
                          <span className="text-xs text-white/80 truncate">{task.title}</span>
                        </div>
                        {task.due_date && (
                          <span className="text-[10px] text-white/30 mt-0.5 block">{new Date(task.due_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => snoozeTaskTo(task.id, 'tomorrow')}
                          title="Posponer a mañana"
                          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-amber-400 transition-all"
                        >
                          <Moon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          title="Eliminar"
                          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <GripVertical className="w-3 h-3 text-white/20" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Completed tasks */}
                {completedTasks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Completadas ({completedTasks.length})</p>
                    <div className="space-y-1">
                      {completedTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center gap-2 p-1.5 opacity-50">
                          <button onClick={() => toggleTaskComplete(task)}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </button>
                          <span className="text-xs text-white/50 line-through truncate">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drag hint */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-white/20 text-center">
                    Arrastra una tarea al calendario para bloquear tiempo
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* COMMAND BAR (Cmd+K) */}
        {/* ============================================================ */}
        {showCommandBar && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={() => setShowCommandBar(false)}>
            <div className="w-full max-w-lg rounded-xl border border-white/[0.15] bg-[#0a0e14] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center border-b border-white/[0.08]">
                <Search className="w-4 h-4 text-white/40 ml-4" />
                <input
                  ref={commandRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCommandSubmit(); if (e.key === 'Escape') setShowCommandBar(false); }}
                  placeholder={commandMode === 'task' ? 'Crear tarea rápida...' : 'Crear evento rápido...'}
                  className="flex-1 bg-transparent px-3 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-1 pr-3">
                  <button
                    onClick={() => setCommandMode('task')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${commandMode === 'task' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white'}`}
                  >
                    Tarea
                  </button>
                  <button
                    onClick={() => setCommandMode('event')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${commandMode === 'event' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white'}`}
                  >
                    Evento
                  </button>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between text-[10px] text-white/25">
                <span>Enter para crear · Esc para cerrar · Tab para cambiar tipo</span>
                <span>⌘K</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CREATE MODAL */}
        {/* ============================================================ */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-white/[0.15] bg-[#0a0e14] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {/* Toggle event/task */}
                  <button onClick={() => setCreateMode('event')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${createMode === 'event' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white'}`}>
                    Evento
                  </button>
                  <button onClick={() => setCreateMode('task')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${createMode === 'task' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white'}`}>
                    Tarea
                  </button>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all">
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
                    placeholder={createMode === 'event' ? 'Nombre del evento' : 'Nombre de la tarea'}
                    className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') { createMode === 'event' ? handleCreateEvent() : handleCreateTask(); } }}
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

                {createMode === 'task' && (
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Prioridad</label>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setNewPriority(p)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all ${
                            newPriority === p ? 'border-white/30 bg-white/[0.06] text-white' : 'border-white/[0.08] text-white/40 hover:text-white'
                          }`}
                        >
                          <Flag className="w-3 h-3" style={{ color: PRIORITY_CONFIG[p].color }} />
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-white/60 mb-1.5">{createMode === 'event' ? 'Fecha' : 'Fecha límite (opcional)'}</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                  />
                </div>

                {createMode === 'event' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-white/60 mb-1.5">Inicio</label>
                        <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]" />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1.5">Fin</label>
                        <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Color</label>
                      <div className="flex gap-2">
                        {EVENT_COLORS.map((c) => (
                          <button key={c.value} onClick={() => setNewColor(c.value)} className={`w-7 h-7 rounded-full transition-all ${newColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0e14]' : 'hover:scale-110'}`} style={{ backgroundColor: c.value }} title={c.label} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {createError && <p className="text-sm text-red-400">{createError}</p>}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] transition-all">
                    Cancelar
                  </button>
                  <button
                    onClick={createMode === 'event' ? handleCreateEvent : handleCreateTask}
                    className="flex-1 px-4 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
                  >
                    {createMode === 'event' ? 'Crear evento' : 'Crear tarea'}
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
