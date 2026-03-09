// ARES34 - System interfaces
// 18-profile, 3-entity deliberation architecture

// ============================================================
// ROUTE LEVELS & ENTITY TYPES
// ============================================================

// RouteLevel now maps to entities: CEO_LEVEL -> C-Suite, BOARD_LEVEL -> Board, ASSEMBLY_LEVEL -> Assembly
export type RouteLevel = 'CEO_LEVEL' | 'BOARD_LEVEL' | 'ASSEMBLY_LEVEL';

// The three deliberation entities
export type EntityName = 'csuite' | 'board' | 'assembly';

// ============================================================
// FIXED PROFILES - C-SUITE (9 executives + Atlas)
// ============================================================

export type CSuiteRole =
  | 'CFO'
  | 'COO'
  | 'CMO'
  | 'CTO'
  | 'CHRO'
  | 'CLO'
  | 'CSO'
  | 'CCO'
  | 'CDO';

export type CSuiteMemberName =
  | 'Patrick'
  | 'Mauricio'
  | 'Alejandra'
  | 'Jay'
  | 'Cathy'
  | 'Bret'
  | 'Roger'
  | 'Pablo'
  | 'JC';

export interface CSuiteMember {
  name: CSuiteMemberName;
  role: CSuiteRole;
  title: string; // e.g. "Chief Financial Officer"
  promptKey: string; // key into prompts.ts
}

// Atlas is the CEO copilot who synthesizes C-Suite perspectives
export interface AtlasProfile {
  name: 'Atlas';
  role: 'CEO_COPILOT';
  title: string;
  promptKey: string;
}

// ============================================================
// FIXED PROFILES - BOARD OF DIRECTORS (5 members)
// ============================================================

export type BoardMemberName =
  | 'Victoria'
  | 'Santiago'
  | 'Carmen'
  | 'Fernando'
  | 'Gabriela';

export interface BoardMember {
  name: BoardMemberName;
  role: string; // e.g. "Consejera Independiente - Estrategia"
  expertise: string;
  promptKey: string;
}

// ============================================================
// FIXED PROFILES - SHAREHOLDER ASSEMBLY (3 members)
// ============================================================

export type AssemblyMemberName =
  | 'Andres'
  | 'Helena'
  | 'Tomas';

export type AssemblyArchetype =
  | 'fundador-operador'
  | 'inversionista-racional'
  | 'familiar-pasivo';

export interface AssemblyMember {
  name: AssemblyMemberName;
  archetype: AssemblyArchetype;
  role: string; // e.g. "Socio fundador y operador"
  promptKey: string;
}

// ============================================================
// ARES CLASSIFICATION (updated)
// ============================================================

export interface ARESClassification {
  level: RouteLevel;
  reasoning: string;
  confidence: number;
  complexity: string;
  // Which entities should deliberate for this question
  entitiesInvolved: EntityName[];
}

// ============================================================
// COMPANY PROFILE - ENTERPRISE ONBOARDING (50 factual questions)
// ============================================================

export type SocietyType =
  | 'SA'
  | 'SA_de_CV'
  | 'SAPI'
  | 'SAPI_de_CV'
  | 'SRL'
  | 'SC'
  | 'SAS'
  | 'AC'
  | 'persona_fisica'
  | 'otra';

export type RevenueRange =
  | 'menos_5M'
  | '5M_20M'
  | '20M_50M'
  | '50M_100M'
  | '100M_500M'
  | 'mas_500M';

export type RevenueTrend =
  | 'crecimiento_acelerado'
  | 'crecimiento_estable'
  | 'estancado'
  | 'decreciendo';

export type DebtRange =
  | 'sin_deuda'
  | 'menor_10pct_revenue'
  | '10_30pct_revenue'
  | '30_50pct_revenue'
  | 'mayor_50pct_revenue';

export type ClientType = 'B2B' | 'B2C' | 'B2G' | 'mixed';

export type ActiveClientCountRange =
  | 'menos_10'
  | '10_50'
  | '50_200'
  | '200_1000'
  | 'mas_1000';

export type MarketPosition =
  | 'lider'
  | 'top3'
  | 'retador'
  | 'nicho'
  | 'emergente';

export type DigitalizationLevel =
  | 'basico'
  | 'intermedio'
  | 'avanzado'
  | 'transformacion_digital';

export type EmployeeRange =
  | '1_10'
  | '11_50'
  | '51_200'
  | '201_500'
  | '501_1000'
  | 'mas_1000';

export type CompetitorCountRange =
  | 'menos_5'
  | '5_20'
  | '20_50'
  | 'mas_50';

export type CEOGeneration =
  | 'first'
  | 'succession';

export interface CompanyProfile {
  id: string;
  user_id: string;

  // --- Block 1: Identity & Structure ---
  legal_name: string;
  founding_year: number | null;
  sector: string;
  specific_activity: string;
  employee_range: EmployeeRange | null;
  main_office_location: string;
  multi_location: boolean;
  society_type: SocietyType | null;

  // --- Block 2: Governance ---
  has_formal_board: boolean;
  board_member_count: number | null;
  ceo_is_shareholder: boolean;
  ceo_shareholder_pct: number | null;
  ceo_is_board_president: boolean;
  shareholder_count: number | null;
  shareholders_in_operations: boolean;
  has_regular_assembly: boolean;
  family_in_leadership: boolean;
  has_family_protocol: boolean;

  // --- Block 3: Organizational Structure ---
  direct_reports_count: number | null;
  functional_areas_reporting: string[];
  has_coo: boolean;
  has_cfo: boolean;
  avg_leadership_tenure: string | null; // e.g. "3 years", "menos de 1 year"
  ceo_leads_functional_area: boolean;

  // --- Block 4: Financials ---
  revenue_range: RevenueRange | null;
  revenue_trend: RevenueTrend | null;
  is_profitable: boolean;
  has_significant_debt: boolean;
  debt_range: DebtRange | null;
  main_revenue_source: string | null;
  main_revenue_pct: number | null;
  single_client_dependency: boolean;
  dependency_pct: number | null;
  has_external_investors: boolean;
  seeking_financing: boolean;

  // --- Block 5: Market & Clients ---
  client_type: ClientType | null;
  active_client_count_range: ActiveClientCountRange | null;
  operates_in_regulated_market: boolean;
  regulated_market_detail: string | null;
  competitor_count_range: CompetitorCountRange | null;
  market_position: MarketPosition | null;
  exports_internationally: boolean;
  international_pct: number | null;
  considering_new_markets: boolean;

  // --- Block 6: Technology & Operations ---
  has_manufacturing: boolean;
  digitalization_level: DigitalizationLevel | null;
  uses_integrated_systems: boolean;
  integrated_systems_detail: string | null;
  has_internal_it: boolean;
  it_team_size: number | null;
  uses_ai: boolean;
  ai_detail: string | null;

  // --- Block 7: CEO Profile ---
  ceo_years_in_role: number | null;
  ceo_is_founder: boolean;
  ceo_generation: CEOGeneration | null;
  ceo_simultaneous_roles: string[];
  ceo_education: string | null;
  ceo_prior_experience: string | null;
  ceo_on_other_boards: boolean;

  // --- Metadata ---
  created_at: string;
  updated_at: string;
}

// ============================================================
// CEO CONTEXT SNAPSHOT - CONVERSATIONAL ONBOARDING (28 questions)
// ============================================================

// Each block is a JSONB column storing question-answer pairs
export interface CEOContextBlock1Vision {
  company_in_5_years: string;
  biggest_current_bet: string;
  biggest_fear: string;
  proudest_achievement: string;
}

export interface CEOContextBlock2Leadership {
  leadership_style: string;
  hardest_decision_recently: string;
  decision_making_approach: string;
  conflict_resolution_style: string;
}

export interface CEOContextBlock3Team {
  team_biggest_strength: string;
  team_biggest_gap: string;
  key_hire_next_12_months: string;
  culture_one_word: string;
}

export interface CEOContextBlock4Operations {
  biggest_operational_bottleneck: string;
  process_most_wants_to_fix: string;
  most_time_consuming_task: string;
  delegation_struggle: string;
}

export interface CEOContextBlock5Growth {
  main_growth_lever: string;
  biggest_competitive_advantage: string;
  customer_acquisition_challenge: string;
  pricing_confidence: string;
}

export interface CEOContextBlock6Finance {
  cash_flow_comfort: string;
  biggest_financial_worry: string;
  investment_priority_next_year: string;
  financial_metric_watches_most: string;
}

export interface CEOContextBlock7External {
  key_external_threat: string;
  regulatory_concern: string;
  industry_trend_impact: string;
  relationship_with_board_or_partners: string;
}

export interface CEOContextSnapshot {
  id: string;
  user_id: string;
  block_1_vision: CEOContextBlock1Vision | null;
  block_2_leadership: CEOContextBlock2Leadership | null;
  block_3_team: CEOContextBlock3Team | null;
  block_4_operations: CEOContextBlock4Operations | null;
  block_5_growth: CEOContextBlock5Growth | null;
  block_6_finance: CEOContextBlock6Finance | null;
  block_7_external: CEOContextBlock7External | null;
  completed_blocks: number; // 0-7
  created_at: string;
  updated_at: string;
}

// ============================================================
// ONBOARDING STATE
// ============================================================

export type OnboardingPhase =
  | 'company_profile'
  | 'ceo_context'
  | 'review'
  | 'completed';

export interface OnboardingProgress {
  user_id: string;
  phase: OnboardingPhase;
  company_profile_completed: boolean;
  ceo_context_completed: boolean;
  // Track which factual question blocks are done (1-7 for company profile)
  company_profile_block: number; // 0-7
  // Track which conversational blocks are done (1-7 for CEO context)
  ceo_context_block: number; // 0-7
}

// ============================================================
// USER CONFIG (updated - no more archetypes)
// ============================================================

export interface UserConfig {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_v2_completed: boolean;
  company_profile_id: string | null;
  ceo_context_id: string | null;
  // Legacy fields retained for migration compatibility
  company_context: string | null;
  // Legacy v1 fields (may not exist on v2 configs)
  ceo_kpi_1?: string | null;
  ceo_kpi_2?: string | null;
  ceo_kpi_3?: string | null;
  ceo_inspiration?: string | null;
  ceo_main_goal?: string | null;
  custom_board_archetype_id?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PERSPECTIVES & ENTITY DELIBERATION
// ============================================================

export type PerspectiveVote = 'for' | 'against' | 'conditional' | null;

export interface Perspective {
  entity: EntityName;
  name: string;
  role: string;
  response: string;
  vote: PerspectiveVote;
}

export interface EntityDeliberation {
  entity_name: EntityName;
  perspectives: Perspective[];
  synthesis: string;
  consensus_level: number; // 0-100, how aligned the entity members are
}

// ============================================================
// DELIBERATION (updated for 3-entity system)
// ============================================================

export interface Deliberation {
  id: string;
  conversation_id: string;
  entity_deliberations: EntityDeliberation[];
  perspectives: Perspective[]; // Flat array of all perspectives across entities
  recommendation: string; // ARES final synthesis across all entities
  tensions_detected: TensionPoint[];
  created_at: string;
}

export interface TensionPoint {
  between_entities: [EntityName, EntityName];
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// ============================================================
// CONVERSATION (updated)
// ============================================================

export interface Conversation {
  id: string;
  user_id: string;
  question: string;
  route_level: RouteLevel;
  route_reasoning: string;
  route_confidence: number;
  route_complexity: string;
  entities_consulted: EntityName[];
  created_at: string;
  deliberation?: Deliberation;
  decision_log?: DecisionLog;
}

// ============================================================
// ARES RESPONSE (updated for multi-entity)
// ============================================================

export interface ARESResponse {
  conversationId: string;
  level: RouteLevel;
  entitiesConsulted: EntityName[];
  entityDeliberations: EntityDeliberation[];
  perspectives: Perspective[];
  recommendation: string;
  classification: ARESClassification;
  tensions: TensionPoint[];
  plan: string;
}

// ============================================================
// DECISION TRACKING
// ============================================================

export interface EntityPosition {
  entity: EntityName;
  stance: string;
  confidence: number; // 0-100
  key_argument: string;
}

export interface DecisionLog {
  id: string;
  conversation_id: string;
  entity_positions: EntityPosition[];
  tensions_detected: TensionPoint[];
  final_synthesis: string;
  ceo_reaction: string | null;
  real_world_outcome: string | null;
  outcome_recorded_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// ENTITY WEIGHTING MATRIX
// ============================================================

export interface EntityWeight {
  entity: EntityName;
  weight: number; // 0-100, relative influence
}

export interface MemberWeight {
  entity: EntityName;
  name: string;
  role: string;
  weight: number; // 0-100, relative influence within entity
}

export interface EntityWeightingMatrix {
  id: string;
  user_id: string;
  // Entity-level weights (how much each entity influences final synthesis)
  entity_weights: EntityWeight[];
  // Individual member weights within each entity
  member_weights: MemberWeight[];
  // Versioning for evolution tracking
  version: number;
  reason_for_change: string | null;
  created_at: string;
}

// ============================================================
// COMPANY DOCUMENTS (preserved)
// ============================================================

export interface CompanyDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  storage_path: string;
  extracted_text: string | null;
  char_count: number;
  status: 'processing' | 'ready' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SUBSCRIPTION (preserved from existing system)
// ============================================================

export interface SubscriptionStatus {
  plan: 'fundador' | 'empresarial' | null;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | null;
  queries_used: number;
  queries_limit: number | null; // null = unlimited
  current_period_end: string | null;
}

// ============================================================
// API REQUEST / RESPONSE HELPERS
// ============================================================

export interface ARESRequest {
  question: string;
  userId: string;
  plan: string;
}

export interface APIErrorResponse {
  error: string;
  code?: string;
}

// ============================================================
// PROMPT SYSTEM HELPERS
// ============================================================

// Keys for the 18 fixed profile prompts + manager + synthesizer
export type PromptKey =
  // C-Suite (9)
  | 'csuite_cfo_patrick'
  | 'csuite_coo_mauricio'
  | 'csuite_cmo_alejandra'
  | 'csuite_cto_jay'
  | 'csuite_chro_cathy'
  | 'csuite_clo_bret'
  | 'csuite_cso_roger'
  | 'csuite_cco_pablo'
  | 'csuite_cdo_jc'
  // Atlas (CEO Copilot)
  | 'atlas_ceo_copilot'
  // Board of Directors (5)
  | 'board_victoria'
  | 'board_santiago'
  | 'board_carmen'
  | 'board_fernando'
  | 'board_gabriela'
  // Assembly (3)
  | 'assembly_andres'
  | 'assembly_helena'
  | 'assembly_tomas'
  // System agents
  | 'ares_manager'
  | 'ares_synthesizer';

export interface ProfileDefinition {
  name: string;
  role: string;
  entity: EntityName | 'system';
  promptKey: PromptKey;
  description: string;
}

// ============================================================
// STREAMING / UI STATE HELPERS
// ============================================================

export type DeliberationPhase =
  | 'classifying'
  | 'csuite_deliberating'
  | 'atlas_synthesizing'
  | 'board_deliberating'
  | 'assembly_deliberating'
  | 'final_synthesis'
  | 'complete'
  | 'error';

export interface DeliberationProgress {
  phase: DeliberationPhase;
  entitiesCompleted: EntityName[];
  currentEntity: EntityName | null;
  membersResponded: number;
  membersTotal: number;
  elapsedMs: number;
}

// ============================================================
// ARES MODULES — Extended Features
// ============================================================

// --- ARES Brief (Daily CEO Briefing) ---

export interface DailyBrief {
  id: string;
  user_id: string;
  date: string;
  summary: string; // Full AI-generated briefing
  kpis_highlight: string;
  pending_decisions: string;
  alerts: string;
  created_at: string;
}

export interface BriefRequest {
  userId: string;
  date?: string; // defaults to today
}

export interface BriefResponse {
  brief: string;
  date: string;
  sections: {
    greeting: string;
    kpis: string;
    pending_decisions: string;
    alerts: string;
    priorities: string;
    market_context: string;
  };
}

// --- ARES Scenarios (What-If Engine) ---

export type ScenarioCategory =
  | 'expansion'
  | 'financial'
  | 'hiring'
  | 'product'
  | 'market'
  | 'regulatory'
  | 'crisis'
  | 'general';

export interface Scenario {
  id: string;
  user_id: string;
  hypothesis: string;
  category: ScenarioCategory;
  analysis: string;
  created_at: string;
}

export interface ScenarioRequest {
  userId: string;
  hypothesis: string;
}

export interface ScenarioResponse {
  scenarioId: string;
  hypothesis: string;
  category: ScenarioCategory;
  analysis: string;
  sections: {
    summary: string;
    financial_impact: string;
    risks: string;
    opportunities: string;
    timeline: string;
    recommendation: string;
  };
}

// --- ARES Compliance (Mexican Legal) ---

export type ComplianceArea =
  | 'sat'
  | 'imss'
  | 'infonavit'
  | 'lft'
  | 'lfpdppp'
  | 'cofece'
  | 'general';

export type RiskLevel = 'bajo' | 'medio' | 'alto' | 'critico';

export interface ComplianceCheck {
  id: string;
  user_id: string;
  query: string;
  area: ComplianceArea;
  analysis: string;
  risk_level: RiskLevel;
  created_at: string;
}

export interface ComplianceRequest {
  userId: string;
  query: string;
}

export interface ComplianceResponse {
  checkId: string;
  area: ComplianceArea;
  risk_level: RiskLevel;
  analysis: string;
  sections: {
    summary: string;
    applicable_laws: string;
    obligations: string;
    risks: string;
    action_items: string;
    deadlines: string;
  };
}

// --- ARES Pulse (Business Intelligence) ---

export interface PulseSnapshot {
  id: string;
  user_id: string;
  analysis: string;
  created_at: string;
}

export interface PulseRequest {
  userId: string;
  focus?: 'general' | 'financial' | 'team' | 'clients' | 'operations';
}

export interface PulseResponse {
  snapshotId: string;
  analysis: string;
  sections: {
    executive_summary: string;
    financial_health: string;
    risk_alerts: string;
    team_insights: string;
    client_concentration: string;
    recommendations: string;
  };
}

// --- ARES Prep (Meeting Preparation) ---

export type MeetingType =
  | 'board'
  | 'investor'
  | 'team'
  | 'client'
  | 'vendor'
  | 'partner'
  | 'general';

export interface MeetingPrep {
  id: string;
  user_id: string;
  meeting_topic: string;
  meeting_type: MeetingType;
  brief: string;
  created_at: string;
}

export interface PrepRequest {
  userId: string;
  meeting_topic: string;
  meeting_type: MeetingType;
  attendees?: string;
  additional_context?: string;
}

export interface PrepResponse {
  prepId: string;
  meeting_topic: string;
  meeting_type: MeetingType;
  brief: string;
  sections: {
    context: string;
    objectives: string;
    talking_points: string;
    risks_to_address: string;
    questions_to_ask: string;
    desired_outcomes: string;
  };
}

// ============================================================
// CONTRACT GENERATOR TYPES
// ============================================================

export type ContractType =
  | 'nda'
  | 'servicios'
  | 'laboral'
  | 'arrendamiento'
  | 'sociedad'
  | 'proveedor';

export interface GeneratedContract {
  id: string;
  user_id: string;
  contract_type: ContractType;
  prompt: string;
  title: string;
  generated_content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContractResponse {
  contractId: string;
  contract_type: ContractType;
  title: string;
  content: string;
}

// ============================================================
// CALENDAR TYPES
// ============================================================

export type CalendarProvider =
  | 'google_calendar'
  | 'outlook'
  | 'apple_calendar';

export type CalendarEventSource =
  | 'ares'
  | 'google'
  | 'outlook'
  | 'apple';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  source: CalendarEventSource;
  external_id?: string;
  zoom_link?: string;
  zoom_meeting_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  color?: string;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: CalendarProvider;
  email: string;
  status: 'connected' | 'disconnected' | 'expired';
  last_sync?: string;
  sync_enabled?: boolean;
  created_at: string;
}

// ============================================================
// CALENDAR TASKS
// ============================================================

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface CalendarTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  label?: string;
  snoozed_until?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  label?: string;
}

// ============================================================
// MESSAGING CONNECTIONS (WhatsApp / Telegram)
// ============================================================

export type MessagingChannel = 'whatsapp' | 'telegram';

export interface MessagingConnection {
  id: string;
  user_id: string;
  channel: MessagingChannel;
  external_id: string;
  status: 'pending' | 'verified' | 'disabled';
  verification_code?: string;
  verification_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ParsedCalendarIntent {
  action: 'create_event' | 'list_events' | 'delete_event' | 'unknown';
  title?: string;
  start_time?: string;
  end_time?: string;
  needs_zoom?: boolean;
  confidence: number;
  raw_message: string;
}

// ============================================================
// ZOOM INTEGRATION
// ============================================================

export interface ZoomIntegration {
  id: string;
  user_id: string;
  zoom_user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  status: string;
  created_at: string;
  updated_at: string;
}
