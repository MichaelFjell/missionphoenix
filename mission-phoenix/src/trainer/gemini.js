// BYOK Google Gemini client. Streams via SSE using raw fetch — no SDK dependency.
// Key lives in localStorage and is sent only to generativelanguage.googleapis.com.
//
// Models (per Google's Mar-2026 naming refresh):
//   primary  = gemini-3-flash-preview        (free tier; preferred)
//   fallback = gemini-3.1-flash-lite-preview (most generous free-tier as of 2026-05)
//
// On a 429 from the primary, the same call is retried with the fallback model
// before any text has been streamed to the caller — onChunk never sees a duplicate.

import { getGeminiKey } from './store.js';

export const PRIMARY_MODEL = 'gemini-3-flash-preview';
export const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';
export const MODEL = PRIMARY_MODEL;

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Convert our internal Anthropic-shaped messages to Gemini's contents shape.
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

function isQuotaError(err) {
  // Status 429 surfaces in our error.message, e.g. "Gemini API 429: ..."
  return err && /\b429\b/.test(err.message || '');
}

async function completeWithModel(model, { system, messages, max_tokens }) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key set');
  const url = `${BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
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

async function streamWithModel(model, { system, messages, max_tokens, onChunk, signal }) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key set');
  const url = `${BASE}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
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

export async function complete(opts) {
  try {
    return await completeWithModel(PRIMARY_MODEL, opts);
  } catch (e) {
    if (!isQuotaError(e)) throw e;
    // 429 quota — primary exhausted. Try the fallback model with the same payload.
    console.warn(`Gemini ${PRIMARY_MODEL} quota hit, falling back to ${FALLBACK_MODEL}`);
    return await completeWithModel(FALLBACK_MODEL, opts);
  }
}

export async function stream(opts) {
  // Try primary first. The fetch either succeeds (and we begin streaming)
  // or throws before any onChunk is called (status check happens before the
  // body reader runs), so the fallback can safely retry without dupes.
  try {
    return await streamWithModel(PRIMARY_MODEL, opts);
  } catch (e) {
    if (!isQuotaError(e)) throw e;
    console.warn(`Gemini ${PRIMARY_MODEL} quota hit, falling back to ${FALLBACK_MODEL}`);
    return await streamWithModel(FALLBACK_MODEL, opts);
  }
}
