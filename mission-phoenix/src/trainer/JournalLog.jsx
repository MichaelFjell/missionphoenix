import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase.js';

// Modal that opens the existing journal entry editor with text prefilled.
// Writes to the same daily_notes table used by Tracker / Journal.
// daily_notes has unique(habit_id, note_date) — if a note already exists
// for today, we prepend the prefilled text to the existing note.

async function getOrCreatePrimaryHabit(userId) {
  let { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
    .limit(1);
  if (error) throw error;
  if (habits && habits.length) return habits[0];
  const { data: created, error: cErr } = await supabase
    .from('habits')
    .insert({ user_id: userId, name: 'No pornography', sort_order: 0 })
    .select()
    .single();
  if (cErr) throw cErr;
  return created;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalLog({ user, prefill, onClose, onSaved }) {
  const [text, setText] = useState(prefill || '');
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [existingNote, setExistingNote] = useState(null);
  const [habit, setHabit] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const h = await getOrCreatePrimaryHabit(user.id);
        if (cancelled) return;
        setHabit(h);
        const today = todayDateString();
        const { data, error } = await supabase
          .from('daily_notes')
          .select('*')
          .eq('habit_id', h.id)
          .eq('user_id', user.id)
          .eq('note_date', today)
          .maybeSingle();
        if (cancelled) return;
        if (!error && data && data.note_text !== '__STREAK_START__' && data.note_text !== '__RELAPSE__') {
          setExistingNote(data);
          setIsPublic(!!data.is_public);
          setText(`${prefill}\n\n${data.note_text}`);
        }
      } catch (e) {
        console.error('JournalLog: habit/note load failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, prefill]);

  const save = async () => {
    if (!habit || !user?.id || !text.trim()) {
      setErr('Add some text before saving.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const today = todayDateString();
      if (existingNote) {
        const { error } = await supabase
          .from('daily_notes')
          .update({ note_text: text, is_public: isPublic })
          .eq('id', existingNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_notes')
          .insert({
            habit_id: habit.id,
            user_id: user.id,
            note_date: today,
            note_text: text,
            is_public: isPublic,
          });
        if (error) throw error;
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e.message || 'Could not save.');
    }
    setBusy(false);
  };

  return (
    <div className="tr-modal-bg" onClick={onClose}>
      <div className="tr-modal" onClick={e => e.stopPropagation()}>
        <h3>Log to journal</h3>
        {existingNote && (
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>
            You already have a note today — your PR has been added to the top.
          </p>
        )}
        <textarea
          className="input"
          rows={6}
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ resize: 'vertical', minHeight: 140, marginBottom: 12 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>
          <input
            type="checkbox" checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
          />
          Share publicly on community journal
        </label>
        {err && (
          <div style={{ fontSize: 12, color: '#b82030', marginBottom: 8 }}>{err}</div>
        )}
        <div className="close-row">
          <button type="button" className="btn ghost sm" onClick={onClose}>Cancel</button>
          <button type="button" className="btn primary sm" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : (existingNote ? 'Update entry' : 'Save entry')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function buildPRPrefill({ exerciseName, load_kg, reps, est_1rm, prev }) {
  const lines = [`PR — ${exerciseName} ${load_kg}kg × ${reps} (est-1RM ≈ ${Math.round(est_1rm)}kg)`];
  if (prev) {
    lines.push(`Previous best: ${prev.load_kg}kg × ${prev.reps} (est-1RM ≈ ${Math.round(prev.est_1rm)}kg)`);
  }
  return lines.join('\n');
}
