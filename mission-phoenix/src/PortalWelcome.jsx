import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabase.js';
import { WELCOME } from './coachingContent.js';
import { PORTAL_STYLES } from './Portal.jsx';

// Invite landing page: validates the token, lets the client set a password,
// creates their auth account and links it to their client row.
export default function PortalWelcome() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [invite, setInvite] = useState(undefined); // undefined = loading, null = invalid
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !token) { setInvite(null); return; }
    supabase.rpc('get_invite', { p_token: token }).then(({ data, error }) => {
      setInvite(!error && data && data.length > 0 ? data[0] : null);
    });
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (password !== confirm) { setErr(WELCOME.passwordMismatch); return; }
    setBusy(true);
    // make sure no other session (e.g. admin) claims the invite
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signUp({ email: invite.client_email, password });
    if (error) {
      setBusy(false);
      setErr(/already/i.test(error.message) ? WELCOME.errorExists : error.message || WELCOME.errorGeneric);
      return;
    }
    if (!data.session) { setBusy(false); setErr(WELCOME.errorGeneric); return; }
    const { error: claimErr } = await supabase.rpc('claim_invite', { p_token: token });
    setBusy(false);
    if (claimErr) { setErr(WELCOME.errorGeneric); return; }
    navigate('/portal');
  };

  return (
    <>
      <style>{PORTAL_STYLES}</style>
      <main className="page narrow" style={{ maxWidth: 480 }}>
        <h1 className="pt-title">{WELCOME.title}</h1>
        <div className="pt-sep"></div>
        {invite === undefined && <p className="muted">Loading…</p>}
        {invite === null && <div className="card"><p className="pt-hint">{WELCOME.invalidToken}</p></div>}
        {invite && (
          <div className="card">
            <p className="pt-lede" style={{ marginBottom: 18 }}>{WELCOME.lede(invite.client_name)}</p>
            <form onSubmit={submit}>
              <div className="field-wrap">
                <label className="field" htmlFor="pw-email">Email</label>
                <input id="pw-email" type="email" value={invite.client_email} disabled autoComplete="username" />
              </div>
              <div className="field-wrap">
                <label className="field" htmlFor="pw-pass">{WELCOME.passwordLabel}</label>
                <input id="pw-pass" type="password" autoComplete="new-password" minLength={8}
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <p className="pt-hint" style={{ marginTop: 6, marginBottom: 0 }}>{WELCOME.passwordHint}</p>
              </div>
              <div className="field-wrap">
                <label className="field" htmlFor="pw-conf">{WELCOME.passwordConfirmLabel}</label>
                <input id="pw-conf" type="password" autoComplete="new-password" minLength={8}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              {err && <p className="pt-err">{err}</p>}
              <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                {busy ? WELCOME.submitting : WELCOME.submitButton}
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
