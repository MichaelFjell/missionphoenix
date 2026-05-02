import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { isSupabaseConfigured } from './supabase.js';
import {
  loadProgram, loadWorkouts, saveSession,
  getApiKey, setApiKey,
} from './trainer/store.js';
import { newSlotId, slugify, SLOT_TAGS, CONDITIONAL_RULES } from './trainer/seed.js';
import {
  hasKey, stream, reviewWeekPrompt, planMesocyclePrompt,
} from './trainer/anthropic.js';
import './trainer.css';

const ALL_TAG_OPTIONS = SLOT_TAGS;

function TagPicker({ value, onChange }) {
  const set = new Set(value || []);
  const toggle = (t) => {
    const next = new Set(set);
    if (next.has(t)) next.delete(t); else next.add(t);
    onChange([...next]);
  };
  return (
    <div className="tr-tags" style={{ marginTop: 4 }}>
      {ALL_TAG_OPTIONS.map(t => (
        <button
          key={t}
          type="button"
          onClick={() => toggle(t)}
          className="tr-tag"
          style={{
            cursor: 'pointer',
            background: set.has(t) ? 'var(--copper)' : 'var(--copper-soft)',
            color: set.has(t) ? 'var(--on-accent)' : 'var(--copper)',
            border: 'none', fontFamily: 'inherit',
          }}
        >{t}</button>
      ))}
    </div>
  );
}

function SlotEditor({ slot, onChange, onMoveUp, onMoveDown, onRemove, isFirst, isLast }) {
  const updateExercise = (patch) => onChange({
    ...slot,
    exercise: {
      ...slot.exercise, ...patch,
      slug: patch.name !== undefined ? slugify(patch.name) : slot.exercise.slug,
    },
  });
  const updateAlt = (i, patch) => {
    const next = (slot.alternatives || []).map((a, idx) => idx === i
      ? { ...a, ...patch, slug: patch.name !== undefined ? slugify(patch.name) : a.slug }
      : a);
    onChange({ ...slot, alternatives: next });
  };
  const addAlt = () => {
    if ((slot.alternatives || []).length >= 4) return;
    onChange({ ...slot, alternatives: [...(slot.alternatives || []), { name: '', slug: '', tags: [] }] });
  };
  const removeAlt = (i) => onChange({
    ...slot,
    alternatives: (slot.alternatives || []).filter((_, idx) => idx !== i),
  });
  const updateTarget = (patch) => onChange({ ...slot, target: { ...slot.target, ...patch } });

  return (
    <div className="tr-edit-slot">
      <div className="row">
        <div className="reorder">
          <button type="button" onClick={onMoveUp} disabled={isFirst}>↑</button>
          <button type="button" onClick={onMoveDown} disabled={isLast}>↓</button>
        </div>
        <input
          className="input"
          style={{ flex: 1, minWidth: 200 }}
          type="text" placeholder="Exercise name"
          value={slot.exercise.name}
          onChange={e => updateExercise({ name: e.target.value })}
        />
        <button type="button" className="btn ghost sm" onClick={onRemove}>Remove</button>
      </div>
      <TagPicker value={slot.exercise.tags} onChange={(tags) => updateExercise({ tags })} />

      <div className="targets">
        <div>
          <label className="field">Sets</label>
          <input className="input" type="number" min="1"
            value={slot.target.sets ?? ''}
            onChange={e => updateTarget({ sets: e.target.value === '' ? null : Number(e.target.value) })}/>
        </div>
        <div>
          <label className="field">Reps</label>
          <input className="input" type="number" min="1"
            value={slot.target.reps ?? ''}
            onChange={e => updateTarget({ reps: e.target.value === '' ? null : Number(e.target.value) })}/>
        </div>
        <div>
          <label className="field">Load (kg)</label>
          <input className="input" type="number" min="0" step="0.5"
            value={slot.target.load_kg ?? ''}
            onChange={e => updateTarget({ load_kg: e.target.value === '' ? null : Number(e.target.value) })}/>
        </div>
      </div>

      <label className="field" style={{ marginTop: 12 }}>Notes</label>
      <input className="input" type="text" placeholder="Cues, tempo, rest…"
        value={slot.notes ?? ''}
        onChange={e => onChange({ ...slot, notes: e.target.value })}/>

      <div className="row" style={{ marginTop: 12, gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={!!slot.conditional}
            onChange={e => onChange({ ...slot, conditional: e.target.checked })} />
          Conditional slot
        </label>
        {slot.conditional && (
          <select
            value={slot.conditional_rule || 'neck-rotation'}
            onChange={e => onChange({ ...slot, conditional_rule: e.target.value })}
            style={{ padding: 8, fontSize: 13, background: 'var(--bg)',
              color: 'var(--ink)', border: '1px solid var(--line-2)', borderRadius: 8 }}
          >
            {CONDITIONAL_RULES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        )}
        {slot.needs_review && (
          <button type="button" className="btn ghost sm"
            onClick={() => onChange({ ...slot, needs_review: false })}>
            Mark reviewed
          </button>
        )}
      </div>

      <div className="alts">
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 8 }}>
          Alternatives ({(slot.alternatives || []).length}/4)
        </div>
        {(slot.alternatives || []).map((a, i) => (
          <div key={i} className="alt-row">
            <input className="input" type="text" placeholder="Alt exercise name"
              value={a.name}
              onChange={e => updateAlt(i, { name: e.target.value })}/>
            <button type="button" className="rm" onClick={() => removeAlt(i)}
              style={{ background: 'none', border: 'none', color: 'var(--ink-3)',
                fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}>×</button>
          </div>
        ))}
        {(slot.alternatives || []).length < 4 && (
          <button type="button" className="tr-add-set" onClick={addAlt}>+ Add alternative</button>
        )}
      </div>
    </div>
  );
}

function ProgramEditor({ user, program, setProgram }) {
  const [tab, setTab] = useState('A');
  const [saveStatus, setSaveStatus] = useState('');
  const session = program.find(s => s.code === tab);

  const updateSession = useCallback((nextSession) => {
    setProgram(prev => prev.map(s => s.code === nextSession.code ? nextSession : s));
  }, [setProgram]);

  const updateSlot = (slotId, next) => {
    updateSession({
      ...session,
      slots: session.slots.map(s => s.id === slotId ? next : s),
    });
  };
  const moveSlot = (idx, dir) => {
    const slots = [...session.slots];
    const j = idx + dir;
    if (j < 0 || j >= slots.length) return;
    [slots[idx], slots[j]] = [slots[j], slots[idx]];
    slots.forEach((s, i) => { s.sort_order = i + 1; });
    updateSession({ ...session, slots });
  };
  const removeSlot = (slotId) => {
    if (!window.confirm('Remove this slot?')) return;
    updateSession({
      ...session,
      slots: session.slots.filter(s => s.id !== slotId).map((s, i) => ({ ...s, sort_order: i + 1 })),
    });
  };
  const addSlot = () => {
    const newSlot = {
      id: newSlotId(),
      sort_order: session.slots.length + 1,
      exercise: { name: 'New exercise', slug: 'new-exercise', tags: [] },
      alternatives: [],
      target: { sets: 3, reps: 10, load_kg: null },
      notes: '',
      conditional: false,
      conditional_rule: null,
      needs_review: true,
    };
    updateSession({ ...session, slots: [...session.slots, newSlot] });
  };
  const renameSession = (name) => updateSession({ ...session, name });

  const save = async () => {
    setSaveStatus('Saving…');
    await saveSession(user?.id, session);
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(''), 1500);
  };

  if (!session) return null;

  return (
    <div>
      <div className="tr-tabs">
        {program.map(s => (
          <button key={s.code} className={tab === s.code ? 'on' : ''} onClick={() => setTab(s.code)}>
            {s.code} · {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <label className="field">Session name</label>
      <input className="input" type="text" value={session.name}
        onChange={e => renameSession(e.target.value)} style={{ marginBottom: 18 }}/>

      {session.slots.map((slot, i) => (
        <SlotEditor
          key={slot.id}
          slot={slot}
          onChange={(next) => updateSlot(slot.id, next)}
          onMoveUp={() => moveSlot(i, -1)}
          onMoveDown={() => moveSlot(i, +1)}
          onRemove={() => removeSlot(slot.id)}
          isFirst={i === 0}
          isLast={i === session.slots.length - 1}
        />
      ))}

      <button type="button" className="tr-add-set" onClick={addSlot} style={{ marginTop: 8 }}>
        + Add slot
      </button>

      <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn primary sm" onClick={save}>Save session {tab}</button>
        {saveStatus && <span style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: 1 }}>{saveStatus}</span>}
      </div>
    </div>
  );
}

function AiPanel({ workouts, program }) {
  const [keyInput, setKeyInput] = useState(getApiKey());
  const [keyMessage, setKeyMessage] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [output, setOutput] = useState('');

  const saveKey = () => {
    setApiKey(keyInput.trim());
    setKeyMessage(keyInput.trim() ? 'Saved' : 'Cleared');
    setTimeout(() => setKeyMessage(''), 1500);
  };

  const runTask = async (taskName, promptOpts) => {
    setActiveTask(taskName);
    setOutput('');
    try {
      await stream({
        ...promptOpts,
        onChunk: (t) => setOutput(prev => prev + t),
      });
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
    setActiveTask(null);
  };

  return (
    <div className="tr-ai-card">
      <h3>AI features (BYOK)</h3>
      <label className="field">Anthropic API key</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input" type="password" placeholder="sk-ant-..."
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          autoComplete="off" spellCheck="false"
          style={{ flex: 1 }}/>
        <button className="btn primary sm" onClick={saveKey}>{keyMessage || 'Save'}</button>
      </div>
      <p className="note">
        Your key lives in this browser only. Mission Phoenix never sees or stores it. Clear the field and save to remove it.
      </p>

      {hasKey() ? (
        <>
          <div className="tr-ai-row">
            <button
              disabled={!!activeTask}
              onClick={() => runTask('week', reviewWeekPrompt({ workouts }))}>
              {activeTask === 'week' ? 'Reviewing…' : 'Review my week'}
            </button>
            <button
              disabled={!!activeTask}
              onClick={() => runTask('plan', planMesocyclePrompt({ workouts, program }))}>
              {activeTask === 'plan' ? 'Planning…' : 'Plan next mesocycle'}
            </button>
          </div>
          {output && <div className="tr-ai-out">{output}</div>}
          <p className="note" style={{ marginTop: 10 }}>
            Swap suggestions are available inside the Swap dialog when logging a session.
          </p>
        </>
      ) : (
        <p className="note" style={{ marginTop: 14 }}>
          Save a key above to unlock weekly review, mesocycle planning, and swap suggestions.
        </p>
      )}
    </div>
  );
}

function SettingsView() {
  const { user } = useAuth();
  const [program, setProgram] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, w] = await Promise.all([
        loadProgram(user?.id),
        loadWorkouts(user?.id, { limit: 100 }),
      ]);
      if (cancelled) return;
      setProgram(p);
      setWorkouts(w);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return (
      <main className="page narrow">
        <p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: 3 }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="page tr-page narrow">
      <Link to="/trainer" className="btn ghost sm" style={{ marginBottom: 18 }}>← Back</Link>
      <div className="eyebrow"><span className="d"></span>Trainer settings</div>
      <h1 className="page-title">Tune <em>your program.</em></h1>
      <p className="page-lede">Edit A/B/C, manage alternatives, set targets, and (optionally) connect Claude.</p>

      <ProgramEditor user={user} program={program} setProgram={setProgram} />

      <AiPanel workouts={workouts} program={program} />
    </main>
  );
}

export default function TrainerSettings() {
  const { user, profile, loading } = useAuth();
  if (!isSupabaseConfigured()) return <Navigate to="/trainer" replace />;
  if (loading) return null;
  if (!user) return <Navigate to="/trainer" replace />;
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return <SettingsView />;
}
