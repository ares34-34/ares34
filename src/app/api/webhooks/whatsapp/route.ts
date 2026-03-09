import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { processMessagingIntent } from '@/lib/modules-engine';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify Twilio webhook signature
function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  const sortedKeys = Object.keys(params).sort();
  let dataString = url;
  for (const key of sortedKeys) {
    dataString += key + params[key];
  }
  const hmac = crypto.createHmac('sha1', authToken);
  hmac.update(dataString);
  const computed = hmac.digest('base64');
  return computed === signature;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Verify Twilio signature
    const signature = request.headers.get('x-twilio-signature') || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (authToken && signature) {
      const url = request.url;
      if (!verifyTwilioSignature(url, params, signature, authToken)) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const from = params['From'] || ''; // whatsapp:+521234567890
    const body = params['Body'] || '';

    if (!from || !body) {
      return twimlResponse('No se recibió mensaje.');
    }

    // Extract phone number from "whatsapp:+52..."
    const phone = from.replace('whatsapp:', '').trim();

    // Look up user by phone
    const supabase = createAdminClient();
    const { data: connection } = await supabase
      .from('messaging_connections')
      .select('user_id, status')
      .eq('channel', 'whatsapp')
      .eq('external_id', phone)
      .single();

    if (!connection || connection.status !== 'verified') {
      return twimlResponse(
        'Tu número no está conectado a ARES34. Conéctalo desde la sección Conexiones en tu cuenta.'
      );
    }

    // Process the message
    const reply = await processMessagingIntent(connection.user_id, body);
    return twimlResponse(reply);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return twimlResponse('Ocurrió un error. Intenta de nuevo.');
  }
}

function twimlResponse(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
