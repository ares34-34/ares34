import { NextRequest, NextResponse } from 'next/server';
import {
  createServerClient,
  getCompanyProfile,
  getCEOContextSnapshot,
  saveInitialDiagnostic,
  getInitialDiagnostic,
  saveUserConfig,
} from '@/lib/supabase';
import { callClaudeCritical } from '@/lib/anthropic';

const DIAGNOSTIC_SYSTEM_PROMPT = `Eres ARES, el sistema de inteligencia ejecutiva para CEOs de empresas mexicanas.

Tu tarea: Generar un diagnóstico inicial profundo basado en el perfil de la empresa y el contexto del CEO.

INSTRUCCIONES:
1. Analiza toda la información proporcionada sobre la empresa y su CEO
2. Genera cinco secciones de diagnóstico:
   - Radiografía Estructural: análisis de la estructura organizacional, gobierno corporativo y distribución de poder
   - Mapa de Conflictos de Rol: identifica dónde el CEO tiene roles superpuestos o conflictivos
   - Vulnerabilidades: riesgos, dependencias y debilidades que necesitan atención urgente
   - Fortalezas Ocultas: ventajas competitivas o activos que el CEO quizá no está aprovechando al máximo
   - Preguntas Estratégicas: las 3-5 preguntas más importantes que ARES debería ayudar a responder

3. Usa tuteo (tú), nunca "usted"
4. Contexto mexicano: referencias al SAT, IMSS, LFT, COFECE cuando aplique
5. Montos en pesos mexicanos ($X MXN)
6. Sé directo, sin rodeos. Este CEO quiere claridad, no halagos.

FORMATO DE RESPUESTA (JSON estricto):
{
  "structural_radiography": "Texto del análisis estructural (2-3 párrafos)",
  "role_conflict_map": "Texto del mapa de conflictos de rol (2-3 párrafos)",
  "vulnerabilities": "Texto de vulnerabilidades detectadas (2-3 párrafos)",
  "hidden_strengths": "Texto de fortalezas ocultas (2-3 párrafos)",
  "strategic_questions": "Texto con 3-5 preguntas estratégicas numeradas"
}

Responde SOLO con el JSON, sin texto adicional ni markdown.`;

export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    const diagnostic = await getInitialDiagnostic(user.id);
    return NextResponse.json({ success: true, data: diagnostic });
  } catch (error) {
    console.error('Error en GET /api/onboarding/diagnostic:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener tu diagnóstico' },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    // Read company profile and CEO context
    const [companyProfile, ceoContext] = await Promise.all([
      getCompanyProfile(user.id),
      getCEOContextSnapshot(user.id),
    ]);

    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Necesitas completar el perfil de tu empresa primero' },
        { status: 400 }
      );
    }

    if (!ceoContext) {
      return NextResponse.json(
        { success: false, error: 'Necesitas completar tu contexto de CEO primero' },
        { status: 400 }
      );
    }

    // Build user message with all context for Claude
    const userMessage = `PERFIL DE EMPRESA:
${JSON.stringify(companyProfile, null, 2)}

CONTEXTO DEL CEO:
${JSON.stringify(ceoContext, null, 2)}

Genera el diagnóstico inicial para este CEO y su empresa.`;

    // Call Claude to generate the diagnostic
    const rawResponse = await callClaudeCritical(
      DIAGNOSTIC_SYSTEM_PROMPT,
      userMessage,
      3072
    );

    // Parse Claude's JSON response
    let parsed: {
      structural_radiography: string;
      role_conflict_map: string;
      vulnerabilities: string;
      hidden_strengths: string;
      strategic_questions: string;
    };

    try {
      // Strip any markdown code fences if present
      const cleaned = rawResponse.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Error parseando respuesta de diagnóstico:', rawResponse);
      // Fallback: use the raw text as structural_radiography
      parsed = {
        structural_radiography: rawResponse,
        role_conflict_map: '',
        vulnerabilities: '',
        hidden_strengths: '',
        strategic_questions: '',
      };
    }

    // Save the diagnostic
    const diagnostic = await saveInitialDiagnostic(user.id, {
      structural_radiography: parsed.structural_radiography,
      role_conflict_map: parsed.role_conflict_map,
      vulnerabilities: parsed.vulnerabilities,
      hidden_strengths: parsed.hidden_strengths,
      strategic_questions: parsed.strategic_questions,
    });

    // Mark v2 onboarding as completed in user_config
    await saveUserConfig(user.id, {
      onboarding_completed: true,
      onboarding_v2_completed: true,
    });

    return NextResponse.json({ success: true, data: diagnostic });
  } catch (error) {
    console.error('Error en POST /api/onboarding/diagnostic:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar tu diagnóstico. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
