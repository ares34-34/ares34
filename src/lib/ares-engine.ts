import { callClaude, callClaudeCritical } from './anthropic';
import {
  ARES_MANAGER_PROMPT,
  BOARD_CFO_PROMPT,
  BOARD_CMO_PROMPT,
  BOARD_CLO_PROMPT,
  BOARD_CHRO_PROMPT,
  ASSEMBLY_VC_PROMPT,
  ASSEMBLY_LP_PROMPT,
  ASSEMBLY_FO_PROMPT,
  SYNTHESIZER_PROMPT,
  PROMPT_MAP,
  getCEOAgentPrompt,
  getCEORecommendationPrompt,
} from './prompts';
import {
  getUserConfig,
  saveConversation,
  saveDeliberation,
  getArchetypeById,
  getCompanyContext,
} from './supabase';
import type {
  ARESClassification,
  ARESResponse,
  Perspective,
} from './types';

// --- Company Context Injection ---
const MAX_COMPANY_CONTEXT_CHARS = 2000;
const MAX_DOCUMENT_TEXT_CHARS = 8000;

async function buildCompanyContextBlock(userId: string): Promise<string> {
  const { companyContext, documentTexts } = await getCompanyContext(userId);

  let block = '';

  if (companyContext && companyContext.trim()) {
    block += `\n\n## Contexto de la empresa\n${companyContext.slice(0, MAX_COMPANY_CONTEXT_CHARS)}`;
  }

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

function enrichQuestion(question: string, contextBlock: string): string {
  if (!contextBlock) return question;
  return `${question}\n\n---\nCONTEXTO DE LA EMPRESA DEL CEO:\n${contextBlock}`;
}

export async function classifyWithARES(question: string, contextBlock?: string): Promise<ARESClassification> {
  const enriched = contextBlock ? enrichQuestion(question, contextBlock) : question;
  const response = await callClaudeCritical(ARES_MANAGER_PROMPT, enriched, 1024);

  try {
    // Clean response - remove potential markdown fences
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      level: parsed.level,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      complexity: parsed.complexity,
    };
  } catch {
    // Default classification if parsing fails
    return {
      level: 'BOARD_LEVEL',
      reasoning: 'No se pudo clasificar la pregunta con certeza, se asigna al nivel estratégico por precaución.',
      confidence: 0.5,
      complexity: 'medium',
    };
  }
}

async function executeBoardDeliberation(
  userId: string,
  question: string,
  _plan: string,
  contextBlock: string
): Promise<{ perspectives: Perspective[]; recommendation: string }> {
  const config = await getUserConfig(userId);
  const enriched = enrichQuestion(question, contextBlock);

  // Get custom archetype prompt
  let customArchetypePrompt = '';
  let customArchetypeName = 'Consejero extra';

  if (config?.custom_board_archetype_id) {
    const archetype = await getArchetypeById(config.custom_board_archetype_id);
    if (archetype) {
      customArchetypePrompt = PROMPT_MAP[archetype.prompt_key] || '';
      customArchetypeName = archetype.name;
    }
  }

  // Execute 5 agents in parallel
  const [cfoResponse, cmoResponse, cloResponse, chroResponse, customResponse] = await Promise.all([
    callClaude(BOARD_CFO_PROMPT, enriched, 2048),
    callClaude(BOARD_CMO_PROMPT, enriched, 2048),
    callClaude(BOARD_CLO_PROMPT, enriched, 2048),
    callClaude(BOARD_CHRO_PROMPT, enriched, 2048),
    customArchetypePrompt
      ? callClaude(customArchetypePrompt, enriched, 2048)
      : Promise.resolve('No se ha configurado un consejero extra.'),
  ]);

  const perspectives: Perspective[] = [
    { role: 'Finanzas', name: 'Asesor Financiero', response: cfoResponse },
    { role: 'Marketing', name: 'Asesor de Marketing', response: cmoResponse },
    { role: 'Legal', name: 'Asesor Legal', response: cloResponse },
    { role: 'Equipo', name: 'Asesor de Talento', response: chroResponse },
    { role: 'Especial', name: customArchetypeName, response: customResponse },
  ];

  // Synthesize recommendation (critical path — uses Claude)
  const synthesisInput = perspectives
    .map(p => `**${p.name} (${p.role}):**\n${p.response}`)
    .join('\n\n');

  const recommendation = await callClaudeCritical(
    SYNTHESIZER_PROMPT,
    `Pregunta original: ${question}\n\nPerspectivas del Consejo:\n\n${synthesisInput}`,
    3000
  );

  return { perspectives, recommendation };
}

async function executeAssemblyDeliberation(
  _userId: string,
  question: string,
  _plan: string,
  contextBlock: string
): Promise<{ perspectives: Perspective[]; recommendation: string }> {
  const enriched = enrichQuestion(question, contextBlock);

  // Execute 3 agents in parallel
  const [vcResponse, lpResponse, foResponse] = await Promise.all([
    callClaude(ASSEMBLY_VC_PROMPT, enriched, 2048),
    callClaude(ASSEMBLY_LP_PROMPT, enriched, 2048),
    callClaude(ASSEMBLY_FO_PROMPT, enriched, 2048),
  ]);

  const perspectives: Perspective[] = [
    { role: 'Crecimiento', name: 'Asesor de Inversión', response: vcResponse },
    { role: 'Protección', name: 'Asesor Patrimonial', response: lpResponse },
    { role: 'Legado', name: 'Asesor de Legado', response: foResponse },
  ];

  // Synthesize recommendation (critical path — uses Claude)
  const synthesisInput = perspectives
    .map(p => `**${p.name} (${p.role}):**\n${p.response}`)
    .join('\n\n');

  const recommendation = await callClaudeCritical(
    SYNTHESIZER_PROMPT,
    `Pregunta original: ${question}\n\nPerspectivas de la Asamblea:\n\n${synthesisInput}`,
    3000
  );

  return { perspectives, recommendation };
}

async function executeCEODecision(
  userId: string,
  question: string,
  _plan: string,
  contextBlock: string
): Promise<{ perspectives: Perspective[]; recommendation: string }> {
  const config = await getUserConfig(userId);
  const enriched = enrichQuestion(question, contextBlock);

  const businessIdentity = config?.ceo_kpi_1 || 'No definido';
  const kpis = config?.ceo_kpi_2 || 'No definido';
  const ceoMindset = config?.ceo_kpi_3 || 'No definido';
  const inspiration = config?.ceo_inspiration || 'No definida';
  const strategicContext = config?.ceo_main_goal || 'No definida';

  // Step 1: Get the CEO advisor's analysis (perspective)
  const ceoPrompt = getCEOAgentPrompt(
    businessIdentity, kpis, ceoMindset, inspiration, strategicContext
  );
  const analysisResponse = await callClaude(ceoPrompt, enriched, 2048);

  // Step 2: Generate a separate recommendation based on the analysis (critical path — uses Claude)
  const recPrompt = getCEORecommendationPrompt(
    businessIdentity, inspiration, strategicContext
  );
  const recommendation = await callClaudeCritical(
    recPrompt,
    `Pregunta del CEO: ${question}\n\nAnálisis de tu asesor personal:\n${analysisResponse}`,
    2048
  );

  return {
    perspectives: [
      { role: 'Asesor', name: 'Tu asesor personal', response: analysisResponse },
    ],
    recommendation,
  };
}

export async function processARESRequest(
  userId: string,
  question: string,
  plan: string
): Promise<ARESResponse> {
  // Step 0: Build company context block (once, reused across all agents)
  const contextBlock = await buildCompanyContextBlock(userId);

  // Step 1: Classify the question (with context for better routing)
  const classification = await classifyWithARES(question, contextBlock);

  // Step 2: Save the conversation
  const conversationId = await saveConversation(userId, question, classification);

  // Step 3: Execute the appropriate deliberation based on level
  // Gate: Board y Assembly solo disponibles para plan "empresarial" o "fundador"
  let result: { perspectives: Perspective[]; recommendation: string };
  let effectiveLevel = classification.level;

  if (plan !== 'empresarial' && plan !== 'fundador' && (classification.level === 'BOARD_LEVEL' || classification.level === 'ASSEMBLY_LEVEL')) {
    // Downgrade a CEO_LEVEL para planes sin acceso completo
    effectiveLevel = 'CEO_LEVEL';
  }

  switch (effectiveLevel) {
    case 'BOARD_LEVEL':
      result = await executeBoardDeliberation(userId, question, plan, contextBlock);
      break;
    case 'ASSEMBLY_LEVEL':
      result = await executeAssemblyDeliberation(userId, question, plan, contextBlock);
      break;
    case 'CEO_LEVEL':
    default:
      result = await executeCEODecision(userId, question, plan, contextBlock);
      break;
  }

  // Step 4: Save the deliberation
  await saveDeliberation(conversationId, result.perspectives, result.recommendation);

  // Step 5: Return the complete response
  // Si se hizo downgrade, agregar nota al usuario
  let recommendation = result.recommendation;
  if (effectiveLevel !== classification.level) {
    recommendation += '\n\n---\n💡 Tu pregunta fue clasificada como nivel ' +
      (classification.level === 'BOARD_LEVEL' ? 'Estratégico (Consejo)' : 'Capital (Asamblea)') +
      '. Con el plan Fundador, recibirías la deliberación completa de ' +
      (classification.level === 'BOARD_LEVEL' ? '5 asesores especializados' : '3 inversionistas expertos') +
      ' para este tipo de decisiones.';
  }

  return {
    conversationId,
    level: effectiveLevel,
    perspectives: result.perspectives,
    recommendation,
    classification,
    plan,
  };
}
