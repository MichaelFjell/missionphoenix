// BYOK Google Gemini client. Streams via SSE using raw fetch — no SDK dependency.
// Key lives in localStorage and is sent only to generativelanguage.googleapis.com.

import { getGeminiKey } from './store.js';

export const MODEL = 'gemini-2.5-pro';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Convert our internal Anthropic-shaped messages to Gemini's contents shape.
// Gemini uses 'user' and 'model' roles.
function toGeminiContents(messages) {
  return (messages || []).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

function buildBody({ system, messages, max_tokens }) {
  const body = {
    contents: toGeminiContents(messages),
    generationConfig: { maxOutputTokens: max_tokens },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }
  return body;
}

export async function complete({ system, messages, max_tokens = 1024 }) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key set');
  const url = `${BASE}/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(buildBody({ system, messages, max_tokens })),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('');
}

export async function stream({ system, messages, max_tokens = 1024, onChunk, signal }) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key set');
  const url = `${BASE}/${MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(buildBody({ system, messages, max_tokens })),
  });
  if (!res.ok || !res.body) {
    const t = res.body ? await res.text().catch(() => '') : '';
    throw new Error(`Gemini API ${res.status}: ${t.slice(0, 300)}`);
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
      if (!payload) continue;
      try {
        const obj = JSON.parse(payload);
        const parts = obj.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.text) {
            full += p.text;
            onChunk?.(p.text);
          }
        }
      } catch {}
    }
  }
  return full;
}
