import { useState } from 'react';
import { supabase } from '../supabase.js';
import { CHECKIN } from '../coachingContent.js';

// The daily check-in form. Mobile-first, mostly taps, under 3 minutes.
export default function PortalCheckin({ client, triggers, protocol, todayISO, existing, onSaved }) {
  const [urge, setUrge] = useState(existing ? existing.urge_intensity : 0);
  const [acted, setActed] = useState(existing ? existing.acted_out : null);
  const [trigIds, setTrigIds] = useState(existing ? existing.trigger_ids : []);
  const [trigOther, setTrigOther] = useState(existing ? existing.trigger_other : '');
  const [sleep, setSleep] = useState(existing && existing.sleep_hours != null ? String(existing.sleep_hours) : '');
  const [moved, setMoved] = useState(existing ? existing.moved : null);
  const [moveNote, setMoveNote] = useState(existing ? existing.movement_note : '');
  const [doneIds, setDoneIds] = useState(existing ? existing.protocol_done_ids : []);
  const [win, setWin] = useState(existing ? existing.win : '');
  const [focus, setFocus] = useState(existing ? existing.tomorrow_focus : '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [saved, setSaved] = useState(false);

  const activeTriggers = triggers.filter((t) => t.active);
  const activeProtocol = protocol.filter((p) => p.active && (!p.starts_on || p.starts_on <= todayISO));

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const submit = async (e) => {
    e.preventDefault();
    if (acted === null || moved === null) return;
    setBusy(true); setErr(''); setSaved(false);
    const row = {
      urge_intensity: urge,
      acted_out: acted,
      trigger_ids: trigIds,
      trigger_other: trigOther.trim(),
      sleep_hours: sleep === '' ? null : Number(sleep),
      moved,
      movement_note: moved ? moveNote.trim() : '',
      protocol_done_ids: doneIds,
      win: win.trim(),
      tomorrow_focus: focus.trim(),
    };
    let error;
    if (existing) {
      ({ error } = await supabase.from('client_checkins').update(row).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('client_checkins')
        .insert({ ...row, client_id: client.id, checkin_date: todayISO }));
    }
    setBusy(false);
    if (error) { setErr(CHECKIN.errorGeneric); return; }
    setSaved(true);
    onSaved();
  };

  return (
    <form onSubmit={submit} className="pt-checkin">
      {existing && <p className="pt-done-note">{CHECKIN.alreadyDone} {CHECKIN.savedNote}</p>}

      <div className="card pt-block">
        <label className="pt-q" htmlFor="pt-urge">{CHECKIN.urgeLabel}</label>
        <div className="pt-urge-val">{urge}<span>/10</span></div>
        <input id="pt-urge" type="range" min="0" max="10" step="1" value={urge}
          onChange={(e) => setUrge(Number(e.target.value))} className="pt-slider" />
        <div className="pt-slider-ends"><span>{CHECKIN.urgeLow}</span><span>{CHECKIN.urgeHigh}</span></div>
      </div>

      <div className="card pt-block">
        <div className="pt-q">{CHECKIN.actedOutLabel}</div>
        <div className="pt-yn">
          <button type="button" className={'pt-yn-btn' + (acted === false ? ' on' : '')} onClick={() => setActed(false)}>{CHECKIN.actedOutNo}</button>
          <button type="button" className={'pt-yn-btn red' + (acted === true ? ' on' : '')} onClick={() => setActed(true)}>{CHECKIN.actedOutYes}</button>
        </div>
        {acted === true && <p className="pt-hint">{CHECKIN.actedOutNote}</p>}
      </div>

      <div className="card pt-block">
        <div className="pt-q">{CHECKIN.triggersLabel}</div>
        {activeTriggers.length === 0 && <p className="pt-hint">{CHECKIN.noTriggersYet}</p>}
        <div className="pt-checks">
          {activeTriggers.map((t) => (
            <label key={t.id} className={'pt-check' + (trigIds.includes(t.id) ? ' on' : '')}>
              <input type="checkbox" checked={trigIds.includes(t.id)} onChange={() => toggle(trigIds, setTrigIds, t.id)} />
              {t.label}
            </label>
          ))}
        </div>
        <input type="text" value={trigOther} placeholder={CHECKIN.triggersOtherPlaceholder}
          onChange={(e) => setTrigOther(e.target.value)} className="pt-other" />
      </div>

      <div className="card pt-block">
        <label className="pt-q" htmlFor="pt-sleep">{CHECKIN.sleepLabel}</label>
        <input id="pt-sleep" type="number" min="0" max="24" step="0.5" inputMode="decimal"
          value={sleep} onChange={(e) => setSleep(e.target.value)} className="pt-sleep" />
      </div>

      <div className="card pt-block">
        <div className="pt-q">{CHECKIN.movementLabel}</div>
        <div className="pt-yn">
          <button type="button" className={'pt-yn-btn' + (moved === true ? ' on' : '')} onClick={() => setMoved(true)}>Yes</button>
          <button type="button" className={'pt-yn-btn' + (moved === false ? ' on' : '')} onClick={() => setMoved(false)}>No</button>
        </div>
        {moved === true && (
          <input type="text" value={moveNote} placeholder={CHECKIN.movementPlaceholder}
            onChange={(e) => setMoveNote(e.target.value)} className="pt-other" />
        )}
      </div>

      <div className="card pt-block">
        <div className="pt-q">{CHECKIN.protocolLabel}</div>
        {activeProtocol.length === 0 && <p className="pt-hint">{CHECKIN.noProtocolYet}</p>}
        <div className="pt-checks col">
          {activeProtocol.map((p) => (
            <label key={p.id} className={'pt-check' + (doneIds.includes(p.id) ? ' on' : '')}>
              <input type="checkbox" checked={doneIds.includes(p.id)} onChange={() => toggle(doneIds, setDoneIds, p.id)} />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      <div className="card pt-block">
        <label className="pt-q" htmlFor="pt-win">{CHECKIN.winLabel}</label>
        <input id="pt-win" type="text" value={win} placeholder={CHECKIN.winPlaceholder}
          onChange={(e) => setWin(e.target.value)} />
      </div>

      <div className="card pt-block">
        <label className="pt-q" htmlFor="pt-focus">{CHECKIN.focusLabel}</label>
        <input id="pt-focus" type="text" value={focus} placeholder={CHECKIN.focusPlaceholder}
          onChange={(e) => setFocus(e.target.value)} />
      </div>

      {err && <p className="pt-err">{err}</p>}
      {saved && <p className="pt-saved">{CHECKIN.savedNote}</p>}
      <button type="submit" className="btn primary pt-submit" disabled={busy || acted === null || moved === null}>
        {busy ? CHECKIN.submitting : existing ? CHECKIN.updateButton : CHECKIN.submitButton}
      </button>
    </form>
  );
}
