import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { isSupabaseConfigured } from './supabase.js';
import {
  loadProgram, loadWorkouts, upsertWorkout, saveSession, newWorkoutDraft,
} from './trainer/store.js';
import { evaluateSlots } from './trainer/rules.js';
import { isPR } from './trainer/oneRm.js';
import { hasKey, stream, suggestSwapPrompt } from './trainer/anthropic.js';
import ReadinessCard from './trainer/Readiness.jsx';
import PlateCalc from './trainer/PlateCalc.jsx';
import RestTimer, { notifySetSaved } from './trainer/RestTimer.jsx';
import './trainer.css';

// ───────── helpers ─────────
function fmtMMSS(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
function parseMMSS(str) {
  if (!str) return null;
  const m = String(str).match(/^(\d+):([0-5]?\d)$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

function SyncIndicator({ status }) {
  const cls = status === 'queued' ? 'tr-sync show queued'
    : status === 'synced' ? 'tr-sync show synced'
    : status ? 'tr-sync show' : 'tr-sync';
  const text = status === 'queued' ? 'Saved offline'
    : status === 'synced' ? 'Synced'
    : status === 'saving' ? 'Saving…'
    : '';
  return <div className={cls}>{text}</div>;
}

function SetRow({ idx, set, onChange, onRemove }) {
  return (
    <div className="tr-set-row">
      <span className="n">#{idx + 1}</span>
      <input
        className="input" type="number" inputMode="numeric" min="0" placeholder="reps"
        value={set.reps ?? ''}
        onChange={e => onChange({ ...set, reps: e.target.value === '' ? null : Number(e.target.value) })}
      />
      <input
        className="input" type="number" inputMode="decimal" min="0" step="0.5" placeholder="kg"
        value={set.load_kg ?? ''}
        onChange={e => onChange({ ...set, load_kg: e.target.value === '' ? null : Number(e.target.value) })}
      />
      <button type="button" className="rm" onClick={onRemove} aria-label="Remove set">×</button>
    </div>
  );
}

function SwapModal({ slot, recentLogs, onClose, onApply }) {
  const [picked, setPicked] = useState(slot.alternatives?.[0] || null);
  const [scope, setScope] = useState('today');
  const [reason, setReason] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  const askAi = async () => {
    setAiBusy(true);
    setAiText('');
    try {
      const opts = suggestSwapPrompt({ slot, recentLogs, reason });
      await stream({
        ...opts,
        onChunk: (t) => setAiText(prev => prev + t),
      });
    } catch (e) {
      setAiText(`Error: ${e.message}`);
    }
    setAiBusy(false);
  };

  return (
    <div className="tr-modal-bg" onClick={onClose}>
      <div className="tr-modal" onClick={e => e.stopPropagation()}>
        <h3>Swap {slot.exercise.name}</h3>

        <div className="alt-list">
          {(slot.alternatives || []).map(alt => (
            <div key={alt.slug}
              className={`alt ${picked?.slug === alt.slug ? 'sel' : ''}`}
              onClick={() => setPicked(alt)}>
              <div>
                <div className="name">{alt.name}</div>
                <div className="tags">{(alt.tags || []).join(' · ')}</div>
              </div>
              <span style={{ fontSize: 18, color: picked?.slug === alt.slug ? 'var(--copper)' : 'var(--ink-3)' }}>
                {picked?.slug === alt.slug ? '●' : '○'}
              </span>
            </div>
          ))}
          {(!slot.alternatives || slot.alternatives.length === 0) && (
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>No alternatives saved for this slot.</div>
          )}
        </div>

        <label className="field">Why swap? (optional)</label>
        <input
          className="input" type="text" value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Equipment busy, joint cranky…"
        />

        <div className="scope-row">
          <button className={scope === 'today' ? 'on' : ''} onClick={() => setScope('today')}>Today only</button>
          <button className={scope === 'permanent' ? 'on' : ''} onClick={() => setScope('permanent')}>Permanent</button>
        </div>

        {hasKey() && (
          <>
            <button className="btn ghost sm" onClick={askAi} disabled={aiBusy} style={{ marginTop: 4 }}>
              {aiBusy ? 'Asking Claude…' : 'Ask Claude for a suggestion'}
            </button>
            {aiText && <div className="tr-ai-out" style={{ marginTop: 10 }}>{aiText}</div>}
          </>
        )}

        <div className="close-row">
          <button className="btn ghost sm" onClick={onClose}>Cancel</button>
          <button className="btn primary sm" disabled={!picked} onClick={() => onApply(picked, scope, reason)}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function CardioSession({ session }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  const template = session.slots?.[0] || { kind: 'steady' };

  useEffect(() => {
    if (draft) return;
    const initialBlock = template.kind === 'intervals'
      ? {
          kind: 'intervals',
          blocks: (template.blocks || []).map(b => ({
            id: b.id || `b_${Math.random().toString(36).slice(2, 7)}`,
            label: b.label,
            duration_s: b.target_duration_s ?? null,
            avg_hr: null,
          })),
        }
      : {
          kind: 'steady',
          duration_s: template.target_duration_s ?? null,
          avg_hr: null,
          ceiling_hr: template.ceiling_hr ?? null,
          distance_km: null,
        };
    const d = newWorkoutDraft(session.code, 'cardio');
    d.sets = [initialBlock];
    setDraft(d);
  }, [draft, session.code, template]);

  const flashSync = useCallback((status) => {
    setSyncStatus(status);
    setTimeout(() => setSyncStatus(''), 1400);
  }, []);

  const persistDraft = useCallback(async (next) => {
    setDraft(next);
    setSyncStatus('saving');
    await upsertWorkout(user?.id, next);
    flashSync(navigator.onLine ? 'synced' : 'queued');
  }, [user?.id, flashSync]);

  if (!draft) return null;
  const block = draft.sets[0];

  const updateBlockField = (patch) => {
    const next = { ...draft, sets: [{ ...block, ...patch }] };
    persistDraft(next);
  };
  const updateInterval = (idx, patch) => {
    const blocks = block.blocks.map((b, i) => i === idx ? { ...b, ...patch } : b);
    persistDraft({ ...draft, sets: [{ ...block, blocks }] });
  };
  const addInterval = () => {
    const last = block.blocks[block.blocks.length - 1];
    const newBlock = {
      id: `b_${Math.random().toString(36).slice(2, 7)}`,
      label: 'Block',
      duration_s: last?.duration_s ?? 60,
      avg_hr: null,
    };
    persistDraft({ ...draft, sets: [{ ...block, blocks: [...block.blocks, newBlock] }] });
  };
  const removeInterval = (idx) => {
    const blocks = block.blocks.filter((_, i) => i !== idx);
    persistDraft({ ...draft, sets: [{ ...block, blocks }] });
  };

  const finish = async () => {
    const final = { ...draft, performed_at: new Date().toISOString() };
    await persistDraft(final);
    navigate('/trainer');
  };

  const totalDuration = block.kind === 'intervals'
    ? (block.blocks || []).reduce((sum, b) => sum + (b.duration_s || 0), 0)
    : (block.duration_s || 0);

  return (
    <main className="page tr-page">
      <SyncIndicator status={syncStatus} />
      <div className="tr-session-head">
        <div>
          <div className="sub">Session {session.code} · Cardio</div>
          <h1 className="title">{session.name}</h1>
          {template.notes && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>{template.notes}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/trainer" className="btn ghost sm">Back</Link>
          <button className="btn primary sm" onClick={finish}>Finish</button>
        </div>
      </div>

      {!draft.readiness && (
        <ReadinessCard
          onSave={(r) => persistDraft({ ...draft, readiness: r })}
          onSkip={(r) => persistDraft({ ...draft, readiness: r })}
        />
      )}

      <div className="tr-slot">
        <div className="head">
          <div>
            <div className="name">{block.kind === 'intervals' ? 'Intervals' : 'Steady-state'}</div>
            <div className="target">Total {fmtMMSS(totalDuration)}</div>
          </div>
        </div>
        <div className="body">
          {block.kind === 'intervals' ? (
            <>
              {block.blocks.map((b, i) => (
                <div key={b.id} className="tr-block">
                  <div className="label-cell">
                    <span className="field-mini">Label</span>
                    <input
                      type="text" className="input" value={b.label || ''}
                      onChange={e => updateInterval(i, { label: e.target.value })}
                    />
                  </div>
                  <div className="label-cell">
                    <span className="field-mini">Duration mm:ss</span>
                    <input
                      type="text" inputMode="numeric" className="input"
                      placeholder="4:00"
                      value={fmtMMSS(b.duration_s)}
                      onChange={e => updateInterval(i, { duration_s: parseMMSS(e.target.value) })}
                    />
                  </div>
                  <div className="label-cell">
                    <span className="field-mini">Avg HR</span>
                    <input
                      type="number" inputMode="numeric" className="input" placeholder="bpm"
                      value={b.avg_hr ?? ''}
                      onChange={e => updateInterval(i, { avg_hr: e.target.value === '' ? null : Number(e.target.value) })}
                    />
                  </div>
                  <div className="label-cell">
                    <span className="field-mini">RPE</span>
                    <input
                      type="number" inputMode="numeric" min="1" max="10" className="input"
                      value={b.rpe ?? ''}
                      onChange={e => updateInterval(i, { rpe: e.target.value === '' ? null : Number(e.target.value) })}
                    />
                  </div>
                  <button type="button" className="rm" onClick={() => removeInterval(i)} aria-label="Remove block">×</button>
                </div>
              ))}
              <button type="button" className="tr-add-set" onClick={addInterval}>+ Add block</button>
            </>
          ) : (
            <div className="tr-cardio-steady">
              <div>
                <label className="field">Duration mm:ss</label>
                <input
                  type="text" inputMode="numeric" className="input" placeholder="45:00"
                  value={fmtMMSS(block.duration_s)}
                  onChange={e => updateBlockField({ duration_s: parseMMSS(e.target.value) })}
                />
              </div>
              <div>
                <label className="field">Avg HR</label>
                <input
                  type="number" inputMode="numeric" className="input"
                  value={block.avg_hr ?? ''}
                  onChange={e => updateBlockField({ avg_hr: e.target.value === '' ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="field">Distance km</label>
                <input
                  type="number" step="0.1" inputMode="decimal" className="input"
                  value={block.distance_km ?? ''}
                  onChange={e => updateBlockField({ distance_km: e.target.value === '' ? null : Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SessionView() {
  const { user } = useAuth();
  const { code } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [openSlot, setOpenSlot] = useState(null);
  const [todaySwaps, setTodaySwaps] = useState({}); // slot_id -> alt
  const [swapModalSlot, setSwapModalSlot] = useState(null);
  const [openPlatesSlot, setOpenPlatesSlot] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, w] = await Promise.all([
        loadProgram(user?.id),
        loadWorkouts(user?.id, { limit: 200 }),
      ]);
      if (cancelled) return;
      setProgram(p);
      setWorkouts(w);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const session = useMemo(() => program.find(s => s.code === code), [program, code]);
  const isCardio = session?.session_kind === 'cardio';

  useEffect(() => {
    if (session && !draft && !isCardio) {
      setDraft(newWorkoutDraft(code, 'strength'));
      setOpenSlot(session.slots[0]?.id ?? null);
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const evaluatedSlots = useMemo(() => {
    if (!session) return [];
    return evaluateSlots(session.slots, workouts);
  }, [session, workouts]);

  const flashSync = useCallback((status) => {
    setSyncStatus(status);
    setTimeout(() => setSyncStatus(''), 1400);
  }, []);

  const persistDraft = useCallback(async (next, opts = {}) => {
    setDraft(next);
    setSyncStatus('saving');
    await upsertWorkout(user?.id, next);
    flashSync(navigator.onLine ? 'synced' : 'queued');
    if (opts.setSaved) notifySetSaved();
  }, [user?.id, flashSync]);

  const effectiveSlot = (slot) => {
    const swap = todaySwaps[slot.id];
    return swap ? { ...slot, exercise: swap } : slot;
  };

  const slotSets = (slotId) => (draft?.sets || []).filter(s => s.slot_id === slotId);

  const updateSet = async (slot, idx, partial) => {
    const eff = effectiveSlot(slot);
    const all = draft.sets || [];
    const slotEntries = all.filter(s => s.slot_id === slot.id);
    const others = all.filter(s => s.slot_id !== slot.id);
    const existing = slotEntries[idx] || {
      slot_id: slot.id,
      exercise_slug: eff.exercise.slug,
      exercise_name: eff.exercise.name,
      set_number: idx + 1,
      reps: null,
      load_kg: null,
      rpe: null,
    };
    const merged = { ...existing, ...partial,
      exercise_slug: eff.exercise.slug,
      exercise_name: eff.exercise.name,
      set_number: idx + 1,
    };
    let nextSlotEntries = [...slotEntries];
    nextSlotEntries[idx] = merged;
    nextSlotEntries = nextSlotEntries.map((s, i) => ({ ...s, set_number: i + 1 }));
    const next = { ...draft, sets: [...others, ...nextSlotEntries] };
    const isMeaningfulSave = Number.isFinite(merged.reps) && Number.isFinite(merged.load_kg);
    await persistDraft(next, { setSaved: isMeaningfulSave });
  };

  const addSet = async (slot) => {
    const eff = effectiveSlot(slot);
    const existing = slotSets(slot.id);
    const last = existing[existing.length - 1];
    const newSet = {
      slot_id: slot.id,
      exercise_slug: eff.exercise.slug,
      exercise_name: eff.exercise.name,
      set_number: existing.length + 1,
      reps: last ? last.reps : (slot.target?.reps ?? null),
      load_kg: last ? last.load_kg : (slot.target?.load_kg ?? null),
      rpe: null,
    };
    const next = { ...draft, sets: [...(draft.sets || []), newSet] };
    await persistDraft(next);
  };

  const removeSet = async (slot, idx) => {
    const all = draft.sets || [];
    const slotEntries = all.filter(s => s.slot_id === slot.id);
    const others = all.filter(s => s.slot_id !== slot.id);
    slotEntries.splice(idx, 1);
    const renum = slotEntries.map((s, i) => ({ ...s, set_number: i + 1 }));
    await persistDraft({ ...draft, sets: [...others, ...renum] });
  };

  const applySwap = async (alt, scope, reason) => {
    const slot = swapModalSlot;
    setSwapModalSlot(null);
    if (!alt) return;

    if (scope === 'today') {
      setTodaySwaps(prev => ({ ...prev, [slot.id]: alt }));
      // Reflect on any sets already logged for this slot in the draft.
      const sets = (draft.sets || []).map(s => s.slot_id === slot.id
        ? { ...s, exercise_slug: alt.slug, exercise_name: alt.name }
        : s);
      const swaps = [...(draft.swaps || []), {
        slot_id: slot.id, from_slug: slot.exercise.slug, to_slug: alt.slug,
        scope: 'today', reason: reason || '',
      }];
      await persistDraft({ ...draft, sets, swaps });
    } else {
      // Permanent: update program. The chosen alt becomes the new primary;
      // the previous primary moves into alternatives (if not already there).
      const updatedSlots = session.slots.map(s => {
        if (s.id !== slot.id) return s;
        const newAlts = [
          { ...slot.exercise },
          ...(s.alternatives || []).filter(a => a.slug !== alt.slug),
        ].slice(0, 4);
        return { ...s, exercise: alt, alternatives: newAlts, needs_review: false };
      });
      const nextSession = { ...session, slots: updatedSlots };
      const nextProgram = await saveSession(user?.id, nextSession);
      setProgram(nextProgram);
      // Update draft set rows for this slot.
      const sets = (draft.sets || []).map(s => s.slot_id === slot.id
        ? { ...s, exercise_slug: alt.slug, exercise_name: alt.name }
        : s);
      const swaps = [...(draft.swaps || []), {
        slot_id: slot.id, from_slug: slot.exercise.slug, to_slug: alt.slug,
        scope: 'permanent', reason: reason || '',
      }];
      await persistDraft({ ...draft, sets, swaps });
    }
  };

  const finish = async () => {
    if (!draft) return;
    const final = { ...draft, performed_at: new Date().toISOString() };
    await persistDraft(final);
    navigate('/trainer');
  };

  const recentLogsForSlot = (slot) => {
    const slug = effectiveSlot(slot).exercise.slug;
    return workouts
      .filter(w => (w.sets || []).some(s => s.exercise_slug === slug))
      .slice(0, 5)
      .map(w => ({
        date: w.performed_at.slice(0, 10),
        sets: (w.sets || []).filter(s => s.exercise_slug === slug),
      }));
  };

  if (loading || !session) {
    return (
      <main className="page narrow">
        <p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: 3 }}>
          {loading ? 'Loading…' : 'Session not found'}
        </p>
      </main>
    );
  }

  if (isCardio) return <CardioSession session={session} />;

  return (
    <main className="page tr-page">
      <SyncIndicator status={syncStatus} />
      <div className="tr-session-head">
        <div>
          <div className="sub">Session {code}</div>
          <h1 className="title">{session.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/trainer" className="btn ghost sm">Back</Link>
          <button className="btn primary sm" onClick={finish}>Finish</button>
        </div>
      </div>

      {draft && !draft.readiness && (
        <ReadinessCard
          onSave={(r) => persistDraft({ ...draft, readiness: r })}
          onSkip={(r) => persistDraft({ ...draft, readiness: r })}
        />
      )}

      {evaluatedSlots.map(slot => {
        const eff = effectiveSlot(slot);
        const isOptional = slot.conditional && !slot._suggested;
        const sets = slotSets(slot.id);
        const isOpen = openSlot === slot.id;
        const isSwapped = !!todaySwaps[slot.id];
        const isFreeWeight = (eff.exercise.tags || []).includes('free-weight');
        const showPlates = (openPlatesSlot === slot.id) && isFreeWeight;
        const platesLoad = sets.length > 0
          ? (sets[sets.length - 1].load_kg ?? slot.target?.load_kg)
          : slot.target?.load_kg;

        // PR check on the best set in this slot
        const slotPR = sets.some(s => s.load_kg && s.reps && isPR(workouts, draft.client_id, eff.exercise.slug, s.load_kg, s.reps));

        return (
          <div key={slot.id} className={`tr-slot ${isOptional ? 'opt' : ''}`}>
            <div className="head" onClick={() => setOpenSlot(isOpen ? null : slot.id)}>
              <div>
                <div className="name">
                  {eff.exercise.name}
                  {isSwapped && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--ink-3)', letterSpacing: 1.5 }}>SWAPPED</span>}
                </div>
                <div className="target">
                  {slot.target.sets}×{slot.target.reps}
                  {slot.target.load_kg ? ` @ ${slot.target.load_kg}kg` : ''}
                  {slot.notes ? ` · ${slot.notes}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {slotPR && <span className="pr-pill">PR</span>}
                <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>{isOpen ? '−' : '+'}</span>
              </div>
            </div>
            {slot._suggestion_reason && <div className="reason">{slot._suggestion_reason}</div>}
            {isOpen && (
              <div className="body">
                {sets.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: '12px 0' }}>
                    No sets logged. Tap below to add one.
                  </div>
                )}
                {sets.map((s, i) => (
                  <SetRow
                    key={i} idx={i} set={s}
                    onChange={(p) => updateSet(slot, i, p)}
                    onRemove={() => removeSet(slot, i)}
                  />
                ))}
                <button type="button" className="tr-add-set" onClick={() => addSet(slot)}>
                  + Add set
                </button>
                <div className="tr-slot-actions">
                  <button onClick={() => setSwapModalSlot(slot)}>Swap</button>
                  {isFreeWeight && (
                    <button onClick={() => setOpenPlatesSlot(showPlates ? null : slot.id)}>
                      {showPlates ? 'Hide plates' : 'Plates'}
                    </button>
                  )}
                  <Link className="btn ghost sm" to={`/trainer/exercise/${eff.exercise.slug}`} style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    History
                  </Link>
                </div>
                {showPlates && (
                  <PlateCalc load_kg={platesLoad} onClose={() => setOpenPlatesSlot(null)} />
                )}
              </div>
            )}
          </div>
        );
      })}

      {swapModalSlot && (
        <SwapModal
          slot={swapModalSlot}
          recentLogs={recentLogsForSlot(swapModalSlot)}
          onClose={() => setSwapModalSlot(null)}
          onApply={applySwap}
        />
      )}

      <RestTimer />
    </main>
  );
}

export default function TrainerSession() {
  const { user, profile, loading } = useAuth();
  if (!isSupabaseConfigured()) return <Navigate to="/trainer" replace />;
  if (loading) return null;
  if (!user) return <Navigate to="/trainer" replace />;
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return <SessionView />;
}
