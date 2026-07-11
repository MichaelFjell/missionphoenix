import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './main.jsx';
import { supabase, isSupabaseConfigured } from './supabase.js';
import CoachingClients from './CoachingClients.jsx';
import { ADMIN } from './coachingContent.js';

const WEEKDAYS = [
  { v: 1, label: 'Monday' }, { v: 2, label: 'Tuesday' }, { v: 3, label: 'Wednesday' },
  { v: 4, label: 'Thursday' }, { v: 5, label: 'Friday' }, { v: 6, label: 'Saturday' },
  { v: 7, label: 'Sunday' },
];

const fmtStockholm = (iso) => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Stockholm', weekday: 'short', day: 'numeric', month: 'short',
  hour: '2-digit', minute: '2-digit',
}).format(new Date(iso));

const fmtClient = (iso, tz) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
};

const hhmm = (t) => (t || '').slice(0, 5);

function Login() {
  const { signIn } = useAuth() || {};
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signIn(username, password);
    } catch (ex) {
      setErr(ex.message || 'Login failed.');
    }
    setBusy(false);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Admin login</h2>
      <form onSubmit={submit}>
        <div className="field-wrap">
          <label className="field" htmlFor="ca-user">Username</label>
          <input id="ca-user" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field-wrap">
          <label className="field" htmlFor="ca-pass">Password</label>
          <input id="ca-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <p style={{ color: '#d06552', fontSize: 14, marginBottom: 14 }}>{err}</p>}
        <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

function Bookings() {
  const [rows, setRows] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [drafts, setDrafts] = useState({}); // id -> zoom link being edited
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    let q = supabase.from('bookings').select('*');
    if (showAll) {
      q = q.order('starts_at', { ascending: false }).limit(100);
    } else {
      q = q.eq('status', 'confirmed')
        .gte('starts_at', new Date(Date.now() - 60 * 60000).toISOString())
        .order('starts_at', { ascending: true });
    }
    const { data, error } = await q;
    if (error) setErr(error.message);
    setRows(data || []);
  }, [showAll]);

  useEffect(() => { load(); }, [load]);

  const saveZoom = async (b) => {
    const link = (drafts[b.id] ?? b.zoom_link).trim();
    if (!link) return;
    if (!window.confirm(`Save this Zoom link and email it to ${b.email}?`)) return;
    setBusyId(b.id);
    const { error } = await supabase.from('bookings').update({ zoom_link: link }).eq('id', b.id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setDrafts((d) => ({ ...d, [b.id]: undefined }));
    load();
  };

  const cancel = async (b) => {
    if (!window.confirm(`Cancel the call with ${b.name} (${fmtStockholm(b.starts_at)})?\nThis frees the slot and emails ${b.email}.`)) return;
    setBusyId(b.id);
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    load();
  };

  if (rows === null) return <p className="muted">Loading…</p>;

  return (
    <>
      <div className="ca-bar">
        <label className="ca-toggle">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show past &amp; cancelled
        </label>
      </div>
      {err && <p className="ca-err">{err}</p>}
      {rows.length === 0 && <p className="muted">No {showAll ? '' : 'upcoming '}bookings.</p>}
      <div className="ca-list">
        {rows.map((b) => (
          <div key={b.id} className={'card ca-booking' + (b.status === 'cancelled' ? ' cancelled' : '')}>
            <div className="ca-when">
              <strong>{fmtStockholm(b.starts_at)}</strong>
              <span className="ca-tag">Stockholm</span>
              {b.status === 'cancelled' && <span className="ca-tag red">cancelled</span>}
            </div>
            {b.client_timezone !== 'Europe/Stockholm' && (
              <div className="ca-client-time">
                Their time: {fmtClient(b.starts_at, b.client_timezone)} ({b.client_timezone})
              </div>
            )}
            <div className="ca-who">
              {b.name} · <a href={`mailto:${b.email}`}>{b.email}</a>
            </div>
            <div className="ca-msg-label">Where they are / what they want:</div>
            <blockquote className="ca-msg">{b.message}</blockquote>
            {b.status === 'confirmed' && (
              <>
                <div className="ca-zoom">
                  <input
                    type="text"
                    placeholder="Paste Zoom link…"
                    value={drafts[b.id] ?? b.zoom_link}
                    onChange={(e) => setDrafts((d) => ({ ...d, [b.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="btn sm primary"
                    disabled={busyId === b.id || !((drafts[b.id] ?? b.zoom_link).trim())}
                    onClick={() => saveZoom(b)}
                  >
                    {b.zoom_link ? 'Resend' : 'Save & email'}
                  </button>
                </div>
                {b.zoom_link && <div className="ca-zoom-sent">Zoom link emailed to client.</div>}
                <div className="ca-actions">
                  <button type="button" className="btn sm ghost ca-cancel" disabled={busyId === b.id} onClick={() => cancel(b)}>
                    Cancel booking
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Availability() {
  const [rules, setRules] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [newRule, setNewRule] = useState({ weekday: 2, start: '18:00', end: '21:00' });
  const [newBlock, setNewBlock] = useState({ day: '', reason: '' });
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    const [r1, r2] = await Promise.all([
      supabase.from('availability_rules').select('*').order('weekday').order('start_time'),
      supabase.from('blocked_dates').select('*').order('day'),
    ]);
    if (r1.error || r2.error) setErr((r1.error || r2.error).message);
    setRules(r1.data || []);
    setBlocked(r2.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addRule = async (e) => {
    e.preventDefault();
    if (newRule.end <= newRule.start) { setErr('End time must be after start time.'); return; }
    const { error } = await supabase.from('availability_rules').insert({
      weekday: newRule.weekday, start_time: newRule.start, end_time: newRule.end,
    });
    if (error) { setErr(error.message); return; }
    load();
  };

  const toggleRule = async (r) => {
    const { error } = await supabase.from('availability_rules').update({ active: !r.active }).eq('id', r.id);
    if (error) setErr(error.message); else load();
  };

  const deleteRule = async (r) => {
    if (!window.confirm(`Remove ${WEEKDAYS.find((w) => w.v === r.weekday)?.label} ${hhmm(r.start_time)}–${hhmm(r.end_time)}?`)) return;
    const { error } = await supabase.from('availability_rules').delete().eq('id', r.id);
    if (error) setErr(error.message); else load();
  };

  const addBlock = async (e) => {
    e.preventDefault();
    if (!newBlock.day) return;
    const { error } = await supabase.from('blocked_dates').insert({ day: newBlock.day, reason: newBlock.reason });
    if (error) { setErr(error.message.includes('duplicate') ? 'That date is already blocked.' : error.message); return; }
    setNewBlock({ day: '', reason: '' });
    load();
  };

  const removeBlock = async (b) => {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', b.id);
    if (error) setErr(error.message); else load();
  };

  if (rules === null || blocked === null) return <p className="muted">Loading…</p>;

  return (
    <>
      {err && <p className="ca-err">{err}</p>}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="ca-h3">Weekly hours</h3>
        <p className="ca-note">
          Times are Europe/Stockholm. Calls are 30 min with a 15 min buffer, so 18:00–21:00
          gives slots at 18:00, 18:45, 19:30 and 20:15. Visitors can book 24 h to 3 weeks ahead.
        </p>
        {rules.length === 0 && <p className="muted">No weekly hours defined — nobody can book.</p>}
        {rules.map((r) => (
          <div key={r.id} className={'ca-rule' + (r.active ? '' : ' off')}>
            <span className="ca-rule-day">{WEEKDAYS.find((w) => w.v === r.weekday)?.label}</span>
            <span className="ca-rule-time">{hhmm(r.start_time)} – {hhmm(r.end_time)}</span>
            <button type="button" className="btn sm ghost" onClick={() => toggleRule(r)}>
              {r.active ? 'Pause' : 'Activate'}
            </button>
            <button type="button" className="btn sm ghost ca-cancel" onClick={() => deleteRule(r)}>Remove</button>
          </div>
        ))}
        <form className="ca-add" onSubmit={addRule}>
          <select value={newRule.weekday} onChange={(e) => setNewRule({ ...newRule, weekday: Number(e.target.value) })}>
            {WEEKDAYS.map((w) => <option key={w.v} value={w.v}>{w.label}</option>)}
          </select>
          <input type="time" value={newRule.start} onChange={(e) => setNewRule({ ...newRule, start: e.target.value })} required />
          <span className="muted">to</span>
          <input type="time" value={newRule.end} onChange={(e) => setNewRule({ ...newRule, end: e.target.value })} required />
          <button type="submit" className="btn sm primary">Add hours</button>
        </form>
      </div>

      <div className="card">
        <h3 className="ca-h3">Blocked dates</h3>
        <p className="ca-note">Block a specific date (holiday, travel). No slots are offered that day.</p>
        {blocked.length === 0 && <p className="muted">No blocked dates.</p>}
        {blocked.map((b) => (
          <div key={b.id} className="ca-rule">
            <span className="ca-rule-day">{b.day}</span>
            <span className="ca-rule-time">{b.reason}</span>
            <button type="button" className="btn sm ghost ca-cancel" onClick={() => removeBlock(b)}>Unblock</button>
          </div>
        ))}
        <form className="ca-add" onSubmit={addBlock}>
          <input type="date" value={newBlock.day} onChange={(e) => setNewBlock({ ...newBlock, day: e.target.value })} required />
          <input type="text" placeholder="Reason (optional)" value={newBlock.reason}
            onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })} style={{ flex: 1, minWidth: 140 }} />
          <button type="submit" className="btn sm primary">Block date</button>
        </form>
      </div>
    </>
  );
}

export default function CoachingAdmin() {
  const { user, profile, loading } = useAuth() || {};
  const [tab, setTab] = useState('clients');

  if (!isSupabaseConfigured()) return <main className="page narrow"><p className="muted">Supabase is not configured.</p></main>;

  return (
    <>
      <style>{`
        .ca-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .ca-sep{width:60px;height:2px;background:var(--copper);margin-bottom:32px;border-radius:2px;}
        .ca-tabs{display:flex;gap:8px;margin-bottom:28px;}
        .ca-tab{padding:10px 20px;border-radius:999px;border:1px solid var(--line-2);background:transparent;color:var(--ink-2);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}
        .ca-tab.on{background:var(--copper);border-color:var(--copper);color:var(--on-accent);}
        .ca-bar{margin-bottom:18px;}
        .ca-toggle{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:var(--ink-2);cursor:pointer;}
        .ca-err{color:#d06552;font-size:14px;margin-bottom:14px;}
        .ca-list{display:flex;flex-direction:column;gap:14px;}
        .ca-booking{padding:22px 24px;}
        .ca-booking.cancelled{opacity:0.55;}
        .ca-when{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:16px;margin-bottom:4px;}
        .ca-tag{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;padding:2px 10px;}
        .ca-tag.red{color:#d06552;border-color:#d06552;}
        .ca-client-time{font-size:13px;color:var(--ink-3);margin-bottom:6px;}
        .ca-who{font-size:14px;color:var(--ink-2);margin-bottom:14px;}
        .ca-who a{color:var(--copper);}
        .ca-msg-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ink-3);margin-bottom:6px;}
        .ca-msg{border-left:3px solid var(--copper);padding:4px 0 4px 14px;font-size:14px;line-height:1.7;color:var(--ink-2);white-space:pre-wrap;margin-bottom:16px;}
        .ca-zoom{display:flex;gap:10px;flex-wrap:wrap;}
        .ca-zoom input{flex:1;min-width:200px;padding:10px 14px;font-size:14px;}
        .ca-zoom-sent{font-size:12px;color:var(--copper);margin-top:6px;}
        .ca-actions{margin-top:14px;}
        .ca-cancel:hover{border-color:#d06552!important;color:#d06552!important;}
        .ca-h3{font-size:16px;font-weight:800;margin-bottom:8px;}
        .ca-note{font-size:13px;color:var(--ink-3);line-height:1.6;margin-bottom:18px;}
        .ca-rule{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid var(--line);}
        .ca-rule.off{opacity:0.45;}
        .ca-rule-day{font-weight:700;font-size:14px;min-width:90px;}
        .ca-rule-time{font-size:14px;color:var(--ink-2);flex:1;}
        .ca-add{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px;}
        .ca-add select,.ca-add input{width:auto;padding:10px 12px;font-size:14px;}
      `}</style>
      <main className="page narrow">
        <h1 className="ca-title">Coaching admin</h1>
        <div className="ca-sep"></div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !user ? (
          <Login />
        ) : !profile?.is_admin ? (
          <p className="muted">This page is for the site admin only.</p>
        ) : (
          <>
            <div className="ca-tabs">
              <button type="button" className={'ca-tab' + (tab === 'clients' ? ' on' : '')} onClick={() => setTab('clients')}>{ADMIN.tab}</button>
              <button type="button" className={'ca-tab' + (tab === 'bookings' ? ' on' : '')} onClick={() => setTab('bookings')}>Bookings</button>
              <button type="button" className={'ca-tab' + (tab === 'availability' ? ' on' : '')} onClick={() => setTab('availability')}>Availability</button>
            </div>
            {tab === 'clients' ? <CoachingClients /> : tab === 'bookings' ? <Bookings /> : <Availability />}
          </>
        )}
      </main>
    </>
  );
}
