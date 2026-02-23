// ============================================================
// ARES34 — Motor de Deliberación Multi-Entidad
// 3 entidades (C-Suite, Board, Assembly) deliberan en paralelo
// Atlas sintetiza C-Suite → ARES34 sintetiza las 3 entidades
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { callClaude, callClaudeCritical } from './anthropic';
import {
  ARES_MANAGER_PROMPT,
  // C-Suite (9 executives)
  CSUITE_CFO_PATRICK_PROMPT,
  CSUITE_COO_MAURICIO_PROMPT,
  CSUITE_CMO_ALEJANDRA_PROMPT,
  CSUITE_CTO_JAY_PROMPT,
  CSUITE_CHRO_CATHY_PROMPT,
  CSUITE_CLO_BRET_PROMPT,
  CSUITE_CSO_ROGER_PROMPT,
  CSUITE_CCO_PABLO_PROMPT,
  CSUITE_CDO_JC_PROMPT,
  // Atlas (C-Suite synthesizer)
  getAtlasSynthesisPrompt,
  ATLAS_CEO_COPILOT_PROMPT,
  // Board (5 directors)
  BOARD_VICTORIA_PROMPT,
  BOARD_SANTIAGO_PROMPT,
  BOARD_CARMEN_PROMPT,
  BOARD_FERNANDO_PROMPT,
  BOARD_GABRIELA_PROMPT,
  // Assembly (3 shareholders)
  ASSEMBLY_ANDRES_PROMPT,
  ASSEMBLY_HELENA_PROMPT,
  ASSEMBLY_TOMAS_PROMPT,
  // Synthesizers
  SYNTHESIZER_PROMPT,
  getARESSynthesisPrompt,
} from './prompts';
import {
  saveConversation,
  saveDeliberation,
  getCompanyContext,
} from './supabase';
import type {
  ARESClassification,
  ARESResponse,
  Perspective,
  EntityDeliberation,
  TensionPoint,
  EntityName,
  PerspectiveVote,
} from './types';

// ============================================================
// CONSTANTS
// ============================================================

const MAX_COMPANY_CONTEXT_CHARS = 2000;
const MAX_DOCUMENT_TEXT_CHARS = 8000;
const MAX_PROFILE_CHARS = 4000;
const MAX_CEO_CONTEXT_CHARS = 4000;
const AGENT_MAX_TOKENS = 2048;
const SYNTHESIS_MAX_TOKENS = 3000;
const MANAGER_MAX_TOKENS = 1024;

// ============================================================
// ADMIN CLIENT (for direct DB queries)
// ============================================================

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// COMPANY CONTEXT BUILDER
// ============================================================

export async function buildCompanyContextBlock(userId: string): Promise<string> {
  // Pull legacy context + documents
  const { companyContext, documentTexts } = await getCompanyContext(userId);

  // Pull new company_profiles and ceo_context_snapshot tables
  const supabase = createAdminClient();

  const [profileResult, ceoContextResult] = await Promise.all([
    supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('ceo_context_snapshot')
      .select('*')
      .eq('user_id', userId)
      .single(),
  ]);

  let block = '';

  // --- Company Profile (structured data from onboarding v2) ---
  if (profileResult.data) {
    const p = profileResult.data;
    const profileParts: string[] = [];

    // Identity & Structure
    if (p.legal_name) profileParts.push(`Empresa: ${p.legal_name}`);
    if (p.sector) profileParts.push(`Sector: ${p.sector}`);
    if (p.specific_activity) profileParts.push(`Actividad: ${p.specific_activity}`);
    if (p.founding_year) profileParts.push(`Fundada en: ${p.founding_year}`);
    if (p.employee_range) profileParts.push(`Empleados: ${formatRange(p.employee_range)}`);
    if (p.main_office_location) profileParts.push(`Ubicación: ${p.main_office_location}`);
    if (p.society_type) profileParts.push(`Tipo societario: ${formatSocietyType(p.society_type)}`);

    // Governance
    if (p.has_formal_board !== null) profileParts.push(`Consejo formal: ${p.has_formal_board ? 'Sí' : 'No'}`);
    if (p.board_member_count) profileParts.push(`Miembros del consejo: ${p.board_member_count}`);
    if (p.ceo_is_shareholder !== null) profileParts.push(`CEO es accionista: ${p.ceo_is_shareholder ? `Sí (${p.ceo_shareholder_pct || '?'}%)` : 'No'}`);
    if (p.shareholder_count) profileParts.push(`Número de socios: ${p.shareholder_count}`);
    if (p.family_in_leadership !== null) profileParts.push(`Familia en puestos clave: ${p.family_in_leadership ? 'Sí' : 'No'}`);

    // Financials
    if (p.revenue_range) profileParts.push(`Facturación: ${formatRevenueRange(p.revenue_range)}`);
    if (p.revenue_trend) profileParts.push(`Tendencia de ingresos: ${formatRevenueTrend(p.revenue_trend)}`);
    if (p.is_profitable !== null) profileParts.push(`Rentable: ${p.is_profitable ? 'Sí' : 'No'}`);
    if (p.has_significant_debt !== null && p.has_significant_debt) profileParts.push(`Deuda: ${formatDebtRange(p.debt_range)}`);
    if (p.has_external_investors) profileParts.push('Tiene inversionistas externos');
    if (p.seeking_financing) profileParts.push('Busca financiamiento');

    // Market
    if (p.client_type) profileParts.push(`Tipo de cliente: ${p.client_type}`);
    if (p.market_position) profileParts.push(`Posición de mercado: ${formatMarketPosition(p.market_position)}`);
    if (p.operates_in_regulated_market) profileParts.push(`Mercado regulado: ${p.regulated_market_detail || 'Sí'}`);
    if (p.exports_internationally) profileParts.push(`Exporta: Sí (${p.international_pct || '?'}%)`);

    // Technology
    if (p.digitalization_level) profileParts.push(`Nivel digital: ${p.digitalization_level}`);
    if (p.uses_ai) profileParts.push(`Usa IA: ${p.ai_detail || 'Sí'}`);

    // CEO
    if (p.ceo_is_founder !== null) profileParts.push(`CEO es fundador: ${p.ceo_is_founder ? 'Sí' : 'No'}`);
    if (p.ceo_years_in_role) profileParts.push(`Años como CEO: ${p.ceo_years_in_role}`);

    if (profileParts.length > 0) {
      block += `\n\n## Perfil de la empresa\n${profileParts.join('\n').slice(0, MAX_PROFILE_CHARS)}`;
    }
  }

  // --- CEO Context Snapshot (conversational data from onboarding v2) ---
  if (ceoContextResult.data) {
    const ctx = ceoContextResult.data;
    const contextParts: string[] = [];

    if (ctx.block_1_vision) {
      const v = ctx.block_1_vision;
      if (v.company_in_5_years) contextParts.push(`Visión a 5 años: ${v.company_in_5_years}`);
      if (v.biggest_current_bet) contextParts.push(`Apuesta actual más grande: ${v.biggest_current_bet}`);
      if (v.biggest_fear) contextParts.push(`Mayor temor: ${v.biggest_fear}`);
      if (v.proudest_achievement) contextParts.push(`Mayor logro: ${v.proudest_achievement}`);
    }

    if (ctx.block_2_leadership) {
      const l = ctx.block_2_leadership;
      if (l.leadership_style) contextParts.push(`Estilo de liderazgo: ${l.leadership_style}`);
      if (l.hardest_decision_recently) contextParts.push(`Decisión más difícil reciente: ${l.hardest_decision_recently}`);
      if (l.decision_making_approach) contextParts.push(`Enfoque para decidir: ${l.decision_making_approach}`);
    }

    if (ctx.block_3_team) {
      const t = ctx.block_3_team;
      if (t.team_biggest_strength) contextParts.push(`Fortaleza del equipo: ${t.team_biggest_strength}`);
      if (t.team_biggest_gap) contextParts.push(`Brecha del equipo: ${t.team_biggest_gap}`);
      if (t.key_hire_next_12_months) contextParts.push(`Contratación clave: ${t.key_hire_next_12_months}`);
      if (t.culture_one_word) contextParts.push(`Cultura en una palabra: ${t.culture_one_word}`);
    }

    if (ctx.block_4_operations) {
      const o = ctx.block_4_operations;
      if (o.biggest_operational_bottleneck) contextParts.push(`Mayor cuello de botella: ${o.biggest_operational_bottleneck}`);
      if (o.process_most_wants_to_fix) contextParts.push(`Proceso que más quiere arreglar: ${o.process_most_wants_to_fix}`);
      if (o.delegation_struggle) contextParts.push(`Dificultad para delegar: ${o.delegation_struggle}`);
    }

    if (ctx.block_5_growth) {
      const g = ctx.block_5_growth;
      if (g.main_growth_lever) contextParts.push(`Palanca de crecimiento: ${g.main_growth_lever}`);
      if (g.biggest_competitive_advantage) contextParts.push(`Ventaja competitiva: ${g.biggest_competitive_advantage}`);
      if (g.customer_acquisition_challenge) contextParts.push(`Reto de adquisición de clientes: ${g.customer_acquisition_challenge}`);
    }

    if (ctx.block_6_finance) {
      const f = ctx.block_6_finance;
      if (f.cash_flow_comfort) contextParts.push(`Comodidad con flujo: ${f.cash_flow_comfort}`);
      if (f.biggest_financial_worry) contextParts.push(`Mayor preocupación financiera: ${f.biggest_financial_worry}`);
      if (f.investment_priority_next_year) contextParts.push(`Prioridad de inversión: ${f.investment_priority_next_year}`);
    }

    if (ctx.block_7_external) {
      const e = ctx.block_7_external;
      if (e.key_external_threat) contextParts.push(`Amenaza externa clave: ${e.key_external_threat}`);
      if (e.regulatory_concern) contextParts.push(`Preocupación regulatoria: ${e.regulatory_concern}`);
      if (e.industry_trend_impact) contextParts.push(`Tendencia de la industria: ${e.industry_trend_impact}`);
    }

    if (contextParts.length > 0) {
      block += `\n\n## Contexto del CEO\n${contextParts.join('\n').slice(0, MAX_CEO_CONTEXT_CHARS)}`;
    }
  }

  // --- Legacy context from user_config.company_context ---
  if (companyContext && companyContext.trim()) {
    block += `\n\n## Contexto adicional de la empresa\n${companyContext.slice(0, MAX_COMPANY_CONTEXT_CHARS)}`;
  }

  // --- Extracted document text ---
  if (documentTexts.length > 0) {
    let remaining = MAX_DOCUMENT_TEXT_CHARS;
    const snippets: string[] = [];

    for (const text of documentTexts) {
      if (remaining <= 0) break;
      const snippet = text.slice(0, remaining);
      snippets.push(snippet);
      remaining -= snippet.length;
    }

    if (snippets.length > 0) {
      block += `\n\n## Documentos de la empresa\n${snippets.join('\n---\n')}`;
    }
  }

  return block;
}

// ============================================================
// QUESTION ENRICHMENT
// ============================================================

function enrichQuestion(question: string, contextBlock: string): string {
  if (!contextBlock) return question;
  return `${question}\n\n---\nCONTEXTO DE LA EMPRESA DEL CEO:\n${contextBlock}`;
}

// ============================================================
// ARES MANAGER — CLASSIFICATION
// ============================================================

export async function classifyWithARES(
  question: string,
  contextBlock?: string
): Promise<ARESClassification> {
  const enriched = contextBlock ? enrichQuestion(question, contextBlock) : question;
  const response = await callClaudeCritical(ARES_MANAGER_PROMPT, enriched, MANAGER_MAX_TOKENS);

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Map primary_entity to entitiesInvolved — all 3 always deliberate
    const entitiesInvolved: EntityName[] = ['csuite', 'board', 'assembly'];

    return {
      level: parsed.level,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      complexity: parsed.complexity,
      entitiesInvolved,
    };
  } catch {
    return {
      level: 'BOARD_LEVEL',
      reasoning: 'No se pudo clasificar la pregunta con certeza, se asigna al nivel estratégico por precaución.',
      confidence: 0.5,
      complexity: 'medium',
      entitiesInvolved: ['csuite', 'board', 'assembly'],
    };
  }
}

// ============================================================
// VOTE PARSER
// ============================================================

function parseVote(response: string): PerspectiveVote {
  const lower = response.toLowerCase();

  // Look for explicit vote patterns
  const voteMatch = lower.match(/\*\*voto\*\*\s*:?\s*(.*?)(?:\n|$)/);
  if (voteMatch) {
    const voteText = voteMatch[1].trim();
    if (voteText.startsWith('a favor') || voteText.startsWith('a favor')) return 'for';
    if (voteText.startsWith('en contra')) return 'against';
    if (voteText.startsWith('condicional')) return 'conditional';
  }

  // Fallback heuristics
  if (lower.includes('**voto**: a favor') || lower.includes('**voto**: a favor')) return 'for';
  if (lower.includes('**voto**: en contra')) return 'against';
  if (lower.includes('**voto**: condicional')) return 'conditional';

  return null;
}

// ============================================================
// CONSENSUS CALCULATOR
// ============================================================

function calculateConsensus(perspectives: Perspective[]): number {
  const votes = perspectives.map(p => p.vote).filter(Boolean);
  if (votes.length === 0) return 50;

  // Count vote types
  const counts: Record<string, number> = {};
  for (const v of votes) {
    if (v) counts[v] = (counts[v] || 0) + 1;
  }

  // Find the most common vote
  const maxCount = Math.max(...Object.values(counts));
  const total = votes.length;

  // Consensus = percentage of majority vote
  return Math.round((maxCount / total) * 100);
}

// ============================================================
// ENTITY 1: C-SUITE DELIBERATION (9 executives + Atlas synthesis)
// ============================================================

// C-Suite member definitions
const CSUITE_MEMBERS = [
  { name: 'Patrick', role: 'CFO', title: 'Director de Finanzas', prompt: CSUITE_CFO_PATRICK_PROMPT },
  { name: 'Mauricio', role: 'COO', title: 'Director de Operaciones', prompt: CSUITE_COO_MAURICIO_PROMPT },
  { name: 'Alejandra', role: 'CMO', title: 'Directora de Marketing', prompt: CSUITE_CMO_ALEJANDRA_PROMPT },
  { name: 'Jay', role: 'CTO', title: 'Director de Tecnología', prompt: CSUITE_CTO_JAY_PROMPT },
  { name: 'Cathy', role: 'CHRO', title: 'Directora de Capital Humano', prompt: CSUITE_CHRO_CATHY_PROMPT },
  { name: 'Bret', role: 'CLO', title: 'Director Jurídico', prompt: CSUITE_CLO_BRET_PROMPT },
  { name: 'Roger', role: 'CSO', title: 'Director de Estrategia', prompt: CSUITE_CSO_ROGER_PROMPT },
  { name: 'Pablo', role: 'CCO', title: 'Director Comercial', prompt: CSUITE_CCO_PABLO_PROMPT },
  { name: 'JC', role: 'CDO', title: 'Director de Datos', prompt: CSUITE_CDO_JC_PROMPT },
] as const;

async function executeCSuiteDeliberation(
  _userId: string,
  question: string,
  contextBlock: string
): Promise<EntityDeliberation> {
  const enriched = enrichQuestion(question, contextBlock);

  // Step 1: Call all 9 C-Suite members in parallel
  const memberResponses = await Promise.all(
    CSUITE_MEMBERS.map(member =>
      callClaude(member.prompt, enriched, AGENT_MAX_TOKENS)
        .then(response => ({
          name: member.name,
          role: `${member.role} — ${member.title}`,
          response,
        }))
        .catch(err => ({
          name: member.name,
          role: `${member.role} — ${member.title}`,
          response: `[Error al consultar a ${member.name}: ${err instanceof Error ? err.message : 'error desconocido'}]`,
        }))
    )
  );

  // Build perspectives with vote parsing
  const perspectives: Perspective[] = memberResponses.map(mr => ({
    entity: 'csuite' as EntityName,
    name: mr.name,
    role: mr.role,
    response: mr.response,
    vote: parseVote(mr.response),
  }));

  // Step 2: Call Atlas to synthesize all 9 C-Suite responses
  const csuiteResponsesText = memberResponses
    .map(mr => `**${mr.name} (${mr.role}):**\n${mr.response}`)
    .join('\n\n');

  const atlasSynthesisPrompt = getAtlasSynthesisPrompt(csuiteResponsesText);

  let synthesis: string;
  try {
    synthesis = await callClaudeCritical(
      ATLAS_CEO_COPILOT_PROMPT,
      atlasSynthesisPrompt,
      SYNTHESIS_MAX_TOKENS
    );
  } catch (err) {
    synthesis = `[Error en síntesis de Atlas: ${err instanceof Error ? err.message : 'error desconocido'}]`;
  }

  return {
    entity_name: 'csuite',
    perspectives,
    synthesis,
    consensus_level: calculateConsensus(perspectives),
  };
}

// ============================================================
// ENTITY 2: BOARD OF DIRECTORS DELIBERATION (5 directors)
// ============================================================

const BOARD_MEMBERS = [
  { name: 'Victoria', role: 'Consejera Independiente — Gobierno Corporativo', prompt: BOARD_VICTORIA_PROMPT },
  { name: 'Santiago', role: 'Consejero Independiente — Experto Financiero', prompt: BOARD_SANTIAGO_PROMPT },
  { name: 'Carmen', role: 'Consejera Independiente — Riesgos y Cumplimiento', prompt: BOARD_CARMEN_PROMPT },
  { name: 'Fernando', role: 'Consejero Patrimonial — Accionistas Mayoritarios', prompt: BOARD_FERNANDO_PROMPT },
  { name: 'Gabriela', role: 'Consejera Patrimonial — Familia y Legado', prompt: BOARD_GABRIELA_PROMPT },
] as const;

async function executeBoardDeliberation(
  _userId: string,
  question: string,
  contextBlock: string
): Promise<EntityDeliberation> {
  const enriched = enrichQuestion(question, contextBlock);

  // Call all 5 Board members in parallel
  const memberResponses = await Promise.all(
    BOARD_MEMBERS.map(member =>
      callClaude(member.prompt, enriched, AGENT_MAX_TOKENS)
        .then(response => ({
          name: member.name,
          role: member.role,
          response,
        }))
        .catch(err => ({
          name: member.name,
          role: member.role,
          response: `[Error al consultar a ${member.name}: ${err instanceof Error ? err.message : 'error desconocido'}]`,
        }))
    )
  );

  // Build perspectives
  const perspectives: Perspective[] = memberResponses.map(mr => ({
    entity: 'board' as EntityName,
    name: mr.name,
    role: mr.role,
    response: mr.response,
    vote: parseVote(mr.response),
  }));

  // Synthesize board perspectives
  const boardResponsesText = memberResponses
    .map(mr => `**${mr.name} (${mr.role}):**\n${mr.response}`)
    .join('\n\n');

  let synthesis: string;
  try {
    synthesis = await callClaudeCritical(
      SYNTHESIZER_PROMPT,
      `Pregunta original: ${question}\n\nPerspectivas del Consejo de Administración:\n\n${boardResponsesText}`,
      SYNTHESIS_MAX_TOKENS
    );
  } catch (err) {
    synthesis = `[Error en síntesis del Consejo: ${err instanceof Error ? err.message : 'error desconocido'}]`;
  }

  return {
    entity_name: 'board',
    perspectives,
    synthesis,
    consensus_level: calculateConsensus(perspectives),
  };
}

// ============================================================
// ENTITY 3: SHAREHOLDER ASSEMBLY DELIBERATION (3 members)
// ============================================================

const ASSEMBLY_MEMBERS = [
  { name: 'Andrés', role: 'Accionista Fundador-Operador', prompt: ASSEMBLY_ANDRES_PROMPT },
  { name: 'Helena', role: 'Accionista Inversionista Racional', prompt: ASSEMBLY_HELENA_PROMPT },
  { name: 'Tomás', role: 'Accionista Familiar Pasivo', prompt: ASSEMBLY_TOMAS_PROMPT },
] as const;

async function executeAssemblyDeliberation(
  _userId: string,
  question: string,
  contextBlock: string
): Promise<EntityDeliberation> {
  const enriched = enrichQuestion(question, contextBlock);

  // Call all 3 Assembly members in parallel
  const memberResponses = await Promise.all(
    ASSEMBLY_MEMBERS.map(member =>
      callClaude(member.prompt, enriched, AGENT_MAX_TOKENS)
        .then(response => ({
          name: member.name,
          role: member.role,
          response,
        }))
        .catch(err => ({
          name: member.name,
          role: member.role,
          response: `[Error al consultar a ${member.name}: ${err instanceof Error ? err.message : 'error desconocido'}]`,
        }))
    )
  );

  // Build perspectives
  const perspectives: Perspective[] = memberResponses.map(mr => ({
    entity: 'assembly' as EntityName,
    name: mr.name,
    role: mr.role,
    response: mr.response,
    vote: parseVote(mr.response),
  }));

  // Synthesize assembly perspectives
  const assemblyResponsesText = memberResponses
    .map(mr => `**${mr.name} (${mr.role}):**\n${mr.response}`)
    .join('\n\n');

  let synthesis: string;
  try {
    synthesis = await callClaudeCritical(
      SYNTHESIZER_PROMPT,
      `Pregunta original: ${question}\n\nPerspectivas de la Asamblea de Accionistas:\n\n${assemblyResponsesText}`,
      SYNTHESIS_MAX_TOKENS
    );
  } catch (err) {
    synthesis = `[Error en síntesis de la Asamblea: ${err instanceof Error ? err.message : 'error desconocido'}]`;
  }

  return {
    entity_name: 'assembly',
    perspectives,
    synthesis,
    consensus_level: calculateConsensus(perspectives),
  };
}

// ============================================================
// C-SUITE ONLY DELIBERATION (for non-premium plans)
// ============================================================

async function executeCSuiteOnlyDeliberation(
  userId: string,
  question: string,
  contextBlock: string
): Promise<{
  entityDeliberations: EntityDeliberation[];
  allPerspectives: Perspective[];
  recommendation: string;
  tensions: TensionPoint[];
}> {
  // Only C-Suite deliberates
  const csuiteResult = await executeCSuiteDeliberation(userId, question, contextBlock);

  // Use Atlas synthesis as the final recommendation (no cross-entity synthesis needed)
  const recommendation = csuiteResult.synthesis;

  return {
    entityDeliberations: [csuiteResult],
    allPerspectives: csuiteResult.perspectives,
    recommendation,
    tensions: [],
  };
}

// ============================================================
// FULL 3-ENTITY DELIBERATION (premium plans)
// ============================================================

async function executeFullDeliberation(
  userId: string,
  question: string,
  contextBlock: string
): Promise<{
  entityDeliberations: EntityDeliberation[];
  allPerspectives: Perspective[];
  recommendation: string;
  tensions: TensionPoint[];
}> {
  // Step 1: Execute ALL 3 entity deliberations in parallel
  // This is the biggest performance win — all 17 agents + 3 syntheses run concurrently
  const [csuiteResult, boardResult, assemblyResult] = await Promise.all([
    executeCSuiteDeliberation(userId, question, contextBlock),
    executeBoardDeliberation(userId, question, contextBlock),
    executeAssemblyDeliberation(userId, question, contextBlock),
  ]);

  const entityDeliberations = [csuiteResult, boardResult, assemblyResult];

  // Flatten all perspectives across entities
  const allPerspectives: Perspective[] = [
    ...csuiteResult.perspectives,
    ...boardResult.perspectives,
    ...assemblyResult.perspectives,
  ];

  // Step 2: Build board and assembly perspective text for final synthesis
  const boardPerspectivesText = boardResult.perspectives
    .map(p => `**${p.name} (${p.role}):**\n${p.response}`)
    .join('\n\n');

  const assemblyPerspectivesText = assemblyResult.perspectives
    .map(p => `**${p.name} (${p.role}):**\n${p.response}`)
    .join('\n\n');

  // Step 3: Call ARES34 Final Synthesizer with all 3 entity results
  const aresSynthesisPrompt = getARESSynthesisPrompt(
    csuiteResult.synthesis,
    boardPerspectivesText,
    assemblyPerspectivesText,
    contextBlock || undefined
  );

  let recommendation: string;
  try {
    recommendation = await callClaudeCritical(
      aresSynthesisPrompt,
      `Pregunta original del CEO: ${question}`,
      4000
    );
  } catch (err) {
    // Fallback: concatenate the 3 entity syntheses
    recommendation = [
      '**Síntesis de la C-Suite (vía Atlas):**',
      csuiteResult.synthesis,
      '',
      '**Síntesis del Consejo:**',
      boardResult.synthesis,
      '',
      '**Síntesis de la Asamblea:**',
      assemblyResult.synthesis,
      '',
      `[Nota: hubo un error al generar la síntesis final integrada: ${err instanceof Error ? err.message : 'error desconocido'}]`,
    ].join('\n');
  }

  // Step 4: Detect tensions between entities
  const tensions = detectTensions(csuiteResult, boardResult, assemblyResult);

  return {
    entityDeliberations,
    allPerspectives,
    recommendation,
    tensions,
  };
}

// ============================================================
// TENSION DETECTION
// ============================================================

function detectTensions(
  csuite: EntityDeliberation,
  board: EntityDeliberation,
  assembly: EntityDeliberation
): TensionPoint[] {
  const tensions: TensionPoint[] = [];

  // Compare vote distributions between entities
  const csuiteVotes = getVoteSummary(csuite.perspectives);
  const boardVotes = getVoteSummary(board.perspectives);
  const assemblyVotes = getVoteSummary(assembly.perspectives);

  // C-Suite vs Board tension
  const csuiteBoardTension = detectVoteTension(csuiteVotes, boardVotes);
  if (csuiteBoardTension) {
    tensions.push({
      between_entities: ['csuite', 'board'],
      description: csuiteBoardTension,
      severity: calculateTensionSeverity(csuiteVotes, boardVotes),
    });
  }

  // C-Suite vs Assembly tension
  const csuiteAssemblyTension = detectVoteTension(csuiteVotes, assemblyVotes);
  if (csuiteAssemblyTension) {
    tensions.push({
      between_entities: ['csuite', 'assembly'],
      description: csuiteAssemblyTension,
      severity: calculateTensionSeverity(csuiteVotes, assemblyVotes),
    });
  }

  // Board vs Assembly tension
  const boardAssemblyTension = detectVoteTension(boardVotes, assemblyVotes);
  if (boardAssemblyTension) {
    tensions.push({
      between_entities: ['board', 'assembly'],
      description: boardAssemblyTension,
      severity: calculateTensionSeverity(boardVotes, assemblyVotes),
    });
  }

  return tensions;
}

interface VoteSummary {
  for: number;
  against: number;
  conditional: number;
  total: number;
  dominant: PerspectiveVote;
}

function getVoteSummary(perspectives: Perspective[]): VoteSummary {
  let forCount = 0;
  let againstCount = 0;
  let conditionalCount = 0;

  for (const p of perspectives) {
    if (p.vote === 'for') forCount++;
    else if (p.vote === 'against') againstCount++;
    else if (p.vote === 'conditional') conditionalCount++;
  }

  const total = forCount + againstCount + conditionalCount;

  let dominant: PerspectiveVote = null;
  if (forCount >= againstCount && forCount >= conditionalCount) dominant = 'for';
  else if (againstCount > forCount && againstCount >= conditionalCount) dominant = 'against';
  else if (conditionalCount > forCount && conditionalCount > againstCount) dominant = 'conditional';

  return { for: forCount, against: againstCount, conditional: conditionalCount, total, dominant };
}

function detectVoteTension(a: VoteSummary, b: VoteSummary): string | null {
  if (a.total === 0 || b.total === 0) return null;

  // Clear opposition: one entity mostly for, other mostly against
  const aForRatio = a.for / a.total;
  const bForRatio = b.for / b.total;
  const aAgainstRatio = a.against / a.total;
  const bAgainstRatio = b.against / b.total;

  if (aForRatio > 0.5 && bAgainstRatio > 0.5) {
    return 'Una entidad vota mayoritariamente a favor mientras la otra vota en contra';
  }
  if (aAgainstRatio > 0.5 && bForRatio > 0.5) {
    return 'Una entidad vota mayoritariamente en contra mientras la otra vota a favor';
  }

  // One is decisive, other is conditional
  if ((aForRatio > 0.5 || aAgainstRatio > 0.5) && b.conditional / b.total > 0.5) {
    return 'Una entidad tiene posición clara mientras la otra pide condiciones';
  }
  if ((bForRatio > 0.5 || bAgainstRatio > 0.5) && a.conditional / a.total > 0.5) {
    return 'Una entidad tiene posición clara mientras la otra pide condiciones';
  }

  return null;
}

function calculateTensionSeverity(a: VoteSummary, b: VoteSummary): 'low' | 'medium' | 'high' {
  if (a.total === 0 || b.total === 0) return 'low';

  const aForRatio = a.for / a.total;
  const bAgainstRatio = b.against / b.total;
  const aAgainstRatio = a.against / a.total;
  const bForRatio = b.for / b.total;

  // Direct opposition with strong majorities
  if ((aForRatio > 0.7 && bAgainstRatio > 0.7) || (aAgainstRatio > 0.7 && bForRatio > 0.7)) {
    return 'high';
  }
  if ((aForRatio > 0.5 && bAgainstRatio > 0.5) || (aAgainstRatio > 0.5 && bForRatio > 0.5)) {
    return 'medium';
  }

  return 'low';
}

// ============================================================
// DATABASE PERSISTENCE
// ============================================================

async function saveEntityDeliberations(
  conversationId: string,
  entityDeliberations: EntityDeliberation[]
): Promise<void> {
  const supabase = createAdminClient();

  // Save each entity deliberation to the entity_deliberations table
  const inserts = entityDeliberations.map(ed => ({
    conversation_id: conversationId,
    entity: ed.entity_name,
    perspectives: ed.perspectives,
    synthesis: ed.synthesis,
    tensions: [],
  }));

  const { error } = await supabase
    .from('entity_deliberations')
    .insert(inserts);

  if (error) {
    // Table might not exist yet (migration not run) — log but don't fail
    console.error('Error al guardar entity_deliberations (puede no existir la tabla):', error.message);
  }
}

async function saveConversationWithEntities(
  userId: string,
  question: string,
  classification: ARESClassification,
  entitiesConsulted: EntityName[]
): Promise<string> {
  const supabase = createAdminClient();

  // Try saving with entities_consulted column first
  const insertData: Record<string, unknown> = {
    user_id: userId,
    question,
    route_level: classification.level,
    route_reasoning: classification.reasoning,
    route_confidence: classification.confidence,
    route_complexity: classification.complexity,
  };

  // Try with entities_consulted — if column doesn't exist, fall back
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      ...insertData,
      entities_consulted: entitiesConsulted,
    })
    .select('id')
    .single();

  if (error) {
    // Might fail if entities_consulted column doesn't exist yet — fall back to legacy save
    const conversationId = await saveConversation(userId, question, classification);
    return conversationId;
  }

  return data.id;
}

// ============================================================
// MAIN ENGINE ENTRY POINT
// ============================================================

export async function processARESRequest(
  userId: string,
  question: string,
  plan: string
): Promise<ARESResponse> {
  // Step 0: Build company context block (once, reused across all agents)
  const contextBlock = await buildCompanyContextBlock(userId);

  // Step 1: Classify the question (with context for better routing)
  const classification = await classifyWithARES(question, contextBlock);

  // Determine which entities to consult based on plan
  const isFullAccess = plan === 'fundador' || plan === 'empresarial';
  const entitiesConsulted: EntityName[] = isFullAccess
    ? ['csuite', 'board', 'assembly']
    : ['csuite'];

  // Step 2: Save the conversation
  const conversationId = await saveConversationWithEntities(
    userId,
    question,
    classification,
    entitiesConsulted
  );

  // Step 3: Execute deliberation based on plan
  let result: {
    entityDeliberations: EntityDeliberation[];
    allPerspectives: Perspective[];
    recommendation: string;
    tensions: TensionPoint[];
  };

  if (isFullAccess) {
    // Full 3-entity deliberation (C-Suite + Board + Assembly in parallel)
    result = await executeFullDeliberation(userId, question, contextBlock);
  } else {
    // C-Suite only for non-premium plans
    result = await executeCSuiteOnlyDeliberation(userId, question, contextBlock);
  }

  // Step 4: Save deliberations

  // 4a: Save entity_deliberations (new table, v2)
  await saveEntityDeliberations(conversationId, result.entityDeliberations);

  // 4b: Save to legacy deliberations table (backward compat)
  try {
    await saveDeliberation(conversationId, result.allPerspectives, result.recommendation);

    // Mark as entity format in legacy table
    const supabase = createAdminClient();
    await supabase
      .from('deliberations')
      .update({ entity_deliberations_format: true })
      .eq('conversation_id', conversationId);
  } catch (err) {
    console.error('Error al guardar deliberación legacy:', err);
  }

  // Step 5: Build and return the complete response
  let recommendation = result.recommendation;

  // Add upgrade note for non-premium plans
  if (!isFullAccess) {
    recommendation += '\n\n---\n' +
      'Tu pregunta fue analizada por los 9 directores de tu C-Suite. ' +
      'Con el plan Fundador, recibirías además la deliberación del Consejo de Administración (5 consejeros) ' +
      'y la Asamblea de Accionistas (3 accionistas), con una síntesis integrada de las 3 entidades.';
  }

  return {
    conversationId,
    level: classification.level,
    entitiesConsulted,
    entityDeliberations: result.entityDeliberations,
    perspectives: result.allPerspectives,
    recommendation,
    classification,
    tensions: result.tensions,
    plan,
  };
}

// ============================================================
// FORMAT HELPERS
// ============================================================

function formatRange(range: string): string {
  const map: Record<string, string> = {
    '1_10': '1-10',
    '11_50': '11-50',
    '51_200': '51-200',
    '201_500': '201-500',
    '501_1000': '501-1,000',
    'mas_1000': 'Más de 1,000',
  };
  return map[range] || range;
}

function formatSocietyType(type: string): string {
  const map: Record<string, string> = {
    'SA': 'S.A.',
    'SA_de_CV': 'S.A. de C.V.',
    'SAPI': 'S.A.P.I.',
    'SAPI_de_CV': 'S.A.P.I. de C.V.',
    'SRL': 'S. de R.L.',
    'SC': 'S.C.',
    'SAS': 'S.A.S.',
    'AC': 'A.C.',
    'persona_fisica': 'Persona Física',
    'otra': 'Otra',
  };
  return map[type] || type;
}

function formatRevenueRange(range: string): string {
  const map: Record<string, string> = {
    'menos_5M': 'Menos de $5M MXN',
    '5M_20M': '$5M - $20M MXN',
    '20M_50M': '$20M - $50M MXN',
    '50M_100M': '$50M - $100M MXN',
    '100M_500M': '$100M - $500M MXN',
    'mas_500M': 'Más de $500M MXN',
  };
  return map[range] || range;
}

function formatRevenueTrend(trend: string): string {
  const map: Record<string, string> = {
    'crecimiento_acelerado': 'Crecimiento acelerado',
    'crecimiento_estable': 'Crecimiento estable',
    'estancado': 'Estancado',
    'decreciendo': 'Decreciendo',
  };
  return map[trend] || trend;
}

function formatDebtRange(range: string | null): string {
  if (!range) return 'Sí';
  const map: Record<string, string> = {
    'sin_deuda': 'Sin deuda',
    'menor_10pct_revenue': 'Menor al 10% de ingresos',
    '10_30pct_revenue': '10-30% de ingresos',
    '30_50pct_revenue': '30-50% de ingresos',
    'mayor_50pct_revenue': 'Mayor al 50% de ingresos',
  };
  return map[range] || range;
}

function formatMarketPosition(position: string): string {
  const map: Record<string, string> = {
    'lider': 'Líder',
    'top3': 'Top 3',
    'retador': 'Retador',
    'nicho': 'Nicho',
    'emergente': 'Emergente',
  };
  return map[position] || position;
}
