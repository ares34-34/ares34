'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Check, ArrowRight, ArrowLeft, Building2, Users, DollarSign,
  Globe, Cpu, UserCircle, Shield, MessageCircle, Sparkles, ChevronDown,
  ChevronUp, Send, AlertTriangle, FileText, Upload, Trash2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CompanyDocument } from '@/lib/types';

// ============================================================
// TYPES
// ============================================================

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  questions: FormQuestion[];
}

type QuestionType = 'text' | 'number' | 'select' | 'boolean' | 'boolean_detail' | 'multi_select' | 'percentage';

interface FormQuestion {
  key: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  conditional?: { key: string; value: unknown };
  detailKey?: string;
  detailPlaceholder?: string;
}

interface ConversationalBlock {
  id: string;
  title: string;
  objective: string;
  questions: ConversationalQuestion[];
}

interface ConversationalQuestion {
  key: string;
  question: string;
  reveal: string;
}

interface ChatMessage {
  role: 'ares' | 'user';
  content: string;
}

// ============================================================
// ONBOARDING PHASES
// ============================================================

type OnboardingPhase = 'profile' | 'interview' | 'documents' | 'diagnostic';

// ============================================================
// FORM SECTIONS (50 factual questions - 7 sections A-G)
// ============================================================

const FORM_SECTIONS: FormSection[] = [
  {
    id: 'identity',
    title: 'Identidad y estructura',
    icon: <Building2 className="h-4 w-4" />,
    questions: [
      { key: 'legal_name', label: 'Nombre legal de la empresa', type: 'text', placeholder: 'Ej: Tecnología Avanzada S.A. de C.V.', required: true },
      { key: 'founding_year', label: 'Año de fundación', type: 'number', placeholder: 'Ej: 2015' },
      { key: 'sector', label: 'Sector / industria principal', type: 'text', placeholder: 'Ej: Tecnología, Manufactura, Servicios financieros', required: true },
      { key: 'specific_activity', label: 'Giro específico (descripción en una línea)', type: 'text', placeholder: 'Ej: Desarrollo de software de contabilidad para PyMEs', required: true },
      {
        key: 'employee_range', label: 'Número de empleados', type: 'select', required: true,
        options: [
          { value: '1_10', label: '1-10' },
          { value: '11_50', label: '11-50' },
          { value: '51_200', label: '51-200' },
          { value: '201_500', label: '201-500' },
          { value: '501_1000', label: '501-1,000' },
          { value: 'mas_1000', label: 'Más de 1,000' },
        ],
      },
      { key: 'main_office_location', label: 'Ubicación de oficinas principales', type: 'text', placeholder: 'Ej: CDMX, Col. Polanco' },
      { key: 'multi_location', label: '¿Opera en múltiples ubicaciones o países?', type: 'boolean' },
    ],
  },
  {
    id: 'governance',
    title: 'Gobierno corporativo',
    icon: <Shield className="h-4 w-4" />,
    questions: [
      {
        key: 'society_type', label: 'Tipo de sociedad', type: 'select',
        options: [
          { value: 'SA', label: 'S.A.' },
          { value: 'SA_de_CV', label: 'S.A. de C.V.' },
          { value: 'SAPI', label: 'SAPI' },
          { value: 'SAPI_de_CV', label: 'SAPI de C.V.' },
          { value: 'SRL', label: 'S. de R.L.' },
          { value: 'SC', label: 'S.C.' },
          { value: 'SAS', label: 'S.A.S.' },
          { value: 'AC', label: 'A.C.' },
          { value: 'persona_fisica', label: 'Persona física con actividad empresarial' },
          { value: 'otra', label: 'Otra' },
        ],
      },
      { key: 'has_formal_board', label: '¿Existe un consejo de administración formal?', type: 'boolean' },
      { key: 'board_member_count', label: 'Número de miembros del consejo', type: 'number', placeholder: 'Ej: 5', conditional: { key: 'has_formal_board', value: true } },
      { key: 'ceo_is_shareholder', label: '¿El CEO es también accionista?', type: 'boolean_detail', detailKey: 'ceo_shareholder_pct', detailPlaceholder: '% de participación' },
      { key: 'ceo_is_board_president', label: '¿El CEO es también presidente del consejo?', type: 'boolean' },
      { key: 'shareholder_count', label: 'Número de accionistas', type: 'number', placeholder: 'Ej: 3' },
      { key: 'shareholders_in_operations', label: '¿Hay accionistas que también operan en la empresa?', type: 'boolean' },
      { key: 'has_regular_assembly', label: '¿Existe asamblea de accionistas con reuniones periódicas?', type: 'boolean' },
      { key: 'family_in_leadership', label: '¿Hay miembros de familia en posiciones directivas o como accionistas?', type: 'boolean' },
      { key: 'has_family_protocol', label: '¿Existe un protocolo familiar o acuerdo de accionistas?', type: 'boolean', conditional: { key: 'family_in_leadership', value: true } },
    ],
  },
  {
    id: 'team',
    title: 'Equipo directivo',
    icon: <Users className="h-4 w-4" />,
    questions: [
      { key: 'direct_reports_count', label: 'Número de reportes directos al CEO', type: 'number', placeholder: 'Ej: 6' },
      {
        key: 'functional_areas_reporting', label: 'Áreas funcionales que reportan directamente al CEO', type: 'multi_select',
        options: [
          { value: 'finanzas', label: 'Finanzas' },
          { value: 'operaciones', label: 'Operaciones' },
          { value: 'ventas', label: 'Ventas/Comercial' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'rh', label: 'Recursos Humanos' },
          { value: 'tecnologia', label: 'Tecnología/TI' },
          { value: 'legal', label: 'Legal' },
          { value: 'produccion', label: 'Producción' },
        ],
      },
      { key: 'has_coo', label: '¿Existe un COO o Director General Adjunto?', type: 'boolean' },
      { key: 'has_cfo', label: '¿Existe un CFO o Director de Finanzas formal?', type: 'boolean' },
      {
        key: 'avg_leadership_tenure', label: 'Antigüedad promedio del equipo directivo', type: 'select',
        options: [
          { value: 'menos_1', label: 'Menos de 1 año' },
          { value: '1_3', label: '1-3 años' },
          { value: '3_5', label: '3-5 años' },
          { value: '5_10', label: '5-10 años' },
          { value: 'mas_10', label: 'Más de 10 años' },
        ],
      },
      { key: 'ceo_leads_functional_area', label: '¿El CEO lidera directamente alguna área funcional además de la dirección general?', type: 'boolean' },
    ],
  },
  {
    id: 'finance',
    title: 'Salud financiera',
    icon: <DollarSign className="h-4 w-4" />,
    questions: [
      {
        key: 'revenue_range', label: 'Rango de facturación anual (MXN)', type: 'select', required: true,
        options: [
          { value: 'menos_5M', label: 'Menos de $5M' },
          { value: '5M_20M', label: '$5M - $20M' },
          { value: '20M_50M', label: '$20M - $50M' },
          { value: '50M_100M', label: '$50M - $100M' },
          { value: '100M_500M', label: '$100M - $500M' },
          { value: 'mas_500M', label: 'Más de $500M' },
        ],
      },
      {
        key: 'revenue_trend', label: 'Tendencia de ingresos últimos 3 años', type: 'select',
        options: [
          { value: 'crecimiento_acelerado', label: 'Crecimiento acelerado (+20% anual)' },
          { value: 'crecimiento_estable', label: 'Crecimiento estable (5-20% anual)' },
          { value: 'estancado', label: 'Estancado' },
          { value: 'decreciendo', label: 'Decreciendo' },
        ],
      },
      { key: 'is_profitable', label: '¿La empresa es rentable actualmente?', type: 'boolean' },
      { key: 'has_significant_debt', label: '¿Tiene deuda financiera significativa?', type: 'boolean' },
      {
        key: 'debt_range', label: 'Nivel de deuda vs facturación', type: 'select',
        conditional: { key: 'has_significant_debt', value: true },
        options: [
          { value: 'menor_10pct_revenue', label: 'Menor al 10% de facturación' },
          { value: '10_30pct_revenue', label: '10-30% de facturación' },
          { value: '30_50pct_revenue', label: '30-50% de facturación' },
          { value: 'mayor_50pct_revenue', label: 'Mayor al 50% de facturación' },
        ],
      },
      { key: 'main_revenue_source', label: 'Principal fuente de ingresos', type: 'text', placeholder: 'Ej: Venta de licencias de software' },
      { key: 'main_revenue_pct', label: '% del ingreso total que representa', type: 'number', placeholder: 'Ej: 70' },
      { key: 'single_client_dependency', label: '¿Dependencia de un solo cliente mayor al 30%?', type: 'boolean_detail', detailKey: 'dependency_pct', detailPlaceholder: '% del ingreso' },
      { key: 'has_external_investors', label: '¿Tiene inversionistas externos o capital de riesgo?', type: 'boolean' },
      { key: 'seeking_financing', label: '¿Está buscando financiamiento o inversión actualmente?', type: 'boolean' },
    ],
  },
  {
    id: 'market',
    title: 'Mercado y competencia',
    icon: <Globe className="h-4 w-4" />,
    questions: [
      {
        key: 'client_type', label: 'Tipo de cliente principal', type: 'select',
        options: [
          { value: 'B2B', label: 'B2B (Empresas)' },
          { value: 'B2C', label: 'B2C (Consumidor final)' },
          { value: 'B2G', label: 'B2G (Gobierno)' },
          { value: 'mixed', label: 'Mixto' },
        ],
      },
      {
        key: 'active_client_count_range', label: 'Número aproximado de clientes activos', type: 'select',
        options: [
          { value: 'menos_10', label: 'Menos de 10' },
          { value: '10_50', label: '10-50' },
          { value: '50_200', label: '50-200' },
          { value: '200_1000', label: '200-1,000' },
          { value: 'mas_1000', label: 'Más de 1,000' },
        ],
      },
      { key: 'operates_in_regulated_market', label: '¿Opera en un mercado regulado?', type: 'boolean_detail', detailKey: 'regulated_market_detail', detailPlaceholder: 'Ej: Sector salud (COFEPRIS)' },
      {
        key: 'competitor_count_range', label: '¿Cuántos competidores directos identifica?', type: 'select',
        options: [
          { value: 'menos_5', label: '1-5' },
          { value: '5_20', label: '5-20' },
          { value: '20_50', label: '20-50' },
          { value: 'mas_50', label: 'Más de 50' },
        ],
      },
      {
        key: 'market_position', label: 'Posición percibida en el mercado', type: 'select',
        options: [
          { value: 'lider', label: 'Líder del mercado' },
          { value: 'top3', label: 'Top 3' },
          { value: 'retador', label: 'Retador / medio' },
          { value: 'nicho', label: 'Nicho especializado' },
          { value: 'emergente', label: 'Entrante / emergente' },
        ],
      },
      { key: 'exports_internationally', label: '¿Exporta o tiene clientes internacionales?', type: 'boolean_detail', detailKey: 'international_pct', detailPlaceholder: '% de ingresos internacionales' },
      { key: 'considering_new_markets', label: '¿Está considerando entrar a nuevos mercados o segmentos?', type: 'boolean' },
    ],
  },
  {
    id: 'operations',
    title: 'Operaciones y tecnología',
    icon: <Cpu className="h-4 w-4" />,
    questions: [
      { key: 'has_manufacturing', label: '¿Tiene operaciones de manufactura o producción?', type: 'boolean' },
      {
        key: 'digitalization_level', label: 'Nivel de digitalización de operaciones', type: 'select',
        options: [
          { value: 'basico', label: 'Básico (Excel, email)' },
          { value: 'intermedio', label: 'Intermedio (algunas herramientas cloud)' },
          { value: 'avanzado', label: 'Avanzado (sistemas integrados)' },
          { value: 'transformacion_digital', label: 'Transformación digital (IA, automatización)' },
        ],
      },
      { key: 'uses_integrated_systems', label: '¿Usa ERP, CRM u otros sistemas integrados?', type: 'boolean_detail', detailKey: 'integrated_systems_detail', detailPlaceholder: 'Ej: SAP, Salesforce, Odoo' },
      { key: 'has_internal_it', label: '¿Tiene equipo de TI interno?', type: 'boolean_detail', detailKey: 'it_team_size', detailPlaceholder: 'Número de personas' },
      { key: 'uses_ai', label: '¿Está usando o explorando herramientas de IA?', type: 'boolean_detail', detailKey: 'ai_detail', detailPlaceholder: 'Ej: ChatGPT para ventas, automatización de reportes' },
    ],
  },
  {
    id: 'ceo',
    title: 'Perfil del CEO',
    icon: <UserCircle className="h-4 w-4" />,
    questions: [
      { key: 'ceo_years_in_role', label: 'Años en el puesto actual', type: 'number', placeholder: 'Ej: 5' },
      { key: 'ceo_is_founder', label: '¿Es fundador de la empresa?', type: 'boolean' },
      {
        key: 'ceo_generation', label: '¿Es CEO de primera generación o sucesión?', type: 'select',
        options: [
          { value: 'first', label: 'Primera generación (fundador)' },
          { value: 'succession', label: 'Sucesión (segunda generación o posterior)' },
        ],
      },
      {
        key: 'ceo_simultaneous_roles', label: 'Roles simultáneos que ocupa', type: 'multi_select',
        options: [
          { value: 'ceo', label: 'Director General (CEO)' },
          { value: 'accionista', label: 'Accionista' },
          { value: 'consejero', label: 'Miembro del Consejo' },
          { value: 'presidente_consejo', label: 'Presidente del Consejo' },
          { value: 'director_area', label: 'Director de área funcional' },
          { value: 'fundador', label: 'Fundador' },
        ],
      },
      { key: 'ceo_education', label: 'Formación académica principal', type: 'text', placeholder: 'Ej: MBA IPADE, Ing. Industrial ITESM' },
      { key: 'ceo_prior_experience', label: '¿Tiene experiencia como CEO en otras empresas?', type: 'text', placeholder: 'Ej: Sí, dirigí una empresa de logística 3 años' },
      { key: 'ceo_on_other_boards', label: '¿Participa en consejos de otras empresas?', type: 'boolean' },
    ],
  },
];

// ============================================================
// CONVERSATIONAL BLOCKS (28 questions - 5 blocks)
// ============================================================

const CONVERSATIONAL_BLOCKS: ConversationalBlock[] = [
  {
    id: 'governance_power',
    title: 'Gobierno y poder real',
    objective: 'Entender la dinámica real de poder más allá del organigrama',
    questions: [
      { key: 'power_first_call', question: 'Cuando necesitas tomar una decisión que afecta a toda la empresa, ¿con quién hablas primero?', reveal: 'Estructura informal de poder' },
      { key: 'power_hidden_approval', question: '¿Hay alguien en la empresa cuya aprobación necesitas aunque no esté en tu línea de reporte?', reveal: 'Poder oculto' },
      { key: 'board_last_rejection', question: '¿Cuándo fue la última vez que el consejo rechazó o modificó significativamente una propuesta tuya?', reveal: 'Funcionalidad real del consejo' },
      { key: 'board_value', question: '¿Los miembros del consejo aportan perspectivas que tú no tienes, o validan lo que ya decidiste?', reveal: 'Consejo funcional vs decorativo' },
      { key: 'family_business_mix', question: 'Si hay familia involucrada: ¿las conversaciones de negocio se quedan en la oficina o llegan a la mesa del domingo?', reveal: 'Contaminación familia-empresa' },
      { key: 'role_conflict', question: '¿Cuál es la decisión más difícil que has tenido que tomar donde tus diferentes roles (CEO, accionista, familiar) te pedían cosas distintas?', reveal: 'Conflicto de roles en acción' },
    ],
  },
  {
    id: 'financial_reality',
    title: 'Realidad financiera',
    objective: 'Entender la salud real más allá de los números del formulario',
    questions: [
      { key: 'cash_runway', question: 'Si mañana se caía tu cliente más grande, ¿cuántos meses podrías operar sin ajustes?', reveal: 'Vulnerabilidad financiera real' },
      { key: 'growth_quality', question: '¿El crecimiento de los últimos años ha sido orgánico o ha requerido inversión significativa que aún no recuperas?', reveal: 'Calidad del crecimiento' },
      { key: 'biggest_investment', question: '¿Cuál es la inversión más grande que has hecho en los últimos 2 años y cómo resultó?', reveal: 'Patrón de toma de riesgos' },
      { key: 'hidden_pressure', question: '¿Hay alguna presión financiera que tu equipo directivo no conoce completamente?', reveal: 'Carga invisible del CEO' },
      { key: 'time_allocation', question: '¿Qué porcentaje de tu tiempo como CEO dedicas a temas financieros vs estratégicos vs operativos?', reveal: 'Distribución real de atención' },
    ],
  },
  {
    id: 'market_positioning',
    title: 'Mercado y posicionamiento',
    objective: 'Entender la realidad competitiva desde la trinchera',
    questions: [
      { key: 'competitor_threat', question: '¿Qué haría tu competidor más agresivo si tuviera acceso a todos tus clientes mañana?', reveal: 'Vulnerabilidades percibidas' },
      { key: 'real_churn_reason', question: '¿Por qué se van los clientes que se van? No el motivo oficial — el real.', reveal: 'Puntos ciegos de retención' },
      { key: 'irreplaceability', question: '¿Si tu empresa desapareciera mañana, qué les costaría más trabajo reemplazar a tus clientes?', reveal: 'Propuesta de valor real' },
      { key: 'sleepless_trend', question: '¿Qué cambio en tu industria te quita el sueño aunque tu equipo aún no lo vea como urgente?', reveal: 'Amenazas emergentes' },
      { key: 'pricing_reality', question: '¿Tus precios reflejan el valor que entregas o estás compitiendo por precio?', reveal: 'Estrategia de pricing real' },
    ],
  },
  {
    id: 'team_culture',
    title: 'Equipo y cultura',
    objective: 'Entender las dinámicas humanas que afectan las decisiones',
    questions: [
      { key: 'trust_delegate', question: '¿A quién de tu equipo directivo le darías las llaves de la empresa por 3 meses sin preocuparte?', reveal: 'Profundidad real del bench' },
      { key: 'hardest_hire', question: '¿Cuál es la posición que más te ha costado llenar o que sigue sin funcionar como necesitas?', reveal: 'Gaps críticos de talento' },
      { key: 'real_culture', question: 'Cuando un empleado nuevo llega, ¿qué aprende en su primera semana que no está en ningún manual?', reveal: 'Cultura real vs declarada' },
      { key: 'key_loss', question: '¿Has perdido a alguien clave en los últimos 12 meses que te dolió perder?', reveal: 'Riesgo de fuga de talento' },
      { key: 'bad_news_filter', question: '¿Tu equipo directivo te dice lo que no quieres escuchar, o filtran las malas noticias?', reveal: 'Calidad de información' },
      { key: 'ceo_absence', question: '¿Si tú no pudieras operar por 6 meses, qué pasaría con la empresa?', reveal: 'Dependencia del CEO' },
    ],
  },
  {
    id: 'ceo_decisions',
    title: 'Tú como tomador de decisiones',
    objective: 'Mapear tu contexto como decisor',
    questions: [
      { key: 'last_big_decision', question: '¿Cuál fue la última decisión importante que tomaste y cuánto tiempo te tomó?', reveal: 'Velocidad y proceso de decisión' },
      { key: 'regret_decision', question: '¿Cuál es la decisión de los últimos 2 años que tomarías diferente si pudieras?', reveal: 'Patrones de error' },
      { key: 'pending_decisions', question: '¿Cuántas decisiones importantes tienes pendientes en este momento?', reveal: 'Carga cognitiva actual' },
      { key: 'lonely_decision', question: '¿Hay alguna decisión que estés cargando solo porque no sabes con quién discutirla?', reveal: 'Aislamiento del CEO' },
      { key: 'info_gap', question: '¿Cuándo fue la última vez que descubriste algo importante sobre tu empresa que deberías haber sabido antes?', reveal: 'Gaps de información' },
      { key: 'energy_drain', question: '¿Qué parte de tu trabajo como CEO te consume más energía pero genera menos valor?', reveal: 'Misallocación de atención' },
    ],
  },
];

// ============================================================
// HELPER: Map conversational answers to CEO context blocks
// ============================================================

function mapAnswersToCEOContext(answers: Record<string, string>) {
  return {
    block_1_vision: {
      company_in_5_years: answers.power_first_call || '',
      biggest_current_bet: answers.biggest_investment || '',
      biggest_fear: answers.sleepless_trend || '',
      proudest_achievement: answers.irreplaceability || '',
    },
    block_2_leadership: {
      leadership_style: answers.trust_delegate || '',
      hardest_decision_recently: answers.last_big_decision || '',
      decision_making_approach: answers.pending_decisions || '',
      conflict_resolution_style: answers.role_conflict || '',
    },
    block_3_team: {
      team_biggest_strength: answers.real_culture || '',
      team_biggest_gap: answers.hardest_hire || '',
      key_hire_next_12_months: answers.key_loss || '',
      culture_one_word: answers.bad_news_filter || '',
    },
    block_4_operations: {
      biggest_operational_bottleneck: answers.time_allocation || '',
      process_most_wants_to_fix: answers.energy_drain || '',
      most_time_consuming_task: answers.ceo_absence || '',
      delegation_struggle: answers.hidden_pressure || '',
    },
    block_5_growth: {
      main_growth_lever: answers.growth_quality || '',
      biggest_competitive_advantage: answers.competitor_threat || '',
      customer_acquisition_challenge: answers.real_churn_reason || '',
      pricing_confidence: answers.pricing_reality || '',
    },
    block_6_finance: {
      cash_flow_comfort: answers.cash_runway || '',
      biggest_financial_worry: answers.hidden_pressure || '',
      investment_priority_next_year: answers.biggest_investment || '',
      financial_metric_watches_most: answers.time_allocation || '',
    },
    block_7_external: {
      key_external_threat: answers.competitor_threat || '',
      regulatory_concern: answers.sleepless_trend || '',
      industry_trend_impact: answers.pricing_reality || '',
      relationship_with_board_or_partners: answers.board_value || '',
    },
    completed_blocks: 7,
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function OnboardingPage() {
  const router = useRouter();

  // Phase state
  const [phase, setPhase] = useState<OnboardingPhase>('profile');
  const [loading, setLoading] = useState(false);

  // Profile form state (50 questions)
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [expandedSection, setExpandedSection] = useState<string>('identity');

  // Interview state (28 questions)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [interviewStarted, setInterviewStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Documents
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Diagnostic
  const [diagnostic, setDiagnostic] = useState<{
    structural_radiography: string;
    role_conflict_map: string;
    vulnerabilities: string;
    hidden_strengths: string;
    strategic_questions: string;
  } | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load existing documents
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch('/api/uploads/documents');
        const json = await res.json();
        if (json.success && json.data) {
          setDocuments(json.data);
        }
      } catch {
        // ignore
      }
    }
    loadDocs();
  }, []);

  // ============================================================
  // FORM HELPERS
  // ============================================================

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleMultiSelect = useCallback((key: string, value: string) => {
    setFormData(prev => {
      const current = (prev[key] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  }, []);

  function isSectionComplete(section: FormSection): boolean {
    return section.questions
      .filter(q => q.required)
      .every(q => {
        const val = formData[q.key];
        if (typeof val === 'string') return val.trim().length > 0;
        if (typeof val === 'number') return true;
        if (typeof val === 'boolean') return true;
        if (Array.isArray(val)) return val.length > 0;
        return val !== undefined && val !== null && val !== '';
      });
  }

  const allRequiredComplete = FORM_SECTIONS.every(s => isSectionComplete(s));

  // ============================================================
  // PROFILE SUBMIT
  // ============================================================

  async function handleProfileSubmit() {
    if (!allRequiredComplete) {
      toast.error('Completa todos los campos requeridos antes de continuar');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Perfil de empresa guardado');
        setPhase('interview');
      } else {
        toast.error(data.error || 'Error al guardar el perfil');
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // INTERVIEW LOGIC
  // ============================================================

  function startInterview() {
    setInterviewStarted(true);
    const firstBlock = CONVERSATIONAL_BLOCKS[0];
    const firstQuestion = firstBlock.questions[0];
    setChatMessages([
      {
        role: 'ares',
        content: `¡Perfecto! Ya tengo los datos de tu empresa. Ahora quiero entender el contexto que no está en los números.\n\nVamos a platicar sobre ${firstBlock.title.toLowerCase()}. ${firstBlock.objective}.\n\nNo hay respuestas correctas o incorrectas — entre más honesto seas, mejor te puedo ayudar.`,
      },
      {
        role: 'ares',
        content: firstQuestion.question,
      },
    ]);
  }

  function handleSendAnswer() {
    if (!userInput.trim()) return;

    const block = CONVERSATIONAL_BLOCKS[currentBlockIndex];
    const question = block.questions[currentQuestionIndex];
    const answer = userInput.trim();

    // Save answer
    const newAnswers = { ...interviewAnswers, [question.key]: answer };
    setInterviewAnswers(newAnswers);

    // Add user message
    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: answer },
    ];

    setUserInput('');

    // Determine next question
    const nextQuestionIdx = currentQuestionIndex + 1;

    if (nextQuestionIdx < block.questions.length) {
      // Next question in same block
      const nextQ = block.questions[nextQuestionIdx];
      newMessages.push({ role: 'ares', content: nextQ.question });
      setChatMessages(newMessages);
      setCurrentQuestionIndex(nextQuestionIdx);
    } else {
      // Move to next block
      const nextBlockIdx = currentBlockIndex + 1;
      if (nextBlockIdx < CONVERSATIONAL_BLOCKS.length) {
        const nextBlock = CONVERSATIONAL_BLOCKS[nextBlockIdx];
        const nextQ = nextBlock.questions[0];
        newMessages.push({
          role: 'ares',
          content: `Muy bien. Ahora hablemos de ${nextBlock.title.toLowerCase()}. ${nextBlock.objective}.`,
        });
        newMessages.push({ role: 'ares', content: nextQ.question });
        setChatMessages(newMessages);
        setCurrentBlockIndex(nextBlockIdx);
        setCurrentQuestionIndex(0);
      } else {
        // Interview complete
        newMessages.push({
          role: 'ares',
          content: '¡Excelente! Ya tengo todo lo que necesito. Gracias por tu honestidad — eso es lo que hace la diferencia.\n\nAhora voy a generar tu diagnóstico de arranque: lo que veo sobre tu empresa que tal vez tú no estás viendo.',
        });
        setChatMessages(newMessages);
        handleInterviewComplete(newAnswers);
      }
    }
  }

  async function handleInterviewComplete(answers: Record<string, string>) {
    setLoading(true);
    try {
      const contextData = mapAnswersToCEOContext(answers);
      const res = await fetch('/api/onboarding/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextData),
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setPhase('documents');
          setLoading(false);
        }, 2000);
      } else {
        toast.error(data.error || 'Error al guardar el contexto');
        setLoading(false);
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  // ============================================================
  // DOCUMENTS
  // ============================================================

  async function handleUpload(file: File) {
    if (documents.length >= 10) {
      toast.error('Máximo 10 documentos.');
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
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        toast.success('Documento subido');
        setDocuments(prev => [json.data, ...prev]);
      } else {
        toast.error(json.error || 'Error al subir');
      }
    } catch {
      toast.error('Error de conexión');
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
        setDocuments(prev => prev.filter(d => d.id !== docId));
        toast.success('Documento eliminado');
      } else {
        toast.error(json.error || 'Error al eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ============================================================
  // DIAGNOSTIC
  // ============================================================

  async function generateDiagnostic() {
    setDiagnosticLoading(true);
    setPhase('diagnostic');
    try {
      const res = await fetch('/api/onboarding/diagnostic', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDiagnostic(data.data);
      } else {
        toast.error(data.error || 'Error al generar el diagnóstico');
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setDiagnosticLoading(false);
    }
  }

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all';
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  function renderFormQuestion(q: FormQuestion) {
    if (q.conditional) {
      const parentVal = formData[q.conditional.key];
      if (parentVal !== q.conditional.value) return null;
    }

    const value = formData[q.key];

    switch (q.type) {
      case 'text':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">
              {q.label}
              {q.required && <span className="text-emerald-400 ml-1">*</span>}
            </label>
            <input
              value={(value as string) || ''}
              onChange={e => updateField(q.key, e.target.value)}
              placeholder={q.placeholder}
              className={inputClass}
            />
            {q.hint && <p className="text-xs text-white/30">{q.hint}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">
              {q.label}
              {q.required && <span className="text-emerald-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={(value as number) ?? ''}
              onChange={e => updateField(q.key, e.target.value ? Number(e.target.value) : null)}
              placeholder={q.placeholder}
              className={inputClass}
            />
          </div>
        );

      case 'percentage':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">{q.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={(value as number) ?? ''}
                onChange={e => updateField(q.key, e.target.value ? Number(e.target.value) : null)}
                placeholder={q.placeholder}
                className={`${inputClass} max-w-[120px]`}
              />
              <span className="text-white/40 text-sm">%</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">
              {q.label}
              {q.required && <span className="text-emerald-400 ml-1">*</span>}
            </label>
            <select
              value={(value as string) || ''}
              onChange={e => updateField(q.key, e.target.value || null)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              {q.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );

      case 'boolean':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">{q.label}</label>
            <div className="flex gap-3">
              {[true, false].map(boolVal => (
                <button
                  key={String(boolVal)}
                  type="button"
                  onClick={() => updateField(q.key, boolVal)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    value === boolVal
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-white/[0.04] border border-white/[0.10] text-white/60 hover:bg-white/[0.08]'
                  }`}
                >
                  {boolVal ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
          </div>
        );

      case 'boolean_detail':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">{q.label}</label>
            <div className="flex gap-3">
              {[true, false].map(boolVal => (
                <button
                  key={String(boolVal)}
                  type="button"
                  onClick={() => updateField(q.key, boolVal)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    value === boolVal
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-white/[0.04] border border-white/[0.10] text-white/60 hover:bg-white/[0.08]'
                  }`}
                >
                  {boolVal ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
            {value === true && q.detailKey && (
              <input
                value={(formData[q.detailKey] as string) || ''}
                onChange={e => updateField(q.detailKey!, e.target.value)}
                placeholder={q.detailPlaceholder}
                className={`${inputClass} mt-2`}
              />
            )}
          </div>
        );

      case 'multi_select':
        return (
          <div key={q.key} className="space-y-1.5">
            <label className="text-sm text-white/90 font-medium">{q.label}</label>
            <div className="flex flex-wrap gap-2">
              {q.options?.map(opt => {
                const selected = ((formData[q.key] as string[]) || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMultiSelect(q.key, opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-white/[0.04] border border-white/[0.10] text-white/60 hover:bg-white/[0.08]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // ============================================================
  // PROGRESS BAR
  // ============================================================

  const phases: { id: OnboardingPhase; label: string; number: number }[] = [
    { id: 'profile', label: 'Datos de empresa', number: 1 },
    { id: 'interview', label: 'Entrevista con ARES', number: 2 },
    { id: 'documents', label: 'Documentos', number: 3 },
    { id: 'diagnostic', label: 'Diagnóstico', number: 4 },
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === phase);

  const totalConversationalQuestions = CONVERSATIONAL_BLOCKS.reduce((sum, b) => sum + b.questions.length, 0);
  const answeredQuestions = Object.keys(interviewAnswers).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 app-ambient-bg">
      <div className="app-glow-1" />
      <div className="app-glow-2" />
      <div className="app-glow-3" />
      <div className="app-grid-subtle" />
      <div className="app-orb app-orb-1" />
      <div className="app-orb app-orb-2" />
      <div className="app-orb app-orb-3" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Phase progress */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6">
          {phases.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 sm:gap-3">
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                  i === currentPhaseIndex
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : i < currentPhaseIndex
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.06] text-white/40 border border-white/15'
                }`}
              >
                {i < currentPhaseIndex ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : p.number}
              </div>
              {i < phases.length - 1 && (
                <div className={`w-5 sm:w-10 h-px ${i < currentPhaseIndex ? 'bg-emerald-500/30' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mb-6">
          <p className="text-xs text-emerald-400/80 uppercase tracking-wider">
            {phases[currentPhaseIndex]?.label || 'Completado'}
          </p>
        </div>

        {/* ===================== PHASE 1: Company Profile Form ===================== */}
        {phase === 'profile' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Radiografía de tu empresa</h1>
              <p className="text-white/50 text-sm">
                50 preguntas factuales para que ARES conozca la anatomía de tu empresa.
                <br />
                <span className="text-white/30">Tiempo estimado: 15-20 minutos</span>
              </p>
            </div>

            {FORM_SECTIONS.map((section, sIdx) => {
              const isExpanded = expandedSection === section.id;
              const isComplete = isSectionComplete(section);

              return (
                <div key={section.id} className="border border-white/[0.10] bg-white/[0.03] rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
                    className="w-full flex items-center gap-3 px-6 py-4 text-left cursor-pointer hover:bg-white/[0.02] transition-all"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isComplete ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-white/50'
                    }`}>
                      {isComplete ? <Check className="h-4 w-4" /> : section.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{String.fromCharCode(65 + sIdx)}. {section.title}</p>
                      <p className="text-xs text-white/40">{section.questions.length} preguntas</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-white/30" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-white/30" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-5 border-t border-white/[0.06] pt-5">
                      {section.questions.map(q => renderFormQuestion(q))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleProfileSubmit}
                disabled={!allRequiredComplete || loading}
                className="px-6 sm:px-8 py-3 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Siguiente: Entrevista
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===================== PHASE 2: ARES Conversational Interview ===================== */}
        {phase === 'interview' && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-3 mb-1">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Entrevista con ARES</h2>
              </div>
              <p className="text-white/50 text-sm ml-8">
                28 preguntas conversacionales. ARES te pregunta — tú respondes con honestidad.
              </p>
              {interviewStarted && (
                <div className="ml-8 mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/60 rounded-full transition-all duration-500"
                      style={{ width: `${(answeredQuestions / totalConversationalQuestions) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/30">{answeredQuestions}/{totalConversationalQuestions}</span>
                </div>
              )}
            </div>

            {!interviewStarted ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">¿Listo para la entrevista?</h3>
                <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                  ARES va a hacerte 28 preguntas sobre tu empresa, tu equipo y cómo tomas decisiones.
                  No hay respuestas correctas — entre más honesto seas, mejor te puede ayudar.
                </p>
                <p className="text-white/30 text-xs mb-8">Tiempo estimado: 20-30 minutos</p>
                <button
                  onClick={startInterview}
                  className="px-8 py-3 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                >
                  Comenzar entrevista
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 space-y-4 max-h-[480px] overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-500/15 border border-emerald-500/20 text-white/90'
                          : 'bg-white/[0.06] border border-white/[0.08] text-white/80'
                      }`}>
                        {msg.role === 'ares' && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-400">ARES</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {!loading && answeredQuestions < totalConversationalQuestions && (
                  <div className="px-6 py-4 border-t border-white/[0.08]">
                    <div className="flex gap-3">
                      <textarea
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAnswer();
                          }
                        }}
                        placeholder="Escribe tu respuesta..."
                        rows={2}
                        className={`${inputClass} resize-none flex-1`}
                      />
                      <button
                        onClick={handleSendAnswer}
                        disabled={!userInput.trim()}
                        className="self-end px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-white/20 mt-2">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===================== PHASE 3: Documents (optional) ===================== */}
        {phase === 'documents' && (
          <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-semibold text-white">Documentos de tu empresa</h2>
            </div>
            <p className="text-white/50 text-sm mb-2 ml-0 sm:ml-8">
              Sube estados financieros, planes de negocio u otros PDFs para que ARES conozca tu empresa a fondo.
            </p>
            <p className="text-white/30 text-xs mb-6 sm:mb-8 ml-0 sm:ml-8">
              Este paso es opcional — puedes subir documentos después en Configuración.
            </p>

            <label
              className={`flex flex-col items-center justify-center gap-2 py-6 sm:py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
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
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-white/40 animate-spin" />
                  <span className="text-sm text-white/40 text-center px-2">Subiendo y procesando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-white/40" />
                  <span className="text-sm text-white/50 text-center px-2">
                    {documents.length >= 10 ? 'Límite de 10 documentos' : 'Haz clic para subir un PDF (máx. 10 MB)'}
                  </span>
                </>
              )}
            </label>

            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/40">{documents.length} de 10 documentos</p>
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                    <FileText className="h-4 w-4 text-white/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-white/80 truncate">{doc.file_name}</p>
                      <p className="text-[10px] sm:text-xs text-white/30">{formatFileSize(doc.file_size)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {doc.status === 'processing' && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Loader2 className="h-3 w-3 animate-spin" /> <span className="hidden sm:inline">Procesando</span>
                        </span>
                      )}
                      {doc.status === 'ready' && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <Check className="h-3 w-3" /> <span className="hidden sm:inline">Listo</span>
                        </span>
                      )}
                      {doc.status === 'error' && (
                        <span className="flex items-center gap-1 text-[10px] text-red-400" title={doc.error_message || ''}>
                          <AlertCircle className="h-3 w-3" /> <span className="hidden sm:inline">Error</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white/30 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <button
                onClick={() => setPhase('interview')}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white/70 text-sm hover:text-white hover:border-white/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={generateDiagnostic}
                className="px-6 sm:px-8 py-3 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Generar diagnóstico
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== PHASE 4: Diagnostic ===================== */}
        {phase === 'diagnostic' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Tu diagnóstico de arranque</h1>
              <p className="text-white/50 text-sm">
                Lo que ARES ve sobre tu empresa que tal vez tú no estás viendo.
              </p>
            </div>

            {diagnosticLoading ? (
              <div className="border border-white/[0.10] bg-white/[0.03] rounded-2xl p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mx-auto mb-4" />
                <p className="text-white/70 font-medium mb-1">ARES está analizando tu empresa...</p>
                <p className="text-white/40 text-sm">Cruzando datos del formulario con tu entrevista para encontrar ángulos muertos.</p>
                <p className="text-white/25 text-xs mt-4">Esto puede tomar 30-60 segundos</p>
              </div>
            ) : diagnostic ? (
              <>
                <DiagnosticSection
                  icon={<Building2 className="h-4 w-4" />}
                  title="Radiografía estructural"
                  content={diagnostic.structural_radiography}
                  color="blue"
                />
                <DiagnosticSection
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title="Mapa de conflictos de rol"
                  content={diagnostic.role_conflict_map}
                  color="purple"
                />
                <DiagnosticSection
                  icon={<Shield className="h-4 w-4" />}
                  title="Vulnerabilidades detectadas"
                  content={diagnostic.vulnerabilities}
                  color="red"
                />
                <DiagnosticSection
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Fortalezas no articuladas"
                  content={diagnostic.hidden_strengths}
                  color="green"
                />
                <DiagnosticSection
                  icon={<MessageCircle className="h-4 w-4" />}
                  title="Preguntas que ARES te devuelve"
                  content={diagnostic.strategic_questions}
                  color="amber"
                />

                <div className="flex justify-center pt-6 px-4 sm:px-0">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 sm:px-10 py-3.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
                  >
                    Comenzar a usar ARES34
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-8 text-center">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <p className="text-white/70 mb-4">No se pudo generar el diagnóstico.</p>
                <button
                  onClick={generateDiagnostic}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DIAGNOSTIC SECTION COMPONENT
// ============================================================

function DiagnosticSection({
  icon,
  title,
  content,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: 'blue' | 'purple' | 'red' | 'green' | 'amber';
}) {
  const [expanded, setExpanded] = useState(true);

  const colorMap = {
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/5', icon: 'text-blue-400 bg-blue-500/15' },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/5', icon: 'text-purple-400 bg-purple-500/15' },
    red: { border: 'border-red-500/20', bg: 'bg-red-500/5', icon: 'text-red-400 bg-red-500/15' },
    green: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', icon: 'text-emerald-400 bg-emerald-500/15' },
    amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', icon: 'text-amber-400 bg-amber-500/15' },
  };

  const c = colorMap[color];

  return (
    <div className={`border ${c.border} ${c.bg} rounded-2xl overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left cursor-pointer hover:bg-white/[0.02] transition-all"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        <h3 className="flex-1 text-sm font-semibold text-white">{title}</h3>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-white/30" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/30" />
        )}
      </button>
      {expanded && content && (
        <div className="px-6 pb-5 border-t border-white/[0.06] pt-4">
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  );
}
