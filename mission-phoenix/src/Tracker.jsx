import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './main.jsx';
import { supabase, isSupabaseConfigured } from './supabase.js';
import { Link } from 'react-router-dom';

// ─── AUTH FORM (shown when not logged in) ───────────────────
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
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(username.trim(), password);
      } else {
        await signIn(username.trim(), password);
      }
    } catch (err) {
      if (err.message.includes('Invalid login')) setError('Wrong username or password');
      else if (err.message.includes('already registered')) setError('Username already taken');
      else setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={authS.wrapper}>
      <div style={authS.box}>
        <h2 style={authS.title}>{mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}</h2>
        <p style={authS.sub}>
          {mode === 'login' ? 'Track your recovery streak.' : 'No email needed. Just pick a username.'}
        </p>
        {error && <div style={authS.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={authS.form}>
          <input type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} style={authS.input} autoComplete="username" />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} style={authS.input} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          <button type="submit" disabled={loading} style={{ ...authS.btn, opacity: loading ? 0.5 : 1 }}>
            {loading ? '...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
          </button>
        </form>
        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={authS.toggle}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}

const authS = {
  wrapper: { display: 'flex', justifyContent: 'center', padding: '80px 24px' },
  box: { maxWidth: '380px', width: '100%' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '5px', color: '#e8e4dc', marginBottom: '8px', fontWeight: 400 },
  sub: { fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 },
  error: { fontSize: '13px', color: '#b82030', marginBottom: '16px', padding: '10px 14px', border: '1px solid #b8203044', background: 'rgba(184,32,48,0.06)' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: '16px', padding: '14px 16px',
    background: 'rgba(15,15,15,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a',
    outline: 'none', transition: 'border-color 0.2s',
  },
  btn: {
    fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '4px',
    padding: '14px', background: 'transparent', color: '#c45a2a',
    border: '1px solid #c45a2a', cursor: 'pointer', marginTop: '8px',
  },
  toggle: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: '14px',
    color: '#555', background: 'none', border: 'none', cursor: 'pointer',
    marginTop: '20px', textDecoration: 'underline', textUnderlineOffset: '3px',
  },
};

// ─── TRACKER DASHBOARD ──────────────────────────────────────
function TrackerDashboard() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [habits, setHabits] = useState([]);
  const [checks, setChecks] = useState({});
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState(profile?.motivational_message || '');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Get last 30 days
  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last30.push(d.toISOString().split('T')[0]);
  }

  const loadData = useCallback(async () => {
    if (!user) return;
    const { data: habitsData } = await supabase
      .from('habits').select('*').eq('user_id', user.id).order('sort_order');

    if (habitsData) setHabits(habitsData);

    const thirtyAgo = last30[0];
    const { data: checksData } = await supabase
      .from('daily_checks').select('*')
      .eq('user_id', user.id)
      .gte('check_date', thirtyAgo);

    if (checksData) {
      const map = {};
      checksData.forEach(c => { map[`${c.habit_id}_${c.check_date}`] = c; });
      setChecks(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Create default habit on first load if none exist
  useEffect(() => {
    if (!loading && habits.length === 0 && user) {
      (async () => {
        const { data } = await supabase.from('habits').insert({
          user_id: user.id, name: 'No pornography', sort_order: 0
        }).select().single();
        if (data) setHabits([data]);
      })();
    }
  }, [loading, habits.length, user]);

  const toggleCheck = async (habitId, date) => {
    const key = `${habitId}_${date}`;
    const existing = checks[key];

    if (existing) {
      await supabase.from('daily_checks').delete().eq('id', existing.id);
      const next = { ...checks };
      delete next[key];
      setChecks(next);
    } else {
      const { data } = await supabase.from('daily_checks').insert({
        habit_id: habitId, user_id: user.id, check_date: date
      }).select().single();
      if (data) setChecks({ ...checks, [key]: data });
    }
  };

  const addHabit = async () => {
    if (!newHabit.trim()) return;
    const { data } = await supabase.from('habits').insert({
      user_id: user.id, name: newHabit.trim(), sort_order: habits.length
    }).select().single();
    if (data) setHabits([...habits, data]);
    setNewHabit('');
    setShowAdd(false);
  };

  const removeHabit = async (id) => {
    await supabase.from('daily_checks').delete().eq('habit_id', id);
    await supabase.from('habits').delete().eq('id', id);
    setHabits(habits.filter(h => h.id !== id));
    const next = { ...checks };
    Object.keys(next).forEach(k => { if (k.startsWith(id)) delete next[k]; });
    setChecks(next);
  };

  const getStreak = (habitId) => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (checks[`${habitId}_${ds}`]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const getTotalDays = (habitId) => {
    return Object.keys(checks).filter(k => k.startsWith(habitId)).length;
  };

  const saveSettings = async () => {
    await updateProfile({
      motivational_message: message,
      show_streak: profile.show_streak,
      show_total_days: profile.show_total_days,
      show_habits: profile.show_habits,
      show_message: profile.show_message,
      is_public: profile.is_public,
    });
  };

  const toggleProfileField = async (field) => {
    await updateProfile({ [field]: !profile[field] });
  };

  if (loading) return <div style={ds.loading}>Loading...</div>;

  return (
    <div style={ds.root}>
      <div style={ds.container}>
        {/* Header */}
        <div style={ds.header}>
          <div>
            <h1 style={ds.title}>RECOVERY TRACKER</h1>
            <p style={ds.subtitle}>Check off each day you complete your habits. Build your streak.</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} style={ds.settingsBtn}>
            {showSettings ? 'CLOSE' : 'SETTINGS'}
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={ds.settingsPanel}>
            <h3 style={ds.settingsTitle}>PROFILE SETTINGS</h3>

            <div style={ds.settingsRow}>
              <span style={ds.settingsLabel}>Public Profile</span>
              <button onClick={() => toggleProfileField('is_public')}
                style={{ ...ds.toggleBtn, background: profile.is_public ? '#c45a2a' : '#222' }}>
                {profile.is_public ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={ds.settingsRow}>
              <span style={ds.settingsLabel}>Show Streak</span>
              <button onClick={() => toggleProfileField('show_streak')}
                style={{ ...ds.toggleBtn, background: profile.show_streak ? '#c45a2a' : '#222' }}>
                {profile.show_streak ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={ds.settingsRow}>
              <span style={ds.settingsLabel}>Show Total Days</span>
              <button onClick={() => toggleProfileField('show_total_days')}
                style={{ ...ds.toggleBtn, background: profile.show_total_days ? '#c45a2a' : '#222' }}>
                {profile.show_total_days ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={ds.settingsRow}>
              <span style={ds.settingsLabel}>Show Habits</span>
              <button onClick={() => toggleProfileField('show_habits')}
                style={{ ...ds.toggleBtn, background: profile.show_habits ? '#c45a2a' : '#222' }}>
                {profile.show_habits ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={ds.settingsRow}>
              <span style={ds.settingsLabel}>Show Message</span>
              <button onClick={() => toggleProfileField('show_message')}
                style={{ ...ds.toggleBtn, background: profile.show_message ? '#c45a2a' : '#222' }}>
                {profile.show_message ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={ds.settingsLabel}>Motivational Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Why are you doing this? What keeps you going?"
                style={ds.textarea} maxLength={200} />
              <button onClick={saveSettings} style={ds.saveBtn}>SAVE MESSAGE</button>
            </div>
          </div>
        )}

        {/* Habits List */}
        {habits.map(habit => {
          const streak = getStreak(habit.id);
          const total = getTotalDays(habit.id);
          return (
            <div key={habit.id} style={ds.habitBlock}>
              <div style={ds.habitHeader}>
                <div style={ds.habitInfo}>
                  <span style={ds.habitName}>{habit.name}</span>
                  <div style={ds.habitStats}>
                    <span style={ds.streak}>
                      <span style={ds.streakNum}>{streak}</span> day streak
                    </span>
                    <span style={ds.totalDays}>{total} total days</span>
                  </div>
                </div>
                {habits.length > 1 && (
                  <button onClick={() => removeHabit(habit.id)} style={ds.removeBtn} title="Remove habit">×</button>
                )}
              </div>

              {/* Calendar grid */}
              <div style={ds.calendar}>
                {last30.map(date => {
                  const checked = !!checks[`${habit.id}_${date}`];
                  const isToday = date === today;
                  const dayNum = new Date(date + 'T12:00:00').getDate();
                  return (
                    <button key={date} onClick={() => toggleCheck(habit.id, date)}
                      title={date}
                      style={{
                        ...ds.dayCell,
                        background: checked ? '#c45a2a' : 'rgba(20,20,20,0.6)',
                        borderColor: isToday ? '#c45a2a' : checked ? '#c45a2a' : '#1a1a1a',
                        boxShadow: isToday ? '0 0 0 1px #c45a2a44' : 'none',
                        color: checked ? '#0a0a0a' : '#555',
                      }}>
                      <span style={ds.dayNum}>{dayNum}</span>
                      {checked && <span style={ds.checkMark}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add Habit */}
        {showAdd ? (
          <div style={ds.addForm}>
            <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
              placeholder="e.g. Meditated, Exercised, Read book..."
              style={ds.addInput} maxLength={50}
              onKeyDown={e => e.key === 'Enter' && addHabit()} autoFocus />
            <div style={ds.addBtns}>
              <button onClick={addHabit} style={ds.addConfirm}>ADD</button>
              <button onClick={() => { setShowAdd(false); setNewHabit(''); }} style={ds.addCancel}>CANCEL</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} style={ds.addHabitBtn}>
            + ADD HABIT TO TRACK
          </button>
        )}

        {/* Community Link */}
        <div style={ds.communityLink}>
          <Link to="/community" style={ds.communityAnchor}>
            VIEW COMMUNITY →
          </Link>
        </div>
      </div>
    </div>
  );
}

const ds = {
  root: { minHeight: '100vh' },
  container: { maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' },
  loading: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#555', textAlign: 'center', padding: '100px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '6px', color: '#e8e4dc', fontWeight: 400, margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#666', margin: 0, lineHeight: 1.6 },
  settingsBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '3px', padding: '8px 16px', background: 'none', color: '#555', border: '1px solid #333', cursor: 'pointer' },

  // Settings
  settingsPanel: { padding: '28px', background: 'rgba(15,15,15,0.8)', border: '1px solid #1a1a1a', marginBottom: '40px' },
  settingsTitle: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', color: '#666', fontWeight: 400, marginBottom: '20px' },
  settingsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #141414' },
  settingsLabel: { fontSize: '14px', color: '#888', display: 'block', marginBottom: '6px' },
  toggleBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '4px 14px', color: '#e8e4dc', border: 'none', cursor: 'pointer', minWidth: '50px' },
  textarea: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '15px', padding: '12px', background: 'rgba(10,10,10,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', resize: 'vertical', minHeight: '60px', marginTop: '4px' },
  saveBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '10px 20px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer', marginTop: '12px' },

  // Habit blocks
  habitBlock: { marginBottom: '36px', padding: '24px', background: 'rgba(15,15,15,0.4)', border: '1px solid #1a1a1a' },
  habitHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  habitInfo: { flex: 1 },
  habitName: { fontFamily: "'Oswald', sans-serif", fontSize: '15px', letterSpacing: '3px', color: '#e8e4dc' },
  habitStats: { display: 'flex', gap: '20px', marginTop: '6px' },
  streak: { fontSize: '13px', color: '#888' },
  streakNum: { fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: '#c45a2a', marginRight: '4px' },
  totalDays: { fontSize: '13px', color: '#555' },
  removeBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: '#444', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },

  // Calendar
  calendar: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))', gap: '4px' },
  dayCell: {
    width: '100%', aspectRatio: '1', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', border: '1px solid #1a1a1a',
    cursor: 'pointer', transition: 'all 0.15s', position: 'relative', padding: '2px',
  },
  dayNum: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', lineHeight: 1 },
  checkMark: { fontSize: '12px', lineHeight: 1, fontWeight: 'bold' },

  // Add habit
  addHabitBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '3px', padding: '16px 24px', background: 'none', color: '#555', border: '1px dashed #2a2a2a', cursor: 'pointer', width: '100%', transition: 'all 0.2s', marginBottom: '40px' },
  addForm: { padding: '20px', border: '1px solid #2a2a2a', marginBottom: '40px' },
  addInput: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '16px', padding: '12px', background: 'rgba(10,10,10,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', marginBottom: '12px' },
  addBtns: { display: 'flex', gap: '8px' },
  addConfirm: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '8px 20px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer' },
  addCancel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '8px 20px', background: 'none', color: '#555', border: '1px solid #333', cursor: 'pointer' },

  // Community link
  communityLink: { textAlign: 'center', padding: '32px 0', borderTop: '1px solid #1a1a1a' },
  communityAnchor: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', color: '#555', textDecoration: 'none', transition: 'color 0.2s' },
};

// ─── MAIN EXPORT ────────────────────────────────────────────
export default function Tracker() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '4px', color: '#e8e4dc', fontWeight: 400, marginBottom: '16px' }}>
          TRACKER COMING SOON
        </h2>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7 }}>
          The recovery tracker is being set up. In the meantime, join our Discord community for accountability and support.
        </p>
        <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '4px', color: '#c45a2a', textDecoration: 'none', display: 'inline-block', marginTop: '24px', padding: '14px 32px', border: '1px solid #c45a2a' }}>
          JOIN DISCORD →
        </a>
      </div>
    );
  }

  if (loading) return <div style={ds.loading}>Loading...</div>;
  if (!user) return <AuthForm />;
  return <TrackerDashboard />;
}
