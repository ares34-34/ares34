const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model setup: fast model for agent perspectives, critical model for classification + synthesis
// Both default to Claude since Kimi is too slow (~55s per call) and exceeds Vercel's 60s timeout
const MODEL_FAST = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.5';
const MODEL_CRITICAL = process.env.OPENROUTER_MODEL_CRITICAL || 'anthropic/claude-sonnet-4.5';

const DEFAULT_MAX_TOKENS = 1024;
const TIMEOUT_MS = 60000;

async function callModel(
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'ARES34',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      const content = data.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim().length > 0) {
        return content;
      }

      // Some reasoning models put all output in reasoning_content — use as fallback
      const reasoning = data.choices?.[0]?.message?.reasoning;
      if (typeof reasoning === 'string' && reasoning.trim().length > 0 && (!content || content.trim().length === 0)) {
        const finishReason = data.choices?.[0]?.finish_reason;
        if (finishReason === 'length') {
          throw new Error('Respuesta cortada: el modelo necesita más tokens (finish_reason=length)');
        }
        return reasoning;
      }

      throw new Error('Respuesta inesperada de la API: content vacío');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error('Error al llamar a la API');
}

// Fast model — for agent perspectives (Board/Assembly/CEO agents)
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<string> {
  return callModel(MODEL_FAST, systemPrompt, userMessage, maxTokens);
}

// Critical model — for Manager classification and Synthesizer
export async function callClaudeCritical(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<string> {
  return callModel(MODEL_CRITICAL, systemPrompt, userMessage, maxTokens);
}
