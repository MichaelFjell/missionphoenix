import { useState } from 'react';
import { supabase } from '../supabase.js';
import { INTAKE, INTAKE_QUESTIONS } from '../coachingContent.js';

// One-time intake questionnaire. Draft-saveable, read-only after submit.
export default function PortalIntake({ client, intake, onSaved }) {
  const [answers, setAnswers] = useState(intake?.answers || {});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submitted = !!intake?.submitted_at;

  const save = async (submit) => {
    if (submit && !window.confirm(INTAKE.submitConfirm)) return;
    setBusy(true); setErr(''); setMsg('');
    const row = { client_id: client.id, answers };
    if (submit) row.submitted_at = new Date().toISOString();
    const { error } = await supabase.from('client_intake').upsert(row);
    setBusy(false);
    if (error) { setErr(INTAKE.errorGeneric); return; }
    if (!submit) setMsg(INTAKE.draftSaved);
    onSaved();
  };

  if (submitted) {
    return (
      <div>
        <div className="card pt-block">
          <div className="pt-q">{INTAKE.submittedTitle}</div>
          <p className="pt-hint">{INTAKE.submittedNote}</p>
        </div>
        {INTAKE_QUESTIONS.map((q) => (
          <div key={q.id} className="card pt-block">
            <div className="pt-q">{q.label}</div>
            <p className="pt-past-line" style={{ whiteSpace: 'pre-wrap' }}>{intake.answers[q.id] || '—'}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="pt-lede">{INTAKE.lede}</p>
      {INTAKE_QUESTIONS.map((q) => (
        <div key={q.id} className="card pt-block">
          <label className="pt-q" htmlFor={'iq-' + q.id}>{q.label}</label>
          <p className="pt-hint">{q.hint}</p>
          <textarea id={'iq-' + q.id} rows={4} value={answers[q.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
        </div>
      ))}
      {err && <p className="pt-err">{err}</p>}
      {msg && <p className="pt-saved">{msg}</p>}
      <div className="pt-intake-actions">
        <button type="button" className="btn ghost" disabled={busy} onClick={() => save(false)}>{INTAKE.saveDraft}</button>
        <button type="button" className="btn primary" disabled={busy} onClick={() => save(true)}>{INTAKE.submit}</button>
      </div>
    </div>
  );
}
