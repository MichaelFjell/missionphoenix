import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { supabase, isSupabaseConfigured } from './supabase.js';
import { PORTAL } from './coachingContent.js';
import { localDateISO, daysBetween, computeStreak, fmtNice } from './portal/portalUtils.js';
import PortalCheckin from './portal/PortalCheckin.jsx';
import PortalHistory from './portal/PortalHistory.jsx';
import PortalIntake from './portal/PortalIntake.jsx';

export const PORTAL_STYLES = `
  .pt-title{font-size:clamp(24px,4vw,32px);font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;}
  .pt-sep{width:60px;height:2px;background:var(--copper);margin-bottom:24px;border-radius:2px;}
  .pt-lede{font-size:15px;line-height:1.7;color:var(--ink-2);margin-bottom:22px;max-width:560px;}
  .pt-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
  .pt-day{font-size:14px;color:var(--ink-2);font-weight:600;}
  .pt-streak{font-size:14px;color:var(--copper);font-weight:800;}
  .pt-tabs{display:flex;gap:8px;margin-bottom:22px;flex-wrap:wrap;}
  .pt-tab{padding:10px 18px;border-radius:999px;border:1px solid var(--line-2);background:transparent;color:var(--ink-2);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}
  .pt-tab.on{background:var(--copper);border-color:var(--copper);color:var(--on-accent);}
  .pt-tab .pt-badge{display:inline-block;margin-left:6px;width:8px;height:8px;border-radius:50%;background:#d06552;}
  .pt-block{padding:20px;margin-bottom:14px;}
  .pt-q{display:block;font-size:14px;font-weight:800;margin-bottom:10px;}
  .pt-hint{font-size:13px;color:var(--ink-3);line-height:1.6;margin-bottom:10px;}
  .pt-urge-val{font-size:40px;font-weight:800;color:var(--copper);line-height:1;margin-bottom:10px;}
  .pt-urge-val span{font-size:16px;color:var(--ink-3);font-weight:600;}
  .pt-slider{width:100%;accent-color:var(--copper);height:34px;}
  .pt-slider-ends{display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);letter-spacing:0.5px;text-transform:uppercase;}
  .pt-yn{display:flex;gap:10px;}
  .pt-yn-btn{flex:1;padding:16px;border-radius:12px;border:1px solid var(--line-2);background:transparent;color:var(--ink);font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;}
  .pt-yn-btn.on{background:var(--copper);border-color:var(--copper);color:var(--on-accent);}
  .pt-yn-btn.red.on{background:#d06552;border-color:#d06552;}
  .pt-checks{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;}
  .pt-checks.col{flex-direction:column;}
  .pt-check{display:inline-flex;align-items:center;gap:9px;padding:12px 14px;border:1px solid var(--line-2);border-radius:12px;font-size:14px;cursor:pointer;color:var(--ink-2);}
  .pt-check.on{border-color:var(--copper);color:var(--ink);background:var(--copper-soft);}
  .pt-check input{accent-color:var(--copper);width:17px;height:17px;}
  .pt-other{margin-top:8px;}
  .pt-sleep{max-width:140px;}
  .pt-submit{width:100%;justify-content:center;padding:17px;font-size:16px;margin-top:4px;}
  .pt-err{color:#d06552;font-size:14px;margin-bottom:12px;}
  .pt-saved{color:var(--copper);font-size:14px;margin-bottom:12px;font-weight:600;}
  .pt-done-note{font-size:13px;color:var(--copper);margin-bottom:14px;font-weight:600;}
  .pt-cal{display:grid;grid-template-columns:repeat(auto-fill,minmax(36px,1fr));gap:6px;margin-bottom:12px;}
  .pt-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:9px;font-size:12px;font-weight:700;border:1px solid var(--line);color:var(--ink-3);}
  .pt-cell.done{background:var(--copper);border-color:var(--copper);color:var(--on-accent);}
  .pt-cell.missed{border-color:#d06552;color:#d06552;}
  .pt-cell.open{border-color:var(--copper);color:var(--copper);}
  .pt-cell.today{outline:2px solid var(--copper-2);outline-offset:1px;}
  .pt-legend{display:flex;gap:16px;font-size:12px;color:var(--ink-3);flex-wrap:wrap;}
  .pt-legend span{display:inline-flex;align-items:center;gap:6px;}
  .pt-dot{width:10px;height:10px;border-radius:3px;display:inline-block;}
  .pt-dot.done{background:var(--copper);}
  .pt-dot.missed{border:1px solid #d06552;}
  .pt-dot.today{outline:2px solid var(--copper-2);}
  .pt-past{padding:16px 18px;}
  .pt-past-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:14px;}
  .pt-tag{font-size:11px;font-weight:700;letter-spacing:0.5px;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;padding:2px 9px;}
  .pt-tag.red{color:#d06552;border-color:#d06552;}
  .pt-past-line{font-size:14px;line-height:1.6;color:var(--ink-2);margin-bottom:4px;}
  .pt-reply{margin-top:10px;border-left:3px solid var(--copper);padding:6px 0 6px 12px;font-size:14px;line-height:1.6;color:var(--ink);}
  .pt-reply-who{font-weight:800;color:var(--copper);}
  .pt-intake-actions{display:flex;gap:10px;flex-wrap:wrap;}
  .pt-intake-actions .btn{flex:1;justify-content:center;}
  .pt-logout{background:none;border:none;color:var(--ink-3);font-size:13px;cursor:pointer;font-family:inherit;text-decoration:underline;padding:0;}
  @media(max-width:600px){ .pt-block{padding:16px;} main.page{padding-top:20px;} }
`;

function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    setBusy(false);
    if (error) setErr(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{PORTAL.loginTitle}</h2>
      <p className="pt-hint">{PORTAL.loginLede}</p>
      <form onSubmit={submit}>
        <div className="field-wrap">
          <label className="field" htmlFor="pl-email">{PORTAL.emailLabel}</label>
          <input id="pl-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field-wrap">
          <label className="field" htmlFor="pl-pass">{PORTAL.passwordLabel}</label>
          <input id="pl-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <p className="pt-err">{err}</p>}
        <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Logging in…' : PORTAL.loginButton}
        </button>
      </form>
      <p style={{ marginTop: 14, fontSize: 13 }}>
        <Link to="/portal/reset" className="copper">{PORTAL.forgotLink}</Link>
      </p>
    </div>
  );
}

export default function Portal() {
  const { user, profile, loading, signOut } = useAuth() || {};
  const [client, setClient] = useState(undefined); // undefined = loading, null = none
  const [triggers, setTriggers] = useState([]);
  const [protocol, setProtocol] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [replies, setReplies] = useState([]);
  const [intake, setIntake] = useState(null);
  const [tab, setTab] = useState(null);

  const loadAll = useCallback(async (uid) => {
    const { data: c } = await supabase.from('coaching_clients').select('*').eq('user_id', uid).maybeSingle();
    setClient(c || null);
    if (!c) return;
    const [tr, pr, ck, rp, ik] = await Promise.all([
      supabase.from('client_triggers').select('*').eq('client_id', c.id).order('sort_order'),
      supabase.from('client_protocol_items').select('*').eq('client_id', c.id).order('sort_order'),
      supabase.from('client_checkins').select('*').eq('client_id', c.id).order('checkin_date'),
      supabase.from('checkin_replies').select('*'),
      supabase.from('client_intake').select('*').eq('client_id', c.id).maybeSingle(),
    ]);
    setTriggers(tr.data || []);
    setProtocol(pr.data || []);
    setCheckins(ck.data || []);
    setReplies(rp.data || []);
    setIntake(ik.data || null);
    setTab((t) => t || (!ik.data?.submitted_at ? 'intake' : 'today'));
  }, []);

  useEffect(() => {
    if (user) loadAll(user.id);
    else setClient(undefined);
  }, [user, loadAll]);

  if (!isSupabaseConfigured()) return <main className="page narrow"><p className="muted">Supabase is not configured.</p></main>;

  const refreshCheckins = async () => {
    if (!client) return;
    const { data } = await supabase.from('client_checkins').select('*').eq('client_id', client.id).order('checkin_date');
    setCheckins(data || []);
  };
  const refreshIntake = async () => {
    if (!client) return;
    const { data } = await supabase.from('client_intake').select('*').eq('client_id', client.id).maybeSingle();
    setIntake(data || null);
  };

  let body;
  if (loading || (user && client === undefined)) {
    body = <p className="muted">Loading…</p>;
  } else if (!user) {
    body = <ClientLogin />;
  } else if (!client) {
    body = (
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <p className="pt-hint" style={{ marginBottom: 14 }}>{PORTAL.noPortal}</p>
        {profile?.is_admin && <p style={{ fontSize: 14 }}><Link className="copper" to="/coaching/admin">Go to the admin dashboard →</Link></p>}
        <button type="button" className="pt-logout" onClick={signOut}>{PORTAL.logout}</button>
      </div>
    );
  } else {
    const todayISO = localDateISO(client.timezone);
    const total = daysBetween(client.start_date, client.end_date) + 1;
    const dayNum = Math.min(Math.max(daysBetween(client.start_date, todayISO) + 1, 0), total);
    const streak = computeStreak(new Set(checkins.map((c) => c.checkin_date)), todayISO);
    const todayCheckin = checkins.find((c) => c.checkin_date === todayISO) || null;
    const ended = todayISO > client.end_date || client.status === 'completed' || client.status === 'archived';
    const notStarted = todayISO < client.start_date;

    body = (
      <>
        <div className="pt-head">
          <span className="pt-day">{PORTAL.dayCounter(dayNum, total)}</span>
          <span className="pt-streak">🔥 {streak} {PORTAL.streakLabel}</span>
          <button type="button" className="pt-logout" onClick={signOut}>{PORTAL.logout}</button>
        </div>
        <div className="pt-tabs">
          <button type="button" className={'pt-tab' + (tab === 'today' ? ' on' : '')} onClick={() => setTab('today')}>{PORTAL.tabs.today}</button>
          <button type="button" className={'pt-tab' + (tab === 'history' ? ' on' : '')} onClick={() => setTab('history')}>{PORTAL.tabs.history}</button>
          <button type="button" className={'pt-tab' + (tab === 'intake' ? ' on' : '')} onClick={() => setTab('intake')}>
            {PORTAL.tabs.intake}{!intake?.submitted_at && <span className="pt-badge"></span>}
          </button>
        </div>
        {tab === 'today' && (
          ended ? <p className="pt-lede">{PORTAL.programEnded}</p>
          : notStarted ? <p className="pt-lede">{PORTAL.programNotStarted(fmtNice(client.start_date))}</p>
          : <PortalCheckin key={todayCheckin ? todayCheckin.id : 'new'} client={client} triggers={triggers}
              protocol={protocol} todayISO={todayISO} existing={todayCheckin} onSaved={refreshCheckins} />
        )}
        {tab === 'history' && (
          <PortalHistory client={client} checkins={checkins} replies={replies} triggers={triggers} todayISO={todayISO} />
        )}
        {tab === 'intake' && (
          <PortalIntake client={client} intake={intake} onSaved={refreshIntake} />
        )}
      </>
    );
  }

  return (
    <>
      <style>{PORTAL_STYLES}</style>
      <main className="page narrow" style={{ maxWidth: 620 }}>
        <h1 className="pt-title">{PORTAL.title}</h1>
        <div className="pt-sep"></div>
        {body}
      </main>
    </>
  );
}
