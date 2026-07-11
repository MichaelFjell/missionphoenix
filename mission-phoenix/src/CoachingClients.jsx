import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase.js';
import { ADMIN, INTAKE_QUESTIONS } from './coachingContent.js';
import { localDateISO, addDaysISO, daysBetween, computeStreak, fmtNice, listTimezones } from './portal/portalUtils.js';
import UrgeChart from './portal/UrgeChart.jsx';

const CC_STYLES = `
  .cc-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:16px 18px;cursor:pointer;}
  .cc-row:hover{border-color:var(--copper);}
  .cc-name{font-weight:800;font-size:15px;min-width:120px;}
  .cc-meta{font-size:13px;color:var(--ink-2);display:flex;gap:10px;flex-wrap:wrap;align-items:center;flex:1;}
  .cc-in{color:var(--copper);font-weight:700;}
  .cc-out{color:#d06552;font-weight:700;}
  .cc-tag{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;padding:2px 10px;}
  .cc-tag.red{color:#d06552;border-color:#d06552;}
  .cc-tag.copper{color:var(--copper);border-color:var(--copper);}
  .cc-list{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;}
  .cc-create .ca-add{margin-top:0;}
  .cc-create input,.cc-create select{padding:10px 12px;font-size:14px;width:auto;}
  .cc-back{margin-bottom:18px;}
  .cc-h{font-size:16px;font-weight:800;margin-bottom:10px;}
  .cc-sec{margin-bottom:18px;padding:20px 22px;}
  .cc-note{font-size:13px;color:var(--ink-3);line-height:1.6;margin-bottom:14px;}
  .cc-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;}
  .cc-danger{border-color:#d06552!important;color:#d06552!important;}
  .cc-item{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px;}
  .cc-item.off{opacity:0.45;}
  .cc-item .lbl{flex:1;min-width:140px;}
  .cc-item .from{font-size:12px;color:var(--ink-3);}
  .cc-ci{padding:16px 18px;margin-bottom:10px;}
  .cc-ci-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;font-size:14px;}
  .cc-ci-line{font-size:13px;color:var(--ink-2);line-height:1.6;margin-bottom:3px;}
  .cc-reply{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
  .cc-reply textarea{flex:1;min-width:200px;padding:10px 12px;font-size:13px;min-height:44px;}
  .cc-freq{font-size:14px;color:var(--ink-2);line-height:1.9;}
  .cc-freq b{color:var(--copper);}
  .cc-intake-q{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--ink-3);margin:14px 0 4px;}
  .cc-intake-a{font-size:14px;line-height:1.7;color:var(--ink-2);white-space:pre-wrap;}
  .cc-notes textarea{width:100%;min-height:120px;padding:12px 14px;font-size:14px;}
`;

export default function CoachingClients() {
  const [clients, setClients] = useState(null);
  const [recent, setRecent] = useState([]); // last 45 days of checkins, all clients
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    const cutoff = addDaysISO(new Date().toISOString().slice(0, 10), -45);
    const [c, k] = await Promise.all([
      supabase.from('coaching_clients').select('*').order('created_at', { ascending: false }),
      supabase.from('client_checkins').select('*').gte('checkin_date', cutoff),
    ]);
    if (c.error || k.error) setErr((c.error || k.error).message);
    setClients(c.data || []);
    setRecent(k.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (clients === null) return <p className="muted">Loading…</p>;

  return (
    <>
      <style>{CC_STYLES}</style>
      {err && <p className="ca-err">{err}</p>}
      {selected ? (
        <ClientDetail clientId={selected} onBack={() => { setSelected(null); load(); }} />
      ) : (
        <>
          <CreateClient onCreated={load} />
          {clients.length === 0 && <p className="muted">{ADMIN.rosterEmpty}</p>}
          <div className="cc-list">
            {clients.map((c) => <RosterRow key={c.id} client={c} recent={recent} onOpen={() => setSelected(c.id)} />)}
          </div>
        </>
      )}
    </>
  );
}

function RosterRow({ client: c, recent, onOpen }) {
  const today = localDateISO(c.timezone);
  const mine = recent.filter((k) => k.client_id === c.id);
  const dates = new Set(mine.map((k) => k.checkin_date));
  const checkedToday = dates.has(today);
  const streak = computeStreak(dates, today);
  const latest = mine.sort((a, b) => (a.checkin_date < b.checkin_date ? 1 : -1))[0];
  const total = daysBetween(c.start_date, c.end_date) + 1;
  const dayNum = Math.min(Math.max(daysBetween(c.start_date, today) + 1, 0), total);
  const active = c.status === 'active';

  return (
    <div className="card cc-row" onClick={onOpen}>
      <span className="cc-name">{c.name}</span>
      <span className={'cc-tag' + (c.status === 'invited' ? ' copper' : c.status === 'archived' ? ' red' : '')}>
        {ADMIN.statusLabels[c.status] || c.status}
      </span>
      <span className="cc-meta">
        {active && (checkedToday
          ? <span className="cc-in">✓ {ADMIN.checkedToday}</span>
          : <span className="cc-out">● {ADMIN.notCheckedToday}</span>)}
        {active && <span>day {dayNum}/{total}</span>}
        <span>🔥 {streak}</span>
        {latest && <span>urge {latest.urge_intensity}/10</span>}
        {latest && latest.acted_out && <span className="cc-tag red">acted out {fmtNice(latest.checkin_date)}</span>}
        <span className="muted">{c.email}</span>
      </span>
    </div>
  );
}

function CreateClient({ onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tz, setTz] = useState('Europe/Stockholm');
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    const { error } = await supabase.from('coaching_clients').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      timezone: tz,
      start_date: start,
      end_date: addDaysISO(start, Math.max(1, Number(days)) - 1),
    });
    setBusy(false);
    if (error) {
      setErr(error.message.includes('duplicate') ? 'A client with that email already exists.' : error.message);
      return;
    }
    setName(''); setEmail('');
    onCreated();
  };

  return (
    <div className="card cc-create" style={{ marginBottom: 20 }}>
      <h3 className="ca-h3">{ADMIN.createTitle}</h3>
      <p className="ca-note">{ADMIN.createNote}</p>
      <form className="ca-add" onSubmit={submit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <select value={tz} onChange={(e) => setTz(e.target.value)}>
          {listTimezones().map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
        <input type="number" min="1" max="365" value={days} onChange={(e) => setDays(e.target.value)} style={{ width: 74 }} title="Program length in days" />
        <button type="submit" className="btn sm primary" disabled={busy}>{busy ? 'Creating…' : ADMIN.createButton}</button>
      </form>
      {err && <p className="ca-err" style={{ marginTop: 10 }}>{err}</p>}
    </div>
  );
}

function ClientDetail({ clientId, onBack }) {
  const [client, setClient] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [replies, setReplies] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [protocol, setProtocol] = useState([]);
  const [intake, setIntake] = useState(null);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr('');
    const [c, k, r, t, p, i, n] = await Promise.all([
      supabase.from('coaching_clients').select('*').eq('id', clientId).maybeSingle(),
      supabase.from('client_checkins').select('*').eq('client_id', clientId).order('checkin_date'),
      supabase.from('checkin_replies').select('*'),
      supabase.from('client_triggers').select('*').eq('client_id', clientId).order('sort_order'),
      supabase.from('client_protocol_items').select('*').eq('client_id', clientId).order('sort_order'),
      supabase.from('client_intake').select('*').eq('client_id', clientId).maybeSingle(),
      supabase.from('coach_notes').select('*').eq('client_id', clientId).maybeSingle(),
    ]);
    setClient(c.data || null);
    setCheckins(k.data || []);
    setReplies(r.data || []);
    setTriggers(t.data || []);
    setProtocol(p.data || []);
    setIntake(i.data || null);
    setNotes(n.data?.body || '');
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  if (!client) return <p className="muted">Loading…</p>;

  const today = localDateISO(client.timezone);
  const total = daysBetween(client.start_date, client.end_date) + 1;
  const dayNum = Math.min(Math.max(daysBetween(client.start_date, today) + 1, 0), total);
  const streak = computeStreak(new Set(checkins.map((k) => k.checkin_date)), today);

  // trigger frequency across all check-ins
  const freq = new Map();
  checkins.forEach((k) => k.trigger_ids.forEach((id) => freq.set(id, (freq.get(id) || 0) + 1)));
  const trigLabel = new Map(triggers.map((t) => [t.id, t.label]));
  const topTriggers = [...freq.entries()]
    .map(([id, n]) => ({ label: trigLabel.get(id), n }))
    .filter((x) => x.label)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  const resendInvite = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('resend_client_invite', { p_client_id: client.id });
    setBusy(false);
    if (error) setErr(error.message); else alert('Invite sent.');
  };

  const toggleArchive = async () => {
    const next = client.status === 'archived' ? 'active' : 'archived';
    const { error } = await supabase.from('coaching_clients').update({ status: next }).eq('id', client.id);
    if (error) setErr(error.message); else load();
  };

  const deleteClient = async () => {
    if (!window.confirm(ADMIN.deleteConfirm(client.name))) return;
    if (!window.confirm('Really sure? This deletes everything permanently.')) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_delete_client', { p_client_id: client.id });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onBack();
  };

  const saveNotes = async () => {
    const { error } = await supabase.from('coach_notes').upsert({ client_id: client.id, body: notes });
    if (error) setErr(error.message); else alert('Notes saved.');
  };

  return (
    <>
      <button type="button" className="btn sm ghost cc-back" onClick={onBack}>← All clients</button>
      {err && <p className="ca-err">{err}</p>}

      <div className="card cc-sec">
        <div className="cc-ci-head" style={{ marginBottom: 10 }}>
          <strong style={{ fontSize: 18 }}>{client.name}</strong>
          <span className="cc-tag">{ADMIN.statusLabels[client.status] || client.status}</span>
          <span className="cc-tag">day {dayNum}/{total}</span>
          <span className="cc-tag">🔥 {streak}</span>
        </div>
        <p className="cc-note" style={{ marginBottom: 6 }}>
          <a className="copper" href={`mailto:${client.email}`}>{client.email}</a> · {client.timezone} ·
          {' '}{fmtNice(client.start_date)} → {fmtNice(client.end_date)}
        </p>
        <div className="cc-actions">
          {!client.user_id && <button type="button" className="btn sm ghost" disabled={busy} onClick={resendInvite}>{ADMIN.resendInvite}</button>}
          <button type="button" className="btn sm ghost" onClick={toggleArchive}>{client.status === 'archived' ? 'Unarchive' : 'Archive'}</button>
          <button type="button" className="btn sm ghost cc-danger" disabled={busy} onClick={deleteClient}>{ADMIN.deleteButton}</button>
        </div>
      </div>

      {checkins.length > 0 && (
        <div className="card cc-sec">
          <h3 className="cc-h">Urge trend</h3>
          <UrgeChart points={checkins.map((k) => ({ date: k.checkin_date, urge: k.urge_intensity, acted: k.acted_out }))} />
          {topTriggers.length > 0 && (
            <>
              <h3 className="cc-h" style={{ marginTop: 16 }}>{ADMIN.triggerFreqTitle}</h3>
              <p className="cc-freq">{topTriggers.map((t) => <span key={t.label}><b>{t.n}×</b> {t.label} &nbsp; </span>)}</p>
            </>
          )}
        </div>
      )}

      <ItemsEditor title={ADMIN.triggersTitle} note={ADMIN.triggersNote} table="client_triggers"
        items={triggers} clientId={client.id} onChange={load} withDate={false} />
      <ItemsEditor title={ADMIN.protocolTitle} note={ADMIN.protocolNote} table="client_protocol_items"
        items={protocol} clientId={client.id} onChange={load} withDate={true} />

      <div className="card cc-sec cc-notes">
        <h3 className="cc-h">{ADMIN.notesTitle}</h3>
        <textarea value={notes} placeholder={ADMIN.notesPlaceholder} onChange={(e) => setNotes(e.target.value)} />
        <div className="cc-actions"><button type="button" className="btn sm primary" onClick={saveNotes}>{ADMIN.notesSave}</button></div>
      </div>

      <div className="card cc-sec">
        <h3 className="cc-h">{ADMIN.intakeTitle}</h3>
        {!intake?.submitted_at && <p className="cc-note">{ADMIN.intakeNotSubmitted}</p>}
        {intake?.submitted_at && INTAKE_QUESTIONS.map((q) => (
          <div key={q.id}>
            <div className="cc-intake-q">{q.label}</div>
            <div className="cc-intake-a">{intake.answers[q.id] || '—'}</div>
          </div>
        ))}
      </div>

      <h3 className="cc-h">Check-ins</h3>
      <CheckinList checkins={checkins} replies={replies} trigLabel={trigLabel}
        protocol={protocol} onChange={load} setErr={setErr} />
    </>
  );
}

function ItemsEditor({ title, note, table, items, clientId, onChange, withDate }) {
  const [label, setLabel] = useState('');
  const [startsOn, setStartsOn] = useState('');

  const add = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    const row = { client_id: clientId, label: label.trim(), sort_order: items.length };
    if (withDate && startsOn) row.starts_on = startsOn;
    const { error } = await supabase.from(table).insert(row);
    if (!error) { setLabel(''); setStartsOn(''); onChange(); }
  };
  const toggle = async (it) => {
    await supabase.from(table).update({ active: !it.active }).eq('id', it.id);
    onChange();
  };
  const remove = async (it) => {
    if (!window.confirm(`Remove "${it.label}"?`)) return;
    await supabase.from(table).delete().eq('id', it.id);
    onChange();
  };

  return (
    <div className="card cc-sec">
      <h3 className="cc-h">{title}</h3>
      <p className="cc-note">{note}</p>
      {items.map((it) => (
        <div key={it.id} className={'cc-item' + (it.active ? '' : ' off')}>
          <span className="lbl">{it.label}</span>
          {withDate && it.starts_on && <span className="from">from {fmtNice(it.starts_on)}</span>}
          <button type="button" className="btn sm ghost" onClick={() => toggle(it)}>{it.active ? 'Pause' : 'Activate'}</button>
          <button type="button" className="btn sm ghost cc-danger" onClick={() => remove(it)}>Remove</button>
        </div>
      ))}
      <form className="ca-add" onSubmit={add}>
        <input type="text" placeholder="New item…" value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
        {withDate && <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} title="Appears from this date (optional)" />}
        <button type="submit" className="btn sm primary">Add</button>
      </form>
    </div>
  );
}

function CheckinList({ checkins, replies, trigLabel, protocol, onChange, setErr }) {
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const replyByCheckin = new Map(replies.map((r) => [r.checkin_id, r]));
  const protoLabel = new Map(protocol.map((p) => [p.id, p.label]));
  const sorted = [...checkins].sort((a, b) => (a.checkin_date < b.checkin_date ? 1 : -1));

  const saveReply = async (k) => {
    const body = (drafts[k.id] ?? replyByCheckin.get(k.id)?.body ?? '').trim();
    setBusyId(k.id);
    const { error } = await supabase.from('checkin_replies').upsert({ checkin_id: k.id, body });
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setDrafts((d) => ({ ...d, [k.id]: undefined }));
    onChange();
  };

  if (sorted.length === 0) return <p className="muted">No check-ins yet.</p>;

  return sorted.map((k) => {
    const trigs = k.trigger_ids.map((id) => trigLabel.get(id)).filter(Boolean);
    const done = k.protocol_done_ids.map((id) => protoLabel.get(id)).filter(Boolean);
    const reply = replyByCheckin.get(k.id);
    return (
      <div key={k.id} className="card cc-ci">
        <div className="cc-ci-head">
          <strong>{fmtNice(k.checkin_date)}</strong>
          <span className="cc-tag">urge {k.urge_intensity}/10</span>
          {k.acted_out && <span className="cc-tag red">ACTED OUT</span>}
          {k.sleep_hours != null && <span className="cc-tag">{k.sleep_hours}h sleep</span>}
          <span className="cc-tag">{k.moved ? 'moved' : 'no movement'}</span>
        </div>
        {(trigs.length > 0 || k.trigger_other) && (
          <p className="cc-ci-line"><em>Triggers:</em> {[...trigs, k.trigger_other].filter(Boolean).join(' · ')}</p>
        )}
        {k.moved && k.movement_note && <p className="cc-ci-line"><em>Movement:</em> {k.movement_note}</p>}
        {done.length > 0 && <p className="cc-ci-line"><em>Protocol:</em> {done.join(' · ')}</p>}
        {k.win && <p className="cc-ci-line"><em>Win:</em> {k.win}</p>}
        {k.tomorrow_focus && <p className="cc-ci-line"><em>Tomorrow:</em> {k.tomorrow_focus}</p>}
        <div className="cc-reply">
          <textarea placeholder={ADMIN.replyPlaceholder}
            value={drafts[k.id] ?? reply?.body ?? ''}
            onChange={(e) => setDrafts((d) => ({ ...d, [k.id]: e.target.value }))} />
          <button type="button" className="btn sm primary" disabled={busyId === k.id}
            onClick={() => saveReply(k)}>{ADMIN.replySave}</button>
        </div>
      </div>
    );
  });
}
