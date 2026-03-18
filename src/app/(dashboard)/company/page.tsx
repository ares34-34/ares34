'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Building2, Shield, Users, DollarSign, Globe, Cpu,
  UserCircle, Pencil, Save, X, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CompanyProfile } from '@/lib/types';

// ============================================================
// DISPLAY LABEL MAPS
// ============================================================

const EMPLOYEE_RANGE_LABELS: Record<string, string> = {
  '1_10': '1-10',
  '11_50': '11-50',
  '51_200': '51-200',
  '201_500': '201-500',
  '501_1000': '501-1,000',
  'mas_1000': 'Mas de 1,000',
};

const SOCIETY_TYPE_LABELS: Record<string, string> = {
  'SA': 'S.A.',
  'SA_de_CV': 'S.A. de C.V.',
  'SAPI': 'SAPI',
  'SAPI_de_CV': 'SAPI de C.V.',
  'SRL': 'S. de R.L.',
  'SC': 'S.C.',
  'SAS': 'S.A.S.',
  'AC': 'A.C.',
  'persona_fisica': 'Persona fisica con actividad empresarial',
  'otra': 'Otra',
};

const REVENUE_RANGE_LABELS: Record<string, string> = {
  'menos_5M': 'Menos de $5M',
  '5M_20M': '$5M - $20M',
  '20M_50M': '$20M - $50M',
  '50M_100M': '$50M - $100M',
  '100M_500M': '$100M - $500M',
  'mas_500M': 'Mas de $500M',
};

const REVENUE_TREND_LABELS: Record<string, string> = {
  'crecimiento_acelerado': 'Crecimiento acelerado (+20% anual)',
  'crecimiento_estable': 'Crecimiento estable (5-20% anual)',
  'estancado': 'Estancado',
  'decreciendo': 'Decreciendo',
};

const DEBT_RANGE_LABELS: Record<string, string> = {
  'sin_deuda': 'Sin deuda',
  'menor_10pct_revenue': 'Menor al 10% de facturacion',
  '10_30pct_revenue': '10-30% de facturacion',
  '30_50pct_revenue': '30-50% de facturacion',
  'mayor_50pct_revenue': 'Mayor al 50% de facturacion',
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
  'B2B': 'B2B (Empresas)',
  'B2C': 'B2C (Consumidor final)',
  'B2G': 'B2G (Gobierno)',
  'mixed': 'Mixto',
};

const ACTIVE_CLIENT_LABELS: Record<string, string> = {
  'menos_10': 'Menos de 10',
  '10_50': '10-50',
  '50_200': '50-200',
  '200_1000': '200-1,000',
  'mas_1000': 'Mas de 1,000',
};

const COMPETITOR_LABELS: Record<string, string> = {
  'menos_5': '1-5',
  '5_20': '5-20',
  '20_50': '20-50',
  'mas_50': 'Mas de 50',
};

const MARKET_POSITION_LABELS: Record<string, string> = {
  'lider': 'Lider del mercado',
  'top3': 'Top 3',
  'retador': 'Retador / medio',
  'nicho': 'Nicho especializado',
  'emergente': 'Entrante / emergente',
};

const DIGITALIZATION_LABELS: Record<string, string> = {
  'basico': 'Basico (Excel, email)',
  'intermedio': 'Intermedio (algunas herramientas cloud)',
  'avanzado': 'Avanzado (sistemas integrados)',
  'transformacion_digital': 'Transformacion digital (IA, automatizacion)',
};

const LEADERSHIP_TENURE_LABELS: Record<string, string> = {
  'menos_1': 'Menos de 1 anio',
  '1_3': '1-3 anios',
  '3_5': '3-5 anios',
  '5_10': '5-10 anios',
  'mas_10': 'Mas de 10 anios',
};

const CEO_GENERATION_LABELS: Record<string, string> = {
  'first': 'Primera generacion (fundador)',
  'succession': 'Sucesion (segunda generacion o posterior)',
};

const FUNCTIONAL_AREAS_LABELS: Record<string, string> = {
  'finanzas': 'Finanzas',
  'operaciones': 'Operaciones',
  'ventas': 'Ventas/Comercial',
  'marketing': 'Marketing',
  'rh': 'Recursos Humanos',
  'tecnologia': 'Tecnologia/TI',
  'legal': 'Legal',
  'produccion': 'Produccion',
};

const CEO_ROLES_LABELS: Record<string, string> = {
  'ceo': 'Director General (CEO)',
  'accionista': 'Accionista',
  'consejero': 'Miembro del Consejo',
  'presidente_consejo': 'Presidente del Consejo',
  'director_area': 'Director de area funcional',
  'fundador': 'Fundador',
};

// ============================================================
// HELPER
// ============================================================

function displayValue(val: unknown, labelMap?: Record<string, string>): string {
  if (val === null || val === undefined || val === '') return '---';
  if (typeof val === 'boolean') return val ? 'Si' : 'No';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return '---';
    return val.map(v => labelMap?.[v] || v).join(', ');
  }
  if (typeof val === 'string' && labelMap && labelMap[val]) return labelMap[val];
  return String(val);
}

// ============================================================
// SECTION TYPES
// ============================================================

type FieldType = 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'multi_select' | 'percentage';

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  labelMap?: Record<string, string>;
  placeholder?: string;
  conditional?: { key: string; value: unknown };
  detailKey?: string;
  detailPlaceholder?: string;
  maxLength?: number;
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: FieldDef[];
  source: 'profile' | 'config';
}

// ============================================================
// SECTIONS DEFINITION
// ============================================================

const SECTIONS: SectionDef[] = [
  {
    id: 'identity',
    title: 'Identidad y estructura',
    icon: <Building2 className="h-4 w-4" />,
    source: 'profile',
    fields: [
      { key: 'legal_name', label: 'Nombre legal', type: 'text', placeholder: 'Ej: Tecnologia Avanzada S.A. de C.V.' },
      { key: 'founding_year', label: 'Anio de fundacion', type: 'number', placeholder: 'Ej: 2015' },
      { key: 'sector', label: 'Sector / industria', type: 'text', placeholder: 'Ej: Tecnologia, Manufactura' },
      { key: 'specific_activity', label: 'Giro especifico', type: 'text', placeholder: 'Ej: Desarrollo de software para PyMEs' },
      {
        key: 'employee_range', label: 'Numero de empleados', type: 'select', labelMap: EMPLOYEE_RANGE_LABELS,
        options: [
          { value: '1_10', label: '1-10' },
          { value: '11_50', label: '11-50' },
          { value: '51_200', label: '51-200' },
          { value: '201_500', label: '201-500' },
          { value: '501_1000', label: '501-1,000' },
          { value: 'mas_1000', label: 'Mas de 1,000' },
        ],
      },
      { key: 'main_office_location', label: 'Ubicacion principal', type: 'text', placeholder: 'Ej: CDMX, Col. Polanco' },
      { key: 'multi_location', label: 'Opera en multiples ubicaciones', type: 'boolean' },
      {
        key: 'society_type', label: 'Tipo de sociedad', type: 'select', labelMap: SOCIETY_TYPE_LABELS,
        options: [
          { value: 'SA', label: 'S.A.' },
          { value: 'SA_de_CV', label: 'S.A. de C.V.' },
          { value: 'SAPI', label: 'SAPI' },
          { value: 'SAPI_de_CV', label: 'SAPI de C.V.' },
          { value: 'SRL', label: 'S. de R.L.' },
          { value: 'SC', label: 'S.C.' },
          { value: 'SAS', label: 'S.A.S.' },
          { value: 'AC', label: 'A.C.' },
          { value: 'persona_fisica', label: 'Persona fisica' },
          { value: 'otra', label: 'Otra' },
        ],
      },
    ],
  },
  {
    id: 'governance',
    title: 'Gobierno corporativo',
    icon: <Shield className="h-4 w-4" />,
    source: 'profile',
    fields: [
      { key: 'has_formal_board', label: 'Consejo de administracion formal', type: 'boolean' },
      { key: 'board_member_count', label: 'Miembros del consejo', type: 'number', placeholder: 'Ej: 5', conditional: { key: 'has_formal_board', value: true } },
      { key: 'ceo_is_shareholder', label: 'CEO es accionista', type: 'boolean' },
      { key: 'ceo_shareholder_pct', label: '% de participacion del CEO', type: 'percentage', placeholder: 'Ej: 60', conditional: { key: 'ceo_is_shareholder', value: true } },
      { key: 'ceo_is_board_president', label: 'CEO es presidente del consejo', type: 'boolean' },
      { key: 'shareholder_count', label: 'Numero de accionistas', type: 'number', placeholder: 'Ej: 3' },
      { key: 'shareholders_in_operations', label: 'Accionistas que operan en la empresa', type: 'boolean' },
      { key: 'has_regular_assembly', label: 'Asamblea con reuniones periodicas', type: 'boolean' },
      { key: 'family_in_leadership', label: 'Familia en posiciones directivas', type: 'boolean' },
      { key: 'has_family_protocol', label: 'Protocolo familiar existente', type: 'boolean', conditional: { key: 'family_in_leadership', value: true } },
    ],
  },
  {
    id: 'team',
    title: 'Equipo directivo',
    icon: <Users className="h-4 w-4" />,
    source: 'profile',
    fields: [
      { key: 'direct_reports_count', label: 'Reportes directos al CEO', type: 'number', placeholder: 'Ej: 6' },
      {
        key: 'functional_areas_reporting', label: 'Areas que reportan al CEO', type: 'multi_select', labelMap: FUNCTIONAL_AREAS_LABELS,
        options: [
          { value: 'finanzas', label: 'Finanzas' },
          { value: 'operaciones', label: 'Operaciones' },
          { value: 'ventas', label: 'Ventas/Comercial' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'rh', label: 'Recursos Humanos' },
          { value: 'tecnologia', label: 'Tecnologia/TI' },
          { value: 'legal', label: 'Legal' },
          { value: 'produccion', label: 'Produccion' },
        ],
      },
      { key: 'has_coo', label: 'Existe COO / Director Adjunto', type: 'boolean' },
      { key: 'has_cfo', label: 'Existe CFO / Dir. Finanzas', type: 'boolean' },
      {
        key: 'avg_leadership_tenure', label: 'Antiguedad promedio del equipo', type: 'select', labelMap: LEADERSHIP_TENURE_LABELS,
        options: [
          { value: 'menos_1', label: 'Menos de 1 anio' },
          { value: '1_3', label: '1-3 anios' },
          { value: '3_5', label: '3-5 anios' },
          { value: '5_10', label: '5-10 anios' },
          { value: 'mas_10', label: 'Mas de 10 anios' },
        ],
      },
      { key: 'ceo_leads_functional_area', label: 'CEO lidera un area funcional', type: 'boolean' },
    ],
  },
  {
    id: 'finance',
    title: 'Salud financiera',
    icon: <DollarSign className="h-4 w-4" />,
    source: 'profile',
    fields: [
      {
        key: 'revenue_range', label: 'Facturacion anual (MXN)', type: 'select', labelMap: REVENUE_RANGE_LABELS,
        options: [
          { value: 'menos_5M', label: 'Menos de $5M' },
          { value: '5M_20M', label: '$5M - $20M' },
          { value: '20M_50M', label: '$20M - $50M' },
          { value: '50M_100M', label: '$50M - $100M' },
          { value: '100M_500M', label: '$100M - $500M' },
          { value: 'mas_500M', label: 'Mas de $500M' },
        ],
      },
      {
        key: 'revenue_trend', label: 'Tendencia de ingresos (3 anios)', type: 'select', labelMap: REVENUE_TREND_LABELS,
        options: [
          { value: 'crecimiento_acelerado', label: 'Crecimiento acelerado (+20% anual)' },
          { value: 'crecimiento_estable', label: 'Crecimiento estable (5-20% anual)' },
          { value: 'estancado', label: 'Estancado' },
          { value: 'decreciendo', label: 'Decreciendo' },
        ],
      },
      { key: 'is_profitable', label: 'Empresa rentable actualmente', type: 'boolean' },
      { key: 'has_significant_debt', label: 'Deuda financiera significativa', type: 'boolean' },
      {
        key: 'debt_range', label: 'Nivel de deuda vs facturacion', type: 'select', labelMap: DEBT_RANGE_LABELS,
        conditional: { key: 'has_significant_debt', value: true },
        options: [
          { value: 'menor_10pct_revenue', label: 'Menor al 10%' },
          { value: '10_30pct_revenue', label: '10-30%' },
          { value: '30_50pct_revenue', label: '30-50%' },
          { value: 'mayor_50pct_revenue', label: 'Mayor al 50%' },
        ],
      },
      { key: 'main_revenue_source', label: 'Principal fuente de ingresos', type: 'text', placeholder: 'Ej: Venta de licencias de software' },
      { key: 'main_revenue_pct', label: '% del ingreso total que representa', type: 'percentage', placeholder: 'Ej: 70' },
      { key: 'single_client_dependency', label: 'Dependencia de un solo cliente (>30%)', type: 'boolean' },
      { key: 'dependency_pct', label: '% de dependencia del cliente principal', type: 'percentage', placeholder: 'Ej: 45', conditional: { key: 'single_client_dependency', value: true } },
      { key: 'has_external_investors', label: 'Inversionistas externos o VC', type: 'boolean' },
      { key: 'seeking_financing', label: 'Buscando financiamiento activamente', type: 'boolean' },
    ],
  },
  {
    id: 'market',
    title: 'Mercado y competencia',
    icon: <Globe className="h-4 w-4" />,
    source: 'profile',
    fields: [
      {
        key: 'client_type', label: 'Tipo de cliente principal', type: 'select', labelMap: CLIENT_TYPE_LABELS,
        options: [
          { value: 'B2B', label: 'B2B (Empresas)' },
          { value: 'B2C', label: 'B2C (Consumidor final)' },
          { value: 'B2G', label: 'B2G (Gobierno)' },
          { value: 'mixed', label: 'Mixto' },
        ],
      },
      {
        key: 'active_client_count_range', label: 'Clientes activos', type: 'select', labelMap: ACTIVE_CLIENT_LABELS,
        options: [
          { value: 'menos_10', label: 'Menos de 10' },
          { value: '10_50', label: '10-50' },
          { value: '50_200', label: '50-200' },
          { value: '200_1000', label: '200-1,000' },
          { value: 'mas_1000', label: 'Mas de 1,000' },
        ],
      },
      { key: 'operates_in_regulated_market', label: 'Opera en mercado regulado', type: 'boolean' },
      { key: 'regulated_market_detail', label: 'Detalle de regulacion', type: 'text', placeholder: 'Ej: Sector salud (COFEPRIS)', conditional: { key: 'operates_in_regulated_market', value: true } },
      {
        key: 'competitor_count_range', label: 'Competidores directos', type: 'select', labelMap: COMPETITOR_LABELS,
        options: [
          { value: 'menos_5', label: '1-5' },
          { value: '5_20', label: '5-20' },
          { value: '20_50', label: '20-50' },
          { value: 'mas_50', label: 'Mas de 50' },
        ],
      },
      {
        key: 'market_position', label: 'Posicion en el mercado', type: 'select', labelMap: MARKET_POSITION_LABELS,
        options: [
          { value: 'lider', label: 'Lider del mercado' },
          { value: 'top3', label: 'Top 3' },
          { value: 'retador', label: 'Retador / medio' },
          { value: 'nicho', label: 'Nicho especializado' },
          { value: 'emergente', label: 'Entrante / emergente' },
        ],
      },
      { key: 'exports_internationally', label: 'Exporta o tiene clientes internacionales', type: 'boolean' },
      { key: 'international_pct', label: '% de ingresos internacionales', type: 'percentage', placeholder: 'Ej: 25', conditional: { key: 'exports_internationally', value: true } },
      { key: 'considering_new_markets', label: 'Considerando nuevos mercados', type: 'boolean' },
    ],
  },
  {
    id: 'operations',
    title: 'Operaciones y tecnologia',
    icon: <Cpu className="h-4 w-4" />,
    source: 'profile',
    fields: [
      { key: 'has_manufacturing', label: 'Operaciones de manufactura', type: 'boolean' },
      {
        key: 'digitalization_level', label: 'Nivel de digitalizacion', type: 'select', labelMap: DIGITALIZATION_LABELS,
        options: [
          { value: 'basico', label: 'Basico (Excel, email)' },
          { value: 'intermedio', label: 'Intermedio (herramientas cloud)' },
          { value: 'avanzado', label: 'Avanzado (sistemas integrados)' },
          { value: 'transformacion_digital', label: 'Transformacion digital (IA)' },
        ],
      },
      { key: 'uses_integrated_systems', label: 'Usa ERP, CRM u otros sistemas', type: 'boolean' },
      { key: 'integrated_systems_detail', label: 'Detalle de sistemas', type: 'text', placeholder: 'Ej: SAP, Salesforce, Odoo', conditional: { key: 'uses_integrated_systems', value: true } },
      { key: 'has_internal_it', label: 'Equipo de TI interno', type: 'boolean' },
      { key: 'it_team_size', label: 'Tamanio del equipo de TI', type: 'number', placeholder: 'Ej: 5', conditional: { key: 'has_internal_it', value: true } },
      { key: 'uses_ai', label: 'Usa herramientas de IA', type: 'boolean' },
      { key: 'ai_detail', label: 'Detalle de IA', type: 'text', placeholder: 'Ej: ChatGPT para ventas', conditional: { key: 'uses_ai', value: true } },
    ],
  },
  {
    id: 'ceo',
    title: 'Perfil del CEO',
    icon: <UserCircle className="h-4 w-4" />,
    source: 'profile',
    fields: [
      { key: 'ceo_years_in_role', label: 'Anios en el puesto', type: 'number', placeholder: 'Ej: 5' },
      { key: 'ceo_is_founder', label: 'Es fundador de la empresa', type: 'boolean' },
      {
        key: 'ceo_generation', label: 'Generacion', type: 'select', labelMap: CEO_GENERATION_LABELS,
        options: [
          { value: 'first', label: 'Primera generacion (fundador)' },
          { value: 'succession', label: 'Sucesion (2da generacion+)' },
        ],
      },
      {
        key: 'ceo_simultaneous_roles', label: 'Roles simultaneos', type: 'multi_select', labelMap: CEO_ROLES_LABELS,
        options: [
          { value: 'ceo', label: 'Director General (CEO)' },
          { value: 'accionista', label: 'Accionista' },
          { value: 'consejero', label: 'Miembro del Consejo' },
          { value: 'presidente_consejo', label: 'Presidente del Consejo' },
          { value: 'director_area', label: 'Director de area funcional' },
          { value: 'fundador', label: 'Fundador' },
        ],
      },
      { key: 'ceo_education', label: 'Formacion academica', type: 'text', placeholder: 'Ej: MBA IPADE, Ing. Industrial ITESM' },
      { key: 'ceo_prior_experience', label: 'Experiencia como CEO en otras empresas', type: 'text', placeholder: 'Ej: Si, dirigi una empresa de logistica 3 anios' },
      { key: 'ceo_on_other_boards', label: 'Participa en consejos de otras empresas', type: 'boolean' },
    ],
  },
  {
    id: 'context',
    title: 'Contexto libre',
    icon: <FileText className="h-4 w-4" />,
    source: 'config',
    fields: [
      {
        key: 'company_context',
        label: 'Descripcion libre de tu empresa',
        type: 'textarea',
        placeholder: 'Describe tu empresa, industria, modelo de negocio, estructura, retos actuales...',
        maxLength: 5000,
      },
    ],
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function CompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({});
  const [companyContext, setCompanyContext] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/company');
      const json = await res.json();
      if (!json.success) {
        if (res.status === 401) {
          router.replace('/login');
          return;
        }
        toast.error(json.error || 'Error al cargar los datos');
        return;
      }
      setProfile(json.data.profile || {});
      setCompanyContext(json.data.company_context || '');
    } catch {
      toast.error('Error de conexion al cargar los datos de tu empresa');
    } finally {
      setLoading(false);
    }
  }

  function startEditing(sectionId: string) {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    const data: Record<string, unknown> = {};
    for (const field of section.fields) {
      if (section.source === 'config' && field.key === 'company_context') {
        data[field.key] = companyContext;
      } else {
        data[field.key] = (profile as Record<string, unknown>)[field.key] ?? (field.type === 'boolean' ? false : field.type === 'multi_select' ? [] : '');
      }
    }
    setEditData(data);
    setEditingSection(sectionId);
  }

  function cancelEditing() {
    setEditingSection(null);
    setEditData({});
  }

  async function saveSection(sectionId: string) {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of section.fields) {
        const val = editData[field.key];
        if (val !== undefined) {
          payload[field.key] = val;
        }
      }

      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        // Update local state
        if (section.source === 'config' && payload.company_context !== undefined) {
          setCompanyContext(payload.company_context as string);
        }
        if (section.source === 'profile') {
          setProfile(prev => ({ ...prev, ...payload }));
        }
        toast.success('Cambios guardados correctamente');
        setEditingSection(null);
        setEditData({});
      } else {
        toast.error(json.error || 'Error al guardar los cambios');
      }
    } catch {
      toast.error('Error de conexion al guardar');
    } finally {
      setSaving(false);
    }
  }

  function getFieldValue(field: FieldDef, sectionSource: string): unknown {
    if (sectionSource === 'config' && field.key === 'company_context') {
      return companyContext;
    }
    return (profile as Record<string, unknown>)[field.key];
  }

  function isFieldVisible(field: FieldDef, data: Record<string, unknown>): boolean {
    if (!field.conditional) return true;
    return data[field.conditional.key] === field.conditional.value;
  }

  function handleEditFieldChange(key: string, value: unknown) {
    setEditData(prev => ({ ...prev, [key]: value }));
  }

  function toggleMultiSelect(key: string, optionValue: string) {
    const current = (editData[key] as string[]) || [];
    if (current.includes(optionValue)) {
      handleEditFieldChange(key, current.filter(v => v !== optionValue));
    } else {
      handleEditFieldChange(key, [...current, optionValue]);
    }
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-all';

  if (loading) {
    return (
      <div className="text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold mb-6">Perfil de la empresa</h1>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-white/[0.04] border border-white/[0.06]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasProfile = profile && Object.keys(profile).length > 0;

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Perfil de la empresa</h1>
          <p className="text-sm text-white/50 mt-1">
            Revisa y actualiza los datos de tu empresa. Esta informacion alimenta las recomendaciones de ARES.
          </p>
        </div>

        {!hasProfile && (
          <div className="border border-white/[0.10] bg-white/[0.04] rounded-xl p-8 text-center space-y-3">
            <Building2 className="h-8 w-8 text-white/30 mx-auto" />
            <p className="text-sm text-white/60">
              Aun no tienes un perfil de empresa. Completa el onboarding para comenzar.
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all cursor-pointer"
            >
              Ir al onboarding
            </button>
          </div>
        )}

        {SECTIONS.map(section => {
          const isEditing = editingSection === section.id;

          // For config sections, always show; for profile sections, only show if profile exists
          if (section.source === 'profile' && !hasProfile) return null;

          return (
            <div
              key={section.id}
              className="border border-white/[0.10] bg-white/[0.03] rounded-xl p-6 space-y-4 backdrop-blur-sm"
            >
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="text-white/60">{section.icon}</div>
                  <h2 className="text-sm font-semibold text-white">{section.title}</h2>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => startEditing(section.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.15] text-white/60 text-xs font-medium hover:bg-white/[0.06] hover:text-white hover:border-white/25 transition-all cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.15] text-white/50 text-xs font-medium hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer disabled:opacity-30"
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveSection(section.id)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all cursor-pointer disabled:opacity-30"
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Fields */}
              {isEditing ? (
                <div className="space-y-4">
                  {section.fields.map(field => {
                    if (!isFieldVisible(field, editData)) return null;

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs text-white/60 font-medium">{field.label}</label>

                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={(editData[field.key] as string) || ''}
                            onChange={e => handleEditFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={inputClass}
                          />
                        )}

                        {field.type === 'number' && (
                          <input
                            type="number"
                            value={(editData[field.key] as number) ?? ''}
                            onChange={e => handleEditFieldChange(field.key, e.target.value ? Number(e.target.value) : null)}
                            placeholder={field.placeholder}
                            className={inputClass}
                          />
                        )}

                        {field.type === 'percentage' && (
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={(editData[field.key] as number) ?? ''}
                              onChange={e => handleEditFieldChange(field.key, e.target.value ? Number(e.target.value) : null)}
                              placeholder={field.placeholder}
                              className={inputClass}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
                          </div>
                        )}

                        {field.type === 'select' && (
                          <select
                            value={(editData[field.key] as string) || ''}
                            onChange={e => handleEditFieldChange(field.key, e.target.value || null)}
                            className={`${inputClass} appearance-none`}
                          >
                            <option value="">Selecciona una opcion</option>
                            {field.options?.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-[#1a1f2e] text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'boolean' && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditFieldChange(field.key, true)}
                              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                editData[field.key] === true
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08]'
                              }`}
                            >
                              Si
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditFieldChange(field.key, false)}
                              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                editData[field.key] === false
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08]'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        )}

                        {field.type === 'multi_select' && (
                          <div className="flex flex-wrap gap-2">
                            {field.options?.map(opt => {
                              const selected = ((editData[field.key] as string[]) || []).includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => toggleMultiSelect(field.key, opt.value)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    selected
                                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08]'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {field.type === 'textarea' && (
                          <div className="space-y-1">
                            <textarea
                              rows={6}
                              value={(editData[field.key] as string) || ''}
                              onChange={e => {
                                if (!field.maxLength || e.target.value.length <= field.maxLength) {
                                  handleEditFieldChange(field.key, e.target.value);
                                }
                              }}
                              placeholder={field.placeholder}
                              className={`${inputClass} resize-none`}
                            />
                            {field.maxLength && (
                              <div className="flex justify-end">
                                <span className={`text-xs ${
                                  ((editData[field.key] as string) || '').length > (field.maxLength * 0.9)
                                    ? 'text-amber-400'
                                    : 'text-white/25'
                                }`}>
                                  {((editData[field.key] as string) || '').length}/{field.maxLength.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map(field => {
                    const val = getFieldValue(field, section.source);

                    // Hide conditional fields when condition not met
                    if (field.conditional) {
                      const condVal = getFieldValue(
                        { key: field.conditional.key } as FieldDef,
                        section.source
                      );
                      if (condVal !== field.conditional.value) return null;
                    }

                    // Textarea spans full width
                    const isTextarea = field.type === 'textarea';

                    return (
                      <div
                        key={field.key}
                        className={isTextarea ? 'sm:col-span-2' : ''}
                      >
                        <p className="text-xs text-white/40 mb-0.5">{field.label}</p>
                        {isTextarea ? (
                          <p className="text-sm text-white/80 whitespace-pre-wrap">
                            {displayValue(val)}
                          </p>
                        ) : (
                          <p className="text-sm text-white/80">
                            {field.type === 'percentage' && val !== null && val !== undefined && val !== ''
                              ? `${val}%`
                              : displayValue(val, field.labelMap)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div className="pb-8" />
      </div>
    </div>
  );
}
