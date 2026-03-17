import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserConfig } from '@/lib/supabase';
import { generateContract } from '@/lib/modules-engine';
import type { ContractType } from '@/lib/types';

const VALID_TYPES: ContractType[] = ['nda', 'servicios', 'laboral', 'arrendamiento', 'sociedad', 'proveedor'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const config = await getUserConfig(user.id);
    if (!config?.onboarding_completed && !config?.onboarding_v2_completed) {
      return NextResponse.json(
        { error: 'Necesitas completar tu configuración primero' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { contract_type, prompt } = body;

    if (!contract_type || !VALID_TYPES.includes(contract_type)) {
      return NextResponse.json(
        { error: 'Tipo de contrato inválido.' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Describe lo que necesitas con al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 5,000 caracteres.' },
        { status: 400 }
      );
    }

    const result = await generateContract(user.id, contract_type, prompt.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generando contrato:', error);
    return NextResponse.json(
      { error: 'Error al generar el contrato. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
