import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { prepareMeeting } from '@/lib/modules-engine';
import type { MeetingType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { meeting_topic, meeting_type, attendees, additional_context } = body;

    if (!meeting_topic || typeof meeting_topic !== 'string' || meeting_topic.trim().length < 5) {
      return NextResponse.json(
        { error: 'Describe el tema de la reunión con al menos 5 caracteres.' },
        { status: 400 }
      );
    }

    const validTypes: MeetingType[] = ['board', 'investor', 'team', 'client', 'vendor', 'partner', 'general'];
    const type: MeetingType = validTypes.includes(meeting_type) ? meeting_type : 'general';

    const result = await prepareMeeting(
      user.id,
      meeting_topic.trim(),
      type,
      attendees,
      additional_context
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error preparando reunión:', error);
    return NextResponse.json(
      { error: 'Error al preparar el brief de la reunión. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
