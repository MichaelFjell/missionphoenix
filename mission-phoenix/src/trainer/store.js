// Local-first store for the trainer feature.
// Reads always hit localStorage first, then opportunistically backfill from
// Supabase. Writes go to localStorage immediately, then upsert to Supabase
// (best-effort — failures are queued and retried on online/focus events).

import { supabase, isSupabaseConfigured } from '../supabase.js';
import { SEED_PROGRAM, newSlotId } from './seed.js';

const KEY_PROGRAM = 'mp.trainer.program';
const KEY_WORKOUTS = 'mp.trainer.workouts';
const KEY_UNSYNCED = 'mp.trainer.unsynced';
const KEY_API = 'mp.trainer.anthropicKey';

function readJSON(k, fallback) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

export function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'cid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

// ───────── API key (local only, never round-trips to a backend) ─────────
export const getApiKey = () => localStorage.getItem(KEY_API) || '';
export const setApiKey = (k) => { if (k) localStorage.setItem(KEY_API, k); else localStorage.removeItem(KEY_API); };

// ───────── Program ─────────
export function loadProgramLocal() {
  const cached = readJSON(KEY_PROGRAM, null);
  if (cached && Array.isArray(cached) && cached.length === 3) return cached;
  // First-run seed
  const seeded = SEED_PROGRAM.map(s => ({ ...s }));
  writeJSON(KEY_PROGRAM, seeded);
  return seeded;
}

export async function loadProgram(userId) {
  let local = loadProgramLocal();
  if (!isSupabaseConfigured() || !userId) return local;
  try {
    const { data, error } = await supabase
      .from('trainer_program')
      .select('*')
      .eq('user_id', userId)
      .order('code');
    if (error) throw error;
    if (!data || data.length === 0) {
      // Push the seed up to the server so it persists across devices.
      for (const s of local) {
        await supabase.from('trainer_program').upsert({
          user_id: userId, code: s.code, name: s.name, slots: s.slots,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,code' });
      }
      return local;
    }
    // Merge: prefer server (it's authoritative if more recent).
    const merged = ['A','B','C'].map(code => {
      const remote = data.find(r => r.code === code);
      const localRow = local.find(r => r.code === code);
      if (remote) return { code, name: remote.name, slots: remote.slots || [] };
      return localRow;
    });
    writeJSON(KEY_PROGRAM, merged);
    return merged;
  } catch (e) {
    console.warn('trainer: program server load failed, using local', e);
    return local;
  }
}

export async function saveSession(userId, session) {
  // session = { code, name, slots }
  const all = loadProgramLocal();
  const next = all.map(s => s.code === session.code ? { ...session } : s);
  writeJSON(KEY_PROGRAM, next);
  if (!isSupabaseConfigured() || !userId) return next;
  try {
    await supabase.from('trainer_program').upsert({
      user_id: userId,
      code: session.code,
      name: session.name,
      slots: session.slots,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,code' });
  } catch (e) {
    console.warn('trainer: program upsert failed (will retry on next change)', e);
  }
  return next;
}

// ───────── Workouts ─────────
export function loadWorkoutsLocal() {
  return readJSON(KEY_WORKOUTS, []);
}

export async function loadWorkouts(userId, { limit = 200 } = {}) {
  let local = loadWorkoutsLocal();
  if (!isSupabaseConfigured() || !userId) return local;
  try {
    const { data, error } = await supabase
      .from('trainer_workout')
      .select('*')
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    // Merge local+remote by client_id (local-first dedupe).
    const byCid = new Map();
    for (const r of (data || [])) byCid.set(r.client_id, r);
    for (const r of local) byCid.set(r.client_id, { ...byCid.get(r.client_id), ...r });
    const merged = [...byCid.values()].sort((a, b) =>
      new Date(b.performed_at) - new Date(a.performed_at)
    );
    writeJSON(KEY_WORKOUTS, merged);
    return merged;
  } catch (e) {
    console.warn('trainer: workouts server load failed, using local', e);
    return local;
  }
}

function queueUnsynced(client_id) {
  const q = readJSON(KEY_UNSYNCED, []);
  if (!q.includes(client_id)) {
    q.push(client_id);
    writeJSON(KEY_UNSYNCED, q);
  }
}
function dequeueSynced(client_id) {
  writeJSON(KEY_UNSYNCED, readJSON(KEY_UNSYNCED, []).filter(c => c !== client_id));
}

export async function upsertWorkout(userId, workout) {
  // workout = { client_id, code, performed_at, sets, swaps, notes }
  const all = loadWorkoutsLocal();
  const idx = all.findIndex(w => w.client_id === workout.client_id);
  if (idx >= 0) all[idx] = { ...all[idx], ...workout };
  else all.unshift(workout);
  writeJSON(KEY_WORKOUTS, all);

  if (!isSupabaseConfigured() || !userId) {
    queueUnsynced(workout.client_id);
    return workout;
  }
  try {
    const { error } = await supabase.from('trainer_workout').upsert({
      user_id: userId,
      code: workout.code,
      performed_at: workout.performed_at,
      sets: workout.sets || [],
      swaps: workout.swaps || [],
      notes: workout.notes || '',
      client_id: workout.client_id,
    }, { onConflict: 'user_id,client_id' });
    if (error) throw error;
    dequeueSynced(workout.client_id);
  } catch (e) {
    console.warn('trainer: workout upsert failed, queued for retry', e);
    queueUnsynced(workout.client_id);
  }
  return workout;
}

export async function flushUnsynced(userId) {
  if (!isSupabaseConfigured() || !userId) return;
  const queue = readJSON(KEY_UNSYNCED, []);
  if (!queue.length) return;
  const all = loadWorkoutsLocal();
  for (const cid of [...queue]) {
    const w = all.find(x => x.client_id === cid);
    if (!w) { dequeueSynced(cid); continue; }
    try {
      const { error } = await supabase.from('trainer_workout').upsert({
        user_id: userId,
        code: w.code, performed_at: w.performed_at,
        sets: w.sets || [], swaps: w.swaps || [], notes: w.notes || '',
        client_id: w.client_id,
      }, { onConflict: 'user_id,client_id' });
      if (!error) dequeueSynced(cid);
    } catch {}
  }
}

// ───────── Helpers ─────────
export function newWorkoutDraft(code) {
  return {
    client_id: uuid(),
    code,
    performed_at: new Date().toISOString(),
    sets: [],
    swaps: [],
    notes: '',
  };
}

export { newSlotId };
