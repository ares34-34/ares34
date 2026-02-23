// ARES34 - Interfaces del sistema

export type RouteLevel = 'CEO_LEVEL' | 'BOARD_LEVEL' | 'ASSEMBLY_LEVEL';

export type ArchetypeType = 'board_default' | 'archetype' | 'assembly';

export interface ARESClassification {
  level: RouteLevel;
  reasoning: string;
  confidence: number;
  complexity: string;
}

export interface UserConfig {
  id: string;
  user_id: string;
  ceo_kpi_1: string;
  ceo_kpi_2: string;
  ceo_kpi_3: string;
  ceo_inspiration: string;
  ceo_main_goal: string;
  custom_board_archetype_id: string | null;
  onboarding_completed: boolean;
  company_context: string;
}

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

export interface Perspective {
  role: string;
  name: string;
  response: string;
}

export interface Deliberation {
  id: string;
  conversation_id: string;
  perspectives: Perspective[];
  recommendation: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  question: string;
  route_level: RouteLevel;
  route_reasoning: string;
  route_confidence: number;
  route_complexity: string;
  created_at: string;
  deliberation?: Deliberation;
}

export interface ARESResponse {
  conversationId: string;
  level: RouteLevel;
  perspectives: Perspective[];
  recommendation: string;
  classification: ARESClassification;
  plan: string;
}

export interface Archetype {
  id: string;
  name: string;
  type: ArchetypeType;
  description: string;
  philosophy: string;
  prompt_key: string;
}
