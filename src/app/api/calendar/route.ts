import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/modules-engine';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Se requieren parámetros start y end.' },
        { status: 400 }
      );
    }

    const events = await getCalendarEvents(user.id, startDate, endDate);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, start_time, end_time, all_day, color } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json(
        { error: 'El título es obligatorio.' },
        { status: 400 }
      );
    }

    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: 'Se requieren fecha de inicio y fin.' },
        { status: 400 }
      );
    }

    const event = await createCalendarEvent(user.id, {
      title: title.trim(),
      description,
      start_time,
      end_time,
      all_day,
      color,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error creando evento:', error);
    return NextResponse.json(
      { error: 'Error al crear el evento.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del evento.' },
        { status: 400 }
      );
    }

    const event = await updateCalendarEvent(user.id, id, updates);
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el evento.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del evento.' },
        { status: 400 }
      );
    }

    await deleteCalendarEvent(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el evento.' },
      { status: 500 }
    );
  }
}
