// BYOK Claude API client. Streams via SSE using raw fetch — no SDK dependency.
// The key lives in localStorage (set in TrainerSettings) and is sent only to
// api.anthropic.com. Never send it to Mission Phoenix servers.

import { getApiKey } from './store.js';

export const MODEL = 'claude-sonnet-4-6';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const VERSION = '2023-06-01';

export const hasKey = () => !!getApiKey();

// Non-streaming. Returns the full text response.
export async function complete({ system, messages, max_tokens = 1024 }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL, max_tokens,
      system: system || undefined,
      messages,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Claude API ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return text;
}

// Streaming. Calls onChunk(text) for each delta. Returns the full text.
export async function stream({ system, messages, max_tokens = 1024, onChunk, signal }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL, max_tokens, stream: true,
      system: system || undefined,
      messages,
    }),
  });
  if (!res.ok || !res.body) {
    const t = res.body ? await res.text().catch(() => '') : '';
    throw new Error(`Claude API ${res.status}: ${t.slice(0, 300)}`);
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
      const payload = dataLine.slice(6);
      if (payload === '[DONE]') continue;
      try {
        const obj = JSON.parse(payload);
        if (obj.type === 'content_block_delta' && obj.delta?.type === 'text_delta') {
          full += obj.delta.text;
          onChunk?.(obj.delta.text);
        }
      } catch {}
    }
  }
  return full;
}

// ───────── Feature prompts ─────────

export function suggestSwapPrompt({ slot, recentLogs, reason }) {
  const tags = slot.exercise.tags?.join(', ') || '';
  const altList = (slot.alternatives || []).map(a => `- ${a.name} (${(a.tags || []).join(', ')})`).join('\n');
  const logs = (recentLogs || []).slice(0, 5).map(l =>
    `${l.date}: ${l.sets.map(s => `${s.reps}@${s.load_kg ?? '–'}kg`).join(', ')}`
  ).join('\n') || '(no recent logs)';
  return {
    system: 'You are a strength-training assistant. Be concise and practical. Output 1–3 alternatives in plain text — no markdown headers, no preamble. Each alternative on its own line, formatted as "Name — one-sentence rationale".',
    messages: [{
      role: 'user',
      content: `Suggest 1–3 swap alternatives for this exercise slot.

Current exercise: ${slot.exercise.name} (tags: ${tags})
Existing alternatives the user already has:
${altList || '(none)'}

Recent performance:
${logs}

Reason for swap: ${reason || '(no reason given — general suggestion)'}

Reply with 1–3 lines, each: "Exercise name — short rationale".`,
    }],
    max_tokens: 400,
  };
}

function readinessSuffix(w) {
  const r = w.readiness;
  if (!r || r.skipped) return '';
  const parts = [];
  if (Number.isFinite(r.sleep_quality)) parts.push(`S${r.sleep_quality}`);
  if (Number.isFinite(r.energy)) parts.push(`E${r.energy}`);
  if (Number.isFinite(r.mood)) parts.push(`M${r.mood}`);
  let out = parts.length ? ` [${parts.join(' ')}` : '';
  if (r.niggles) out += `, "${r.niggles.replace(/\n/g, ' ').slice(0, 80)}"`;
  if (out) out += ']';
  return out;
}

function describeWorkoutLine(w) {
  const dateCode = `${w.performed_at.slice(0,10)} (${w.code})`;
  const rd = readinessSuffix(w);
  if (w.session_kind === 'cardio') {
    const block = (w.sets || [])[0];
    if (!block) return `${dateCode} cardio: (empty)${rd}`;
    if (block.kind === 'intervals') {
      const blocks = block.blocks || [];
      const totalS = blocks.reduce((sum, b) => sum + (b.duration_s || 0), 0);
      const hrs = blocks.map(b => b.avg_hr).filter(Number.isFinite);
      const avgHr = hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null;
      return `${dateCode} cardio intervals: ${blocks.length} blocks, ${Math.round(totalS / 60)}min total${avgHr ? `, avg HR ${avgHr}` : ''}${rd}`;
    }
    if (block.kind === 'steady') {
      const mins = Math.round((block.duration_s || 0) / 60);
      return `${dateCode} cardio steady: ${mins}min${block.avg_hr ? `, avg HR ${block.avg_hr}` : ''}${block.distance_km ? `, ${block.distance_km}km` : ''}${rd}`;
    }
    return `${dateCode} cardio${rd}`;
  }
  const exercises = [...new Set((w.sets || []).map(s => s.exercise_name))].join(', ');
  return `${dateCode} strength: ${exercises}${rd}`;
}

export function reviewWeekPrompt({ workouts }) {
  const byDay = workouts.slice(0, 14).map(describeWorkoutLine).join('\n');
  return {
    system: 'You are a strength-and-conditioning coach. Review the athlete\'s last 7 days across both strength and cardio. Each session may include a readiness snapshot in brackets like [S3 E4 M3, "achilles tight"] (sleep, energy, mood on 1-5; optional niggles in quotes). If the same body part is mentioned 3+ times in niggles, flag it explicitly. Be specific and brief.',
    messages: [{
      role: 'user',
      content: `Here are the recent workouts:

${byDay || '(no workouts)'}

Give me a concise weekly review (max ~150 words):
- What went well (strength volume, cardio mix)
- Plateaus, imbalances, recovery flags (use the readiness data)
- Repeating niggles → flag them
- One concrete suggestion for next week`,
    }],
    max_tokens: 600,
  };
}

export function planMesocyclePrompt({ workouts, program }) {
  const recent = workouts.slice(0, 12).map(w => {
    const rd = readinessSuffix(w);
    if (w.session_kind === 'cardio') return describeWorkoutLine(w);
    return `${w.performed_at.slice(0,10)} (${w.code}): ` + (w.sets || []).map(s =>
      `${s.exercise_name} ${s.set_number}×${s.reps}@${s.load_kg ?? '–'}kg`
    ).join('; ') + rd;
  }).join('\n');
  const prog = program.map(p => {
    if (p.session_kind === 'cardio') {
      const slot = p.slots?.[0] || {};
      const desc = slot.kind === 'intervals'
        ? `${(slot.blocks || []).length} blocks`
        : `steady ${Math.round((slot.target_duration_s || 0) / 60)}min`;
      return `[${p.code}] ${p.name} (cardio, ${desc})`;
    }
    return `[${p.code}] ${p.name}\n` + p.slots.map(s =>
      `  - ${s.exercise.name}: ${s.target.sets}×${s.target.reps}@${s.target.load_kg ?? '–'}kg`
    ).join('\n');
  }).join('\n');
  return {
    system: 'You are a strength-training coach. Plan a 4-week mesocycle. Be specific with sets/reps/load progression.',
    messages: [{
      role: 'user',
      content: `Current program:
${prog}

Recent performance (last ~12 sessions):
${recent || '(no logs)'}

Output a 4-week progression plan in plain text, week-by-week. Keep it actionable. Mention deload if appropriate.`,
    }],
    max_tokens: 1200,
  };
}
