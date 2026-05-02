// Local-first store for the trainer feature.
// Reads always hit localStorage first, then opportunistically backfill from
// Supabase. Writes go to localStorage immediately, then upsert to Supabase
// (best-effort — failures are queued and retried on online/focus events).

import { supabase, isSupabaseConfigured } from '../supabase.js';
import { SEED_PROGRAM, SEED_CARDIO, newSlotId } from './seed.js';

const KEY_PROGRAM = 'mp.trainer.program';
const KEY_CARDIO = 'mp.trainer.cardio';
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

// ───────── Program (strength A/B/C) ─────────
export function loadProgramLocal() {
  const cached = readJSON(KEY_PROGRAM, null);
  if (cached && Array.isArray(cached) && cached.length === 3) {
    // Backfill session_kind on rows seeded before Phase 2.
    return cached.map(s => ({ session_kind: 'strength', ...s }));
  }
  const seeded = SEED_PROGRAM.map(s => ({ ...s, session_kind: 'strength' }));
  writeJSON(KEY_PROGRAM, seeded);
  return seeded;
}

export function loadCardioLocal() {
  const cached = readJSON(KEY_CARDIO, null);
  if (cached && Array.isArray(cached) && cached.length === SEED_CARDIO.length) return cached;
  const seeded = SEED_CARDIO.map(s => ({ ...s }));
  writeJSON(KEY_CARDIO, seeded);
  return seeded;
}

export async function loadProgram(userId) {
  let localStrength = loadProgramLocal();
  let localCardio = loadCardioLocal();
  if (!isSupabaseConfigured() || !userId) return [...localStrength, ...localCardio];
  try {
    const { data, error } = await supabase
      .from('trainer_program')
      .select('*')
      .eq('user_id', userId)
      .order('code');
    if (error) throw error;

    const remoteByCode = new Map((data || []).map(r => [r.code, r]));
    const allLocal = [...localStrength, ...localCardio];
    const missingOnServer = allLocal.filter(s => !remoteByCode.has(s.code));
    if (missingOnServer.length > 0) {
      for (const s of missingOnServer) {
        await supabase.from('trainer_program').upsert({
          user_id: userId,
          code: s.code,
          name: s.name,
          slots: s.slots,
          session_kind: s.session_kind || 'strength',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,code' });
      }
    }

    const merged = allLocal.map(localRow => {
      const remote = remoteByCode.get(localRow.code);
      if (remote) return {
        code: remote.code, name: remote.name,
        slots: remote.slots || [],
        session_kind: remote.session_kind || localRow.session_kind || 'strength',
      };
      return localRow;
    });
    const strength = merged.filter(s => (s.session_kind || 'strength') === 'strength');
    const cardio = merged.filter(s => s.session_kind === 'cardio');
    writeJSON(KEY_PROGRAM, strength);
    writeJSON(KEY_CARDIO, cardio);
    return [...strength, ...cardio];
  } catch (e) {
    console.warn('trainer: program server load failed, using local', e);
    return [...localStrength, ...localCardio];
  }
}

export async function saveSession(userId, session) {
  // session = { code, name, slots, session_kind? }
  const kind = session.session_kind || 'strength';
  if (kind === 'cardio') {
    const all = loadCardioLocal();
    const next = all.map(s => s.code === session.code ? { ...session, session_kind: 'cardio' } : s);
    writeJSON(KEY_CARDIO, next);
  } else {
    const all = loadProgramLocal();
    const next = all.map(s => s.code === session.code ? { ...session, session_kind: 'strength' } : s);
    writeJSON(KEY_PROGRAM, next);
  }
  if (!isSupabaseConfigured() || !userId) return session;
  try {
    await supabase.from('trainer_program').upsert({
      user_id: userId,
      code: session.code,
      name: session.name,
      slots: session.slots,
      session_kind: kind,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,code' });
  } catch (e) {
    console.warn('trainer: program upsert failed (will retry on next change)', e);
  }
  return session;
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
      session_kind: workout.session_kind || 'strength',
      readiness: workout.readiness ?? null,
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
        session_kind: w.session_kind || 'strength',
        readiness: w.readiness ?? null,
      }, { onConflict: 'user_id,client_id' });
      if (!error) dequeueSynced(cid);
    } catch {}
  }
}

// ───────── Helpers ─────────
export function newWorkoutDraft(code, session_kind = 'strength') {
  return {
    client_id: uuid(),
    code,
    session_kind,
    performed_at: new Date().toISOString(),
    sets: [],
    swaps: [],
    notes: '',
    readiness: null,
  };
}

export { newSlotId };
