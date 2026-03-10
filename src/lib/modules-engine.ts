// ============================================================
// ARES34 — Motor de Módulos Extendidos
// Brief, Scenarios, Compliance, Pulse, Prep
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { callClaude, callClaudeCritical } from './anthropic';
import { buildCompanyContextBlock } from './ares-engine';
import { pushEventToGoogle } from './google-calendar';
import {
  BRIEF_AGENT_PROMPT,
  SCENARIO_CLASSIFIER_PROMPT,
  SCENARIO_ANALYST_PROMPT,
  COMPLIANCE_CLASSIFIER_PROMPT,
  COMPLIANCE_ANALYST_PROMPT,
  PULSE_ANALYST_PROMPT,
  PREP_AGENT_PROMPT,
  CONTRACT_GENERATOR_PROMPT,
  MESSAGING_CLASSIFIER_PROMPT,
  parseSections,
} from './module-prompts';
import type {
  BriefResponse,
  ScenarioResponse,
  ScenarioCategory,
  ComplianceResponse,
  ComplianceArea,
  RiskLevel,
  PulseResponse,
  PrepResponse,
  MeetingType,
  ContractType,
  ContractResponse,
  CalendarEvent,
  CalendarEventInput,
  CalendarIntegration,
  CalendarTask,
  CalendarTaskInput,
  TaskStatus,
  ParsedCalendarIntent,
} from './types';

// ============================================================
// ADMIN CLIENT
// ============================================================

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// HELPER: Get recent conversations for context
// ============================================================

async function getRecentConversations(userId: string, limit: number = 5): Promise<string> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('conversations')
    .select('question, route_level, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return '';

  return data
    .map((c: { question: string; route_level: string; created_at: string }) =>
      `- [${c.route_level}] ${c.question} (${new Date(c.created_at).toLocaleDateString('es-MX')})`
    )
    .join('\n');
}

// ============================================================
// HELPER: Get pending decisions
// ============================================================

async function getPendingDecisions(userId: string): Promise<string> {
  const supabase = createAdminClient();

  // Get recent conversations
  const { data } = await supabase
    .from('conversations')
    .select('id, question, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return 'No hay decisiones pendientes registradas.';

  const convIds = data.map((c) => c.id).filter(Boolean);

  // Check which have decision_logs with outcomes
  const { data: decisions } = await supabase
    .from('decision_logs')
    .select('conversation_id, real_world_outcome')
    .in('conversation_id', convIds);

  const decidedIds = new Set(
    (decisions || [])
      .filter((d) => d.real_world_outcome)
      .map((d) => d.conversation_id)
  );

  const pending = data.filter((c) => !decidedIds.has(c.id));

  if (pending.length === 0) return 'No hay decisiones pendientes.';

  return pending
    .slice(0, 5)
    .map((c) =>
      `- ${c.question} (${new Date(c.created_at).toLocaleDateString('es-MX')})`
    )
    .join('\n');
}

// ============================================================
// MODULE 1: ARES BRIEF — Daily CEO Briefing
// ============================================================

export async function generateDailyBrief(userId: string): Promise<BriefResponse> {
  // Build context in parallel
  const [contextBlock, recentConversations, pendingDecisions] = await Promise.all([
    buildCompanyContextBlock(userId),
    getRecentConversations(userId),
    getPendingDecisions(userId),
  ]);

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userMessage = `Fecha de hoy: ${today}

CONTEXTO DE LA EMPRESA:
${contextBlock || 'No hay contexto registrado todavía.'}

CONSULTAS RECIENTES DEL CEO:
${recentConversations || 'No hay consultas previas.'}

DECISIONES PENDIENTES DE SEGUIMIENTO:
${pendingDecisions}

Genera el brief matutino personalizado para hoy.`;

  const response = await callClaude(BRIEF_AGENT_PROMPT, userMessage, 2000);

  // Parse sections
  const sectionNames = [
    'Resumen Ejecutivo',
    'KPIs a Monitorear',
    'Decisiones Pendientes',
    'Alertas',
    'Prioridades del Día',
    'Contexto de Mercado',
  ];
  const parsed = parseSections(response, sectionNames);

  // Save to DB
  const supabase = createAdminClient();
  await supabase.from('daily_briefs').insert({
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    summary: response,
    kpis_highlight: parsed['KPIs a Monitorear'] || '',
    pending_decisions: parsed['Decisiones Pendientes'] || '',
    alerts: parsed['Alertas'] || '',
  }).then(() => {});

  return {
    brief: response,
    date: today,
    sections: {
      greeting: response.split('\n')[0] || `Buenos días`,
      kpis: parsed['KPIs a Monitorear'] || '',
      pending_decisions: parsed['Decisiones Pendientes'] || '',
      alerts: parsed['Alertas'] || '',
      priorities: parsed['Prioridades del Día'] || '',
      market_context: parsed['Contexto de Mercado'] || '',
    },
  };
}

// ============================================================
// MODULE 2: ARES SCENARIOS — What-If Engine
// ============================================================

export async function analyzeScenario(
  userId: string,
  hypothesis: string
): Promise<ScenarioResponse> {
  const contextBlock = await buildCompanyContextBlock(userId);

  // Step 1: Classify the scenario
  const classifyMessage = `Hipótesis del CEO: "${hypothesis}"

Contexto de la empresa:
${contextBlock || 'Sin contexto adicional.'}`;

  let category: ScenarioCategory = 'general';
  try {
    const classResponse = await callClaudeCritical(
      SCENARIO_CLASSIFIER_PROMPT,
      classifyMessage,
      256
    );
    const cleaned = classResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    category = parsed.category || 'general';
  } catch {
    category = 'general';
  }

  // Step 2: Full analysis
  const analysisMessage = `Hipótesis del CEO: "${hypothesis}"

Categoría identificada: ${category}

CONTEXTO COMPLETO DE LA EMPRESA:
${contextBlock || 'Sin contexto registrado.'}

Genera un análisis completo de este escenario.`;

  const response = await callClaude(SCENARIO_ANALYST_PROMPT, analysisMessage, 3000);

  // Parse sections
  const sectionNames = [
    'Resumen',
    'Impacto Financiero',
    'Riesgos',
    'Oportunidades',
    'Timeline Sugerido',
    'Recomendación',
  ];
  const parsed = parseSections(response, sectionNames);

  // Save to DB
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('scenarios')
    .insert({
      user_id: userId,
      hypothesis,
      category,
      analysis: response,
    })
    .select('id')
    .single();

  return {
    scenarioId: data?.id || '',
    hypothesis,
    category,
    analysis: response,
    sections: {
      summary: parsed['Resumen'] || '',
      financial_impact: parsed['Impacto Financiero'] || '',
      risks: parsed['Riesgos'] || '',
      opportunities: parsed['Oportunidades'] || '',
      timeline: parsed['Timeline Sugerido'] || '',
      recommendation: parsed['Recomendación'] || '',
    },
  };
}

// ============================================================
// MODULE 3: ARES COMPLIANCE — Mexican Legal Checker
// ============================================================

export async function checkCompliance(
  userId: string,
  query: string
): Promise<ComplianceResponse> {
  const contextBlock = await buildCompanyContextBlock(userId);

  // Step 1: Classify area and risk
  const classifyMessage = `Consulta del CEO: "${query}"

Contexto de la empresa:
${contextBlock || 'Sin contexto adicional.'}`;

  let area: ComplianceArea = 'general';
  let riskLevel: RiskLevel = 'medio';

  try {
    const classResponse = await callClaudeCritical(
      COMPLIANCE_CLASSIFIER_PROMPT,
      classifyMessage,
      256
    );
    const cleaned = classResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    area = parsed.area || 'general';
    riskLevel = parsed.risk_level || 'medio';
  } catch {
    // defaults
  }

  // Step 2: Full analysis
  const analysisMessage = `Consulta del CEO: "${query}"

Área identificada: ${area}
Nivel de riesgo preliminar: ${riskLevel}

CONTEXTO COMPLETO DE LA EMPRESA:
${contextBlock || 'Sin contexto registrado.'}

Genera el análisis de cumplimiento completo.`;

  const response = await callClaude(COMPLIANCE_ANALYST_PROMPT, analysisMessage, 3000);

  // Parse sections
  const sectionNames = [
    'Resumen',
    'Marco Legal Aplicable',
    'Obligaciones',
    'Riesgos de Incumplimiento',
    'Acciones Recomendadas',
    'Fechas Clave',
  ];
  const parsed = parseSections(response, sectionNames);

  // Save to DB
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('compliance_checks')
    .insert({
      user_id: userId,
      query,
      area,
      analysis: response,
      risk_level: riskLevel,
    })
    .select('id')
    .single();

  return {
    checkId: data?.id || '',
    area,
    risk_level: riskLevel,
    analysis: response,
    sections: {
      summary: parsed['Resumen'] || '',
      applicable_laws: parsed['Marco Legal Aplicable'] || '',
      obligations: parsed['Obligaciones'] || '',
      risks: parsed['Riesgos de Incumplimiento'] || '',
      action_items: parsed['Acciones Recomendadas'] || '',
      deadlines: parsed['Fechas Clave'] || '',
    },
  };
}

// ============================================================
// MODULE 4: ARES PULSE — Business Intelligence
// ============================================================

export async function generatePulse(
  userId: string,
  focus: string = 'general'
): Promise<PulseResponse> {
  const [contextBlock, recentConversations] = await Promise.all([
    buildCompanyContextBlock(userId),
    getRecentConversations(userId, 10),
  ]);

  const userMessage = `Enfoque solicitado: ${focus}

CONTEXTO COMPLETO DE LA EMPRESA:
${contextBlock || 'Sin contexto registrado. Genera un análisis general basado en las mejores prácticas para PyMEs mexicanas.'}

HISTORIAL DE CONSULTAS DEL CEO (las más recientes):
${recentConversations || 'Sin consultas previas.'}

Genera el pulso del negocio.`;

  const response = await callClaude(PULSE_ANALYST_PROMPT, userMessage, 3000);

  // Parse sections
  const sectionNames = [
    'Resumen Ejecutivo',
    'Salud Financiera',
    'Alertas de Riesgo',
    'Equipo y Organización',
    'Concentración de Clientes',
    'Recomendaciones Prioritarias',
  ];
  const parsed = parseSections(response, sectionNames);

  // Save to DB
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('pulse_snapshots')
    .insert({
      user_id: userId,
      analysis: response,
      focus,
    })
    .select('id')
    .single();

  return {
    snapshotId: data?.id || '',
    analysis: response,
    sections: {
      executive_summary: parsed['Resumen Ejecutivo'] || '',
      financial_health: parsed['Salud Financiera'] || '',
      risk_alerts: parsed['Alertas de Riesgo'] || '',
      team_insights: parsed['Equipo y Organización'] || '',
      client_concentration: parsed['Concentración de Clientes'] || '',
      recommendations: parsed['Recomendaciones Prioritarias'] || '',
    },
  };
}

// ============================================================
// MODULE 5: ARES PREP — Meeting Preparation
// ============================================================

export async function prepareMeeting(
  userId: string,
  meetingTopic: string,
  meetingType: MeetingType,
  attendees?: string,
  additionalContext?: string
): Promise<PrepResponse> {
  const contextBlock = await buildCompanyContextBlock(userId);

  const meetingTypeLabels: Record<MeetingType, string> = {
    board: 'Junta de Consejo de Administración',
    investor: 'Reunión con Inversionistas',
    team: 'Junta con el Equipo',
    client: 'Reunión con Cliente',
    vendor: 'Reunión con Proveedor',
    partner: 'Reunión con Socio/Partner',
    general: 'Reunión General',
  };

  const userMessage = `TIPO DE REUNIÓN: ${meetingTypeLabels[meetingType] || meetingType}
TEMA: ${meetingTopic}
${attendees ? `ASISTENTES: ${attendees}` : ''}
${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}` : ''}

CONTEXTO COMPLETO DE LA EMPRESA:
${contextBlock || 'Sin contexto registrado.'}

Genera el brief de preparación para esta reunión.`;

  const response = await callClaude(PREP_AGENT_PROMPT, userMessage, 2500);

  // Parse sections
  const sectionNames = [
    'Contexto de la Reunión',
    'Objetivos de la Reunión',
    'Talking Points',
    'Riesgos a Abordar',
    'Preguntas que Hacer',
    'Resultados Deseados',
  ];
  const parsed = parseSections(response, sectionNames);

  // Save to DB
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('meeting_preps')
    .insert({
      user_id: userId,
      meeting_topic: meetingTopic,
      meeting_type: meetingType,
      brief: response,
    })
    .select('id')
    .single();

  return {
    prepId: data?.id || '',
    meeting_topic: meetingTopic,
    meeting_type: meetingType,
    brief: response,
    sections: {
      context: parsed['Contexto de la Reunión'] || '',
      objectives: parsed['Objetivos de la Reunión'] || '',
      talking_points: parsed['Talking Points'] || '',
      risks_to_address: parsed['Riesgos a Abordar'] || '',
      questions_to_ask: parsed['Preguntas que Hacer'] || '',
      desired_outcomes: parsed['Resultados Deseados'] || '',
    },
  };
}

// ============================================================
// MODULE 6: CONTRACT GENERATOR
// ============================================================

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  nda: 'Acuerdo de Confidencialidad (NDA)',
  servicios: 'Contrato de Prestación de Servicios Profesionales',
  laboral: 'Contrato Individual de Trabajo',
  arrendamiento: 'Contrato de Arrendamiento Comercial',
  sociedad: 'Contrato de Sociedad / Asociación',
  proveedor: 'Contrato con Proveedor',
};

export async function generateContract(
  userId: string,
  contractType: ContractType,
  prompt: string
): Promise<ContractResponse> {
  const contextBlock = await buildCompanyContextBlock(userId);

  const userMessage = `TIPO DE CONTRATO: ${CONTRACT_TYPE_LABELS[contractType] || contractType}

DESCRIPCIÓN DEL USUARIO:
${prompt}

CONTEXTO DE LA EMPRESA DEL CEO:
${contextBlock || 'Sin contexto registrado.'}

Genera el contrato completo y profesional.`;

  const response = await callClaude(CONTRACT_GENERATOR_PROMPT, userMessage, 4000);

  // Extract title from the first ## heading
  const titleMatch = response.match(/^##\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : CONTRACT_TYPE_LABELS[contractType];

  // Save to DB
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('generated_contracts')
    .insert({
      user_id: userId,
      contract_type: contractType,
      prompt,
      title,
      generated_content: response,
    })
    .select('id')
    .single();

  return {
    contractId: data?.id || '',
    contract_type: contractType,
    title,
    content: response,
  };
}

// ============================================================
// MODULE 7: CALENDAR — CRUD Operations
// ============================================================

export async function getCalendarEvents(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startDate)
    .lte('end_time', endDate)
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as CalendarEvent[];
}

export async function createCalendarEvent(
  userId: string,
  event: CalendarEventInput
): Promise<CalendarEvent> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      title: event.title,
      description: event.description || '',
      start_time: event.start_time,
      end_time: event.end_time,
      all_day: event.all_day || false,
      color: event.color || '#6366f1',
      source: 'ares',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Two-way sync: push to Google Calendar if connected (non-blocking)
  pushEventToGoogle(userId, {
    id: data.id,
    title: data.title,
    description: data.description,
    start_time: data.start_time,
    end_time: data.end_time,
    all_day: data.all_day,
  }).catch((err) => console.error('Push to Google failed:', err));

  return data as CalendarEvent;
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  updates: Partial<CalendarEventInput>
): Promise<CalendarEvent> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CalendarEvent;
}

export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

// ============================================================
// CALENDAR INTEGRATIONS
// ============================================================

export async function getCalendarIntegrations(
  userId: string
): Promise<CalendarIntegration[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('calendar_integrations')
    .select('id, user_id, provider, email, status, last_sync, created_at')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return (data || []) as CalendarIntegration[];
}

export async function disconnectIntegration(
  userId: string,
  integrationId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('calendar_integrations')
    .delete()
    .eq('id', integrationId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

// ============================================================
// CALENDAR TASKS — CRUD Operations
// ============================================================

export async function getCalendarTasks(
  userId: string,
  includeCompleted = false
): Promise<CalendarTask[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('calendar_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!includeCompleted) {
    query = query.neq('status', 'completed');
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as CalendarTask[];
}

export async function createCalendarTask(
  userId: string,
  task: CalendarTaskInput
): Promise<CalendarTask> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('calendar_tasks')
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.due_date || null,
      label: task.label || '',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CalendarTask;
}

export async function updateCalendarTask(
  userId: string,
  taskId: string,
  updates: Partial<CalendarTask>
): Promise<CalendarTask> {
  const supabase = createAdminClient();

  const safeUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) safeUpdates.title = updates.title;
  if (updates.description !== undefined) safeUpdates.description = updates.description;
  if (updates.priority !== undefined) safeUpdates.priority = updates.priority;
  if (updates.status !== undefined) safeUpdates.status = updates.status;
  if (updates.due_date !== undefined) safeUpdates.due_date = updates.due_date;
  if (updates.label !== undefined) safeUpdates.label = updates.label;
  if (updates.scheduled_start !== undefined) safeUpdates.scheduled_start = updates.scheduled_start;
  if (updates.scheduled_end !== undefined) safeUpdates.scheduled_end = updates.scheduled_end;
  if (updates.snoozed_until !== undefined) safeUpdates.snoozed_until = updates.snoozed_until;
  if (updates.status === 'completed') safeUpdates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('calendar_tasks')
    .update(safeUpdates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CalendarTask;
}

export async function deleteCalendarTask(
  userId: string,
  taskId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('calendar_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function scheduleTask(
  userId: string,
  taskId: string,
  startTime: string,
  endTime: string
): Promise<CalendarTask> {
  return updateCalendarTask(userId, taskId, {
    scheduled_start: startTime,
    scheduled_end: endTime,
    status: 'in_progress' as TaskStatus,
  } as Partial<CalendarTask>);
}

export async function snoozeTask(
  userId: string,
  taskId: string,
  until: string
): Promise<CalendarTask> {
  return updateCalendarTask(userId, taskId, {
    snoozed_until: until,
  } as Partial<CalendarTask>);
}

// ============================================================
// MESSAGING — Parse Natural Language Calendar Intent
// ============================================================

export async function parseMessageIntent(
  userId: string,
  message: string
): Promise<ParsedCalendarIntent> {
  const now = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const prompt = MESSAGING_CLASSIFIER_PROMPT.replace('{{CURRENT_DATETIME}}', now);

  try {
    const response = await callClaudeCritical(prompt, message, 512);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      action: parsed.action || 'unknown',
      title: parsed.title || undefined,
      start_time: parsed.start_time || undefined,
      end_time: parsed.end_time || undefined,
      needs_zoom: parsed.needs_zoom || false,
      confidence: parsed.confidence || 0,
      raw_message: message,
    };
  } catch {
    return {
      action: 'unknown',
      confidence: 0,
      raw_message: message,
    };
  }
}

// ============================================================
// MESSAGING — Process Intent and Execute
// ============================================================

export async function processMessagingIntent(
  userId: string,
  message: string
): Promise<string> {
  const intent = await parseMessageIntent(userId, message);

  if (intent.action === 'unknown' || intent.confidence < 0.5) {
    return 'No entendí tu mensaje. Puedes decirme cosas como:\n- "Agenda junta mañana a las 3pm"\n- "¿Qué tengo hoy?"\n- "Cancela mi cita de las 5"';
  }

  if (intent.action === 'create_event') {
    if (!intent.title || !intent.start_time || !intent.end_time) {
      return 'Necesito más detalles. ¿Cuál es el título, fecha y hora del evento?';
    }

    try {
      const event = await createCalendarEvent(userId, {
        title: intent.title,
        start_time: intent.start_time,
        end_time: intent.end_time,
        color: '#6366f1',
      });

      const startDate = new Date(event.start_time);
      const formattedDate = startDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'America/Mexico_City',
      });
      const formattedTime = startDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Mexico_City',
      });

      return `Listo, agendé "${event.title}" para el ${formattedDate} a las ${formattedTime}.`;
    } catch {
      return 'Hubo un error al crear el evento. Intenta de nuevo.';
    }
  }

  if (intent.action === 'list_events') {
    try {
      const now = new Date();
      const cdmxOffset = -6 * 60;
      const localNow = new Date(now.getTime() + (cdmxOffset + now.getTimezoneOffset()) * 60000);

      const startOfDay = new Date(localNow);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(localNow);
      endOfDay.setHours(23, 59, 59, 999);

      const events = await getCalendarEvents(
        userId,
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      if (events.length === 0) {
        return 'No tienes eventos agendados para hoy.';
      }

      const lines = events.map((e) => {
        const start = new Date(e.start_time).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Mexico_City',
        });
        return `- ${start}: ${e.title}`;
      });

      return `Tu agenda de hoy:\n${lines.join('\n')}`;
    } catch {
      return 'Hubo un error al consultar tu agenda.';
    }
  }

  if (intent.action === 'delete_event') {
    return 'Para cancelar un evento, por favor hazlo desde tu calendario en ARES34. Por seguridad no se pueden eliminar eventos por mensaje.';
  }

  return 'No pude procesar tu solicitud. Intenta de nuevo.';
}
