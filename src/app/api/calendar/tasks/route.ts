import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getCalendarTasks,
  createCalendarTask,
  updateCalendarTask,
  deleteCalendarTask,
  scheduleTask,
  snoozeTask,
} from '@/lib/modules-engine';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('completed') === 'true';

    const tasks = await getCalendarTasks(user.id, includeCompleted);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas.' },
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
    const { title, description, priority, due_date, label } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json(
        { error: 'El título es obligatorio.' },
        { status: 400 }
      );
    }

    const task = await createCalendarTask(user.id, {
      title: title.trim(),
      description,
      priority,
      due_date,
      label,
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error creando tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear la tarea.' },
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
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarea.' },
        { status: 400 }
      );
    }

    let task;

    if (action === 'schedule' && updates.scheduled_start && updates.scheduled_end) {
      task = await scheduleTask(user.id, id, updates.scheduled_start, updates.scheduled_end);
    } else if (action === 'snooze' && updates.snoozed_until) {
      task = await snoozeTask(user.id, id, updates.snoozed_until);
    } else {
      task = await updateCalendarTask(user.id, id, updates);
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la tarea.' },
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
        { error: 'Se requiere el ID de la tarea.' },
        { status: 400 }
      );
    }

    await deleteCalendarTask(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la tarea.' },
      { status: 500 }
    );
  }
}
