import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabase.js';
import { RESET, WELCOME } from './coachingContent.js';
import { PORTAL_STYLES } from './Portal.jsx';

// Password reset: without ?token= shows the request form,
// with ?token= shows the new-password form.
export default function PortalReset() {
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <>
      <style>{PORTAL_STYLES}</style>
      <main className="page narrow" style={{ maxWidth: 480 }}>
        <h1 className="pt-title">{token ? RESET.newTitle : RESET.requestTitle}</h1>
        <div className="pt-sep"></div>
        {!isSupabaseConfigured() ? <p className="muted">Supabase is not configured.</p>
          : token ? <NewPassword token={token} /> : <RequestForm />}
      </main>
    </>
  );
}

function RequestForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await supabase.rpc('request_portal_reset', { p_email: email.trim().toLowerCase() });
    setBusy(false);
    setSent(true);
  };

  if (sent) return <div className="card"><p className="pt-hint">{RESET.requestSent}</p></div>;
  return (
    <div className="card">
      <p className="pt-hint" style={{ marginBottom: 16 }}>{RESET.requestLede}</p>
      <form onSubmit={submit}>
        <div className="field-wrap">
          <label className="field" htmlFor="rq-email">Email</label>
          <input id="rq-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Sending…' : RESET.requestButton}
        </button>
      </form>
    </div>
  );
}

function NewPassword({ token }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (password !== confirm) { setErr(WELCOME.passwordMismatch); return; }
    setBusy(true);
    const { error } = await supabase.rpc('reset_portal_password', { p_token: token, p_password: password });
    setBusy(false);
    if (error) { setErr(RESET.invalidToken); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="card">
        <p className="pt-saved">{RESET.done}</p>
        <Link className="btn primary" to="/portal">{RESET.goLogin}</Link>
      </div>
    );
  }
  return (
    <div className="card">
      <form onSubmit={submit}>
        <div className="field-wrap">
          <label className="field" htmlFor="np-pass">{WELCOME.passwordLabel}</label>
          <input id="np-pass" type="password" autoComplete="new-password" minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="pt-hint" style={{ marginTop: 6, marginBottom: 0 }}>{WELCOME.passwordHint}</p>
        </div>
        <div className="field-wrap">
          <label className="field" htmlFor="np-conf">{WELCOME.passwordConfirmLabel}</label>
          <input id="np-conf" type="password" autoComplete="new-password" minLength={8}
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        {err && <p className="pt-err">{err} <Link className="copper" to="/portal/reset">{RESET.requestTitle}</Link></p>}
        <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Saving…' : RESET.newButton}
        </button>
      </form>
    </div>
  );
}
