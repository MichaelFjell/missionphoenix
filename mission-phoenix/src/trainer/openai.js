// BYOK OpenAI client. Streams via SSE using raw fetch — no SDK dependency.
// Key lives in localStorage and is sent only to api.openai.com.

import { getOpenAIKey } from './store.js';

export const MODEL = 'gpt-5';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Convert our internal Anthropic-shaped messages to OpenAI shape.
function toOpenAIMessages(system, messages) {
  const out = [];
  if (system) out.push({ role: 'system', content: system });
  for (const m of messages || []) {
    out.push({ role: m.role, content: m.content });
  }
  return out;
}

export async function complete({ system, messages, max_tokens = 1024 }) {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('No OpenAI API key set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: toOpenAIMessages(system, messages),
      max_completion_tokens: max_tokens,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`OpenAI API ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function stream({ system, messages, max_tokens = 1024, onChunk, signal }) {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('No OpenAI API key set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: toOpenAIMessages(system, messages),
      max_completion_tokens: max_tokens,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    const t = res.body ? await res.text().catch(() => '') : '';
    throw new Error(`OpenAI API ${res.status}: ${t.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const event = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const dataLine = event.split('\n').find(l => l.startsWith('data: '));
      if (!dataLine) continue;
      const payload = dataLine.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const obj = JSON.parse(payload);
        const delta = obj.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onChunk?.(delta);
        }
      } catch {}
    }
  }
  return full;
}
