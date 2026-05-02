// Provider-agnostic AI dispatcher. The rest of the app calls this; it
// routes to anthropic/openai/gemini based on the user's chosen provider
// (or auto-picks the first one with a key configured).

import * as anthropic from './anthropic.js';
import * as openai from './openai.js';
import * as gemini from './gemini.js';
import {
  getApiKey, getOpenAIKey, getGeminiKey,
  getAiProvider, setAiProvider,
} from './store.js';

export const PROVIDERS = [
  { id: 'anthropic', label: 'Claude (Anthropic)', model: anthropic.MODEL, hasKey: () => !!getApiKey() },
  { id: 'openai',    label: 'ChatGPT (OpenAI)',   model: openai.MODEL,    hasKey: () => !!getOpenAIKey() },
  { id: 'gemini',    label: 'Gemini (Google)',    model: gemini.MODEL,    hasKey: () => !!getGeminiKey() },
];

export function hasAnyKey() {
  return PROVIDERS.some(p => p.hasKey());
}

// Return the active provider id. If the user picked one but its key was
// since cleared, fall back to the first provider with a key.
export function activeProvider() {
  const chosen = getAiProvider();
  const provider = PROVIDERS.find(p => p.id === chosen);
  if (provider && provider.hasKey()) return chosen;
  const firstWithKey = PROVIDERS.find(p => p.hasKey());
  return firstWithKey ? firstWithKey.id : null;
}

export function setActiveProvider(id) {
  if (PROVIDERS.find(p => p.id === id)) setAiProvider(id);
}

function clientFor(id) {
  if (id === 'openai') return openai;
  if (id === 'gemini') return gemini;
  return anthropic;
}

export async function stream(opts) {
  const id = activeProvider();
  if (!id) throw new Error('No AI provider configured');
  return clientFor(id).stream(opts);
}

export async function complete(opts) {
  const id = activeProvider();
  if (!id) throw new Error('No AI provider configured');
  return clientFor(id).complete(opts);
}

// Re-export the prompt builders so callers can keep doing
//   import { reviewWeekPrompt } from 'trainer/ai.js'
export { suggestSwapPrompt, reviewWeekPrompt, planMesocyclePrompt } from './anthropic.js';

// Backwards-compatible alias for the old `hasKey()` check throughout the app.
export const hasKey = hasAnyKey;
