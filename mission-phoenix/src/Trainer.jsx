import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { isSupabaseConfigured } from './supabase.js';
import { loadProgram, loadWorkouts, flushUnsynced } from './trainer/store.js';
import { hasKey } from './trainer/anthropic.js';
import './trainer.css';

function AuthForm() {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') await signUp(username.trim(), password);
      else await signIn(username.trim(), password);
    } catch (err) {
      if (err.message.includes('Invalid login')) setError('Wrong username or password');
      else if (err.message.includes('already registered')) setError('Username already taken');
      else setError(err.message);
    }
    setLoading(false);
  };
  return (
    <main className="page narrow">
      <div style={{ maxWidth: 400, margin: '60px auto', padding: '40px 8px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 8 }}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 28, lineHeight: 1.6 }}>
          {mode === 'login' ? 'Track your training.' : 'No email needed. Just pick a username.'}
        </p>
        {error && (
          <div style={{ fontSize: 13, color: '#b82030', marginBottom: 16, padding: '10px 14px',
            border: '1px solid rgba(184,32,48,0.3)', background: 'rgba(184,32,48,0.06)', borderRadius: 8 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input className="input" type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} autoComplete="username"
            style={{ marginBottom: 12 }} />
          <input className="input" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            style={{ marginBottom: 12 }} />
          <button type="submit" disabled={loading} style={{
            width: '100%', fontWeight: 700, letterSpacing: 3, padding: 14,
            background: 'transparent', color: 'var(--copper)', border: '1px solid var(--copper)',
            cursor: 'pointer', marginTop: 8, fontSize: 13, textTransform: 'uppercase',
            fontFamily: 'inherit', borderRadius: 8, opacity: loading ? 0.5 : 1,
          }}>
            {loading ? '...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          style={{ fontSize: 14, color: 'var(--ink-3)', background: 'none', border: 'none',
            cursor: 'pointer', marginTop: 20, textDecoration: 'underline',
            textUnderlineOffset: 3, fontFamily: 'inherit', padding: 0 }}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </main>
  );
}

const DAY = 86400000;
function startOfWeek(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}
function weekKey(d) { return startOfWeek(d).toISOString().slice(0, 10); }

function computeStreak(workouts) {
  // Consecutive past weeks (including current) where A, B, and C all logged.
  const byWeek = new Map();
  for (const w of workouts) {
    const k = weekKey(new Date(w.performed_at));
    if (!byWeek.has(k)) byWeek.set(k, new Set());
    byWeek.get(k).add(w.code);
  }
  let streak = 0;
  let cursor = startOfWeek(new Date());
  while (true) {
    const k = cursor.toISOString().slice(0, 10);
    const set = byWeek.get(k);
    const complete = set && set.has('A') && set.has('B') && set.has('C');
    if (complete) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 7 * DAY);
    } else {
      // current week incomplete still doesn't break the streak — only past weeks do.
      const isCurrent = streak === 0 && k === weekKey(new Date());
      if (isCurrent) {
        cursor = new Date(cursor.getTime() - 7 * DAY);
        continue;
      }
      break;
    }
  }
  return streak;
}

function Dashboard() {
  const { user } = useAuth();
  const [program, setProgram] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, w] = await Promise.all([
        loadProgram(user?.id),
        loadWorkouts(user?.id, { limit: 50 }),
      ]);
      if (cancelled) return;
      setProgram(p);
      setWorkouts(w);
      setLoading(false);
      flushUnsynced(user?.id);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    const onOnline = () => flushUnsynced(user?.id);
    window.addEventListener('online', onOnline);
    window.addEventListener('focus', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('focus', onOnline);
    };
  }, [user?.id]);

  const streak = useMemo(() => computeStreak(workouts), [workouts]);
  const aiOn = hasKey();

  const lastByCode = useMemo(() => {
    const map = {};
    for (const w of workouts) {
      if (!map[w.code]) map[w.code] = w.performed_at;
    }
    return map;
  }, [workouts]);

  if (loading) {
    return (
      <main className="page narrow">
        <p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: 3 }}>Loading...</p>
      </main>
    );
  }

  return (
    <main className="page tr-page">
      <div className="eyebrow"><span className="d"></span>Personal Trainer</div>
      <h1 className="page-title">Train <em>with intent.</em></h1>

      <div className="tr-streak">
        <span className="n">{streak}</span>
        <span className="l">{streak === 1 ? 'week streak' : 'week streak'} <span style={{ color: 'var(--ink-3)', letterSpacing: 1 }}>· A · B · C</span></span>
      </div>

      <div className="tr-grid">
        {program.map(s => {
          const needsReview = (s.slots || []).some(sl => sl.needs_review);
          const last = lastByCode[s.code];
          return (
            <div className="tr-card" key={s.code}>
              {needsReview && <span className="review-dot" title="Some slots need review" />}
              <span className="code">{s.code}</span>
              <h3>{s.name}</h3>
              <div className="meta">
                {(s.slots || []).length} slots · last {last ? new Date(last).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'never'}
              </div>
              <Link to={`/trainer/session/${s.code}`} className="start" style={{ textDecoration: 'none' }}>
                Start session
              </Link>
            </div>
          );
        })}
      </div>

      {workouts.length > 0 && (
        <div className="tr-recent">
          <h2>Recent</h2>
          {workouts.slice(0, 5).map(w => {
            const d = new Date(w.performed_at);
            const totalSets = (w.sets || []).length;
            const exercises = [...new Set((w.sets || []).map(s => s.exercise_name))];
            return (
              <div className="row" key={w.client_id || w.id}>
                <span><b>{w.code}</b> · {exercises.slice(0, 3).join(', ')}{exercises.length > 3 ? `, +${exercises.length - 3}` : ''} · {totalSets} sets</span>
                <span className="d">{d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="tr-foot">
        <Link to="/trainer/settings">Settings &amp; program editor</Link>
        {!aiOn && <Link to="/trainer/settings">Enable AI features</Link>}
      </div>
    </main>
  );
}

export default function Trainer() {
  const { user, profile, loading } = useAuth();
  if (!isSupabaseConfigured()) {
    return (
      <main className="page narrow">
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, letterSpacing: 4, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>Trainer coming soon</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7 }}>The personal trainer is being set up.</p>
        </div>
      </main>
    );
  }
  if (loading) {
    return (
      <main className="page narrow">
        <p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: 3 }}>Loading...</p>
      </main>
    );
  }
  if (!user) return <AuthForm />;
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return <Dashboard />;
}
