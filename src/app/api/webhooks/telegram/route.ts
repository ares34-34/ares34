import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processMessagingIntent } from '@/lib/modules-engine';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const supabase = createAdminClient();

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        'Bienvenido a ARES34.\n\nPara conectar tu cuenta, ve a *Conexiones* en tu panel de ARES34, agrega Telegram y envía aquí el código de verificación de 6 dígitos.'
      );
      return NextResponse.json({ ok: true });
    }

    // Check if this is a verification code (6 digits)
    if (/^\d{6}$/.test(text)) {
      const { data: connection } = await supabase
        .from('messaging_connections')
        .select('id, user_id, verification_code, verification_expires_at')
        .eq('channel', 'telegram')
        .eq('verification_code', text)
        .eq('status', 'pending')
        .single();

      if (!connection) {
        await sendTelegramMessage(chatId, 'Código inválido o expirado. Genera uno nuevo desde ARES34.');
        return NextResponse.json({ ok: true });
      }

      // Check expiry
      if (connection.verification_expires_at && new Date(connection.verification_expires_at) < new Date()) {
        await sendTelegramMessage(chatId, 'El código ha expirado. Genera uno nuevo desde ARES34.');
        return NextResponse.json({ ok: true });
      }

      // Verify: update external_id and status
      await supabase
        .from('messaging_connections')
        .update({
          external_id: chatId,
          status: 'verified',
          verification_code: null,
          verification_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);

      await sendTelegramMessage(
        chatId,
        'Tu cuenta de Telegram está conectada a ARES34.\n\nAhora puedes enviarme mensajes como:\n- "Agenda junta mañana a las 3pm"\n- "¿Qué tengo hoy?"'
      );
      return NextResponse.json({ ok: true });
    }

    // Regular message — look up verified connection
    const { data: connection } = await supabase
      .from('messaging_connections')
      .select('user_id, status')
      .eq('channel', 'telegram')
      .eq('external_id', chatId)
      .single();

    if (!connection || connection.status !== 'verified') {
      await sendTelegramMessage(
        chatId,
        'Tu Telegram no está conectado a ARES34. Conéctalo desde la sección Conexiones en tu cuenta.'
      );
      return NextResponse.json({ ok: true });
    }

    // Process the message
    const reply = await processMessagingIntent(connection.user_id, text);
    await sendTelegramMessage(chatId, reply);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always 200 for Telegram
  }
}
