import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { supabase, isSupabaseConfigured } from './supabase.js';
import Journey from './Journey.jsx';
import { pickDeterministicQuote } from './quotes.js';

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
    try { if (mode === 'signup') await signUp(username.trim(), password); else await signIn(username.trim(), password); }
    catch (err) {
      if (err.message.includes('Invalid login')) setError('Wrong username or password');
      else if (err.message.includes('already registered')) setError('Username already taken');
      else setError(err.message);
    }
    setLoading(false);
  };
  return (
    <>
      <style>{`
        .tk-auth{max-width:400px;margin:60px auto;padding:40px 8px;}
        .tk-auth h2{font-size:18px;font-weight:800;letter-spacing:5px;text-transform:uppercase;margin-bottom:8px;}
        .tk-auth .s{font-size:14px;color:var(--ink-3);margin-bottom:28px;line-height:1.6;}
        .tk-auth input{margin-bottom:12px;}
        .tk-auth .submit{width:100%;font-weight:700;letter-spacing:3px;padding:14px;background:transparent;color:var(--copper);border:1px solid var(--copper);cursor:pointer;margin-top:8px;font-size:13px;text-transform:uppercase;font-family:inherit;border-radius:8px;}
        .tk-auth .submit:hover{background:var(--copper);color:var(--card);}
        .tk-auth .toggle{font-size:14px;color:var(--ink-3);background:none;border:none;cursor:pointer;margin-top:20px;text-decoration:underline;text-underline-offset:3px;font-family:inherit;padding:0;}
        .tk-auth .err{font-size:13px;color:#b82030;margin-bottom:16px;padding:10px 14px;border:1px solid rgba(184,32,48,0.3);background:rgba(184,32,48,0.06);border-radius:8px;}
      `}</style>
      <main className="page narrow">
        <div className="tk-auth">
          <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
          <p className="s">{mode === 'login' ? 'Track your journey.' : 'No email needed. Just pick a username.'}</p>
          {error && <div className="err">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input className="input" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
            <button type="submit" disabled={loading} className="submit" style={{ opacity: loading ? 0.5 : 1 }}>
              {loading ? '...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="toggle">
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </main>
    </>
  );
}

function ds(date) { return date.toISOString().slice(0, 10); }
function formatEntryDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

function TrackerDashboard() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [primaryHabit, setPrimaryHabit] = useState(null);
  const [checkedDates, setCheckedDates] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  const [todayQuote, setTodayQuote] = useState(null);
  const [showNotePrompt, setShowNotePrompt] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState(profile?.motivational_message || '');
  const [error, setError] = useState('');
  const [streakInput, setStreakInput] = useState('');
  const [streakBusy, setStreakBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const today = ds(new Date());

  const loadData = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      let { data: habits, error: hErr } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
        .limit(1);
      if (hErr) throw hErr;
      if (!habits || habits.length === 0) {
        const { data: created, error: cErr } = await supabase
          .from('habits')
          .insert({ user_id: user.id, name: 'No pornography', sort_order: 0 })
          .select()
          .single();
        if (cErr) throw cErr;
        habits = [created];
      }
      const h = habits[0];
      setPrimaryHabit(h);

      const { data: checks, error: ckErr } = await supabase
        .from('daily_checks')
        .select('check_date')
        .eq('habit_id', h.id)
        .eq('user_id', user.id)
        .order('check_date', { ascending: false });
      if (ckErr) throw ckErr;
      setCheckedDates((checks || []).map(c => c.check_date));

      const { data: notes, error: nErr } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('habit_id', h.id)
        .eq('user_id', user.id)
        .order('note_date', { ascending: false })
        .limit(10);
      if (nErr) throw nErr;
      setRecentNotes((notes || []).map(n => ({
        date: formatEntryDate(n.note_date),
        text: n.note_text,
        isPublic: n.is_public,
        id: n.id,
      })));
    } catch (e) {
      console.error('Tracker load error', e);
      setError(e.message || 'Could not load your tracker data.');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const daysClean = useMemo(() => {
    const dateSet = new Set(checkedDates);
    let count = 0;
    const d = new Date();
    if (!dateSet.has(today)) d.setDate(d.getDate() - 1);
    while (true) {
      const s = ds(d);
      if (dateSet.has(s)) { count++; d.setDate(d.getDate() - 1); } else break;
    }
    return count;
  }, [checkedDates, today]);

  const isTodayChecked = checkedDates.includes(today);

  const handleCheckToday = async () => {
    if (!primaryHabit || isTodayChecked) return;
    const { error: err } = await supabase
      .from('daily_checks')
      .insert({ habit_id: primaryHabit.id, user_id: user.id, check_date: today });
    if (err) {
      console.error(err);
      setError('Could not save check-in. Try again.');
      return;
    }
    setCheckedDates([today, ...checkedDates]);
    setTodayQuote(pickDeterministicQuote(today + '_' + user.id));
    setShowQuote(true);
  };

  const dismissQuote = () => {
    setShowQuote(false);
    setShowNotePrompt(true);
  };

  const handleSaveNote = async (text, isPublic) => {
    if (!primaryHabit || !text.trim()) { setShowNotePrompt(false); return; }
    try {
      const { data, error: err } = await supabase
        .from('daily_notes')
        .insert({ habit_id: primaryHabit.id, user_id: user.id, note_date: today, note_text: text, is_public: isPublic })
        .select()
        .single();
      if (err) throw err;
      setRecentNotes([{ date: formatEntryDate(today), text, isPublic, id: data.id }, ...recentNotes]);
    } catch (e) {
      console.error('Note save error', e);
      setError('Could not save note. Try again.');
      setShowNotePrompt(false);
      return;
    }
    setShowNotePrompt(false);
    navigate('/community');
  };

  const handleSkipNote = () => setShowNotePrompt(false);

  const handleToggleDate = async (dateStr, isCurrentlyChecked) => {
    if (!primaryHabit) return;
    if (dateStr > today) return;
    if (dateStr === today && !isCurrentlyChecked) {
      handleCheckToday();
      return;
    }
    if (isCurrentlyChecked) {
      const { error: err } = await supabase
        .from('daily_checks')
        .delete()
        .eq('habit_id', primaryHabit.id)
        .eq('user_id', user.id)
        .eq('check_date', dateStr);
      if (err) { console.error(err); setError('Could not unmark that day.'); return; }
      setCheckedDates(checkedDates.filter(d => d !== dateStr));
    } else {
      const { error: err } = await supabase
        .from('daily_checks')
        .insert({ habit_id: primaryHabit.id, user_id: user.id, check_date: dateStr });
      if (err) { console.error(err); setError('Could not log that day.'); return; }
      setCheckedDates([dateStr, ...checkedDates]);
    }
  };

  const handleSetStreak = async () => {
    const n = parseInt(streakInput, 10);
    if (!primaryHabit || !n || n < 1) { setError('Enter a number of days (1 or more).'); return; }
    if (n > 5000) { setError('That\u2019s a lot. Max 5000.'); return; }
    setStreakBusy(true);
    setError('');
    try {
      const existing = new Set(checkedDates);
      const rows = [];
      const d = new Date();
      for (let i = 0; i < n; i++) {
        const s = ds(d);
        if (!existing.has(s)) {
          rows.push({ habit_id: primaryHabit.id, user_id: user.id, check_date: s });
        }
        d.setDate(d.getDate() - 1);
      }
      if (rows.length > 0) {
        const chunk = 500;
        for (let i = 0; i < rows.length; i += chunk) {
          const { error: err } = await supabase.from('daily_checks').insert(rows.slice(i, i + chunk));
          if (err) throw err;
        }
      }
      setStreakInput('');
      await loadData();
    } catch (e) {
      console.error(e);
      setError('Could not set streak: ' + (e.message || 'unknown error'));
    }
    setStreakBusy(false);
  };

  const toggleProfileField = async (field) => { await updateProfile({ [field]: !profile[field] }); };
  const saveSettings = async () => {
    await updateProfile({ motivational_message: message });
    setSaveStatus('✓ Saved');
    setTimeout(() => setSaveStatus(''), 1400);
  };

  if (loading) return <main className="page narrow"><p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: '3px' }}>Loading...</p></main>;

  return (
    <>
      <style>{`
        .tk-top{padding-top:16px;}
        .tk-userbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:12px 18px;background:var(--card);border:1px solid var(--line);border-radius:12px;flex-wrap:wrap;gap:10px;}
        .tk-userbar .u{font-size:13px;}
        .tk-userbar .u span{color:var(--ink-3);}
        .tk-userbar .u b{color:var(--copper);letter-spacing:1px;}
        .tk-userbar .out{font-size:11px;font-weight:700;letter-spacing:2px;padding:6px 14px;background:none;border:1px solid var(--line-2);border-radius:999px;color:var(--ink-3);cursor:pointer;text-transform:uppercase;font-family:inherit;}
        .tk-userbar .out:hover{border-color:var(--copper);color:var(--copper);}

        .tk-pt{display:block;padding:22px 26px;background:var(--copper-soft);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 14px 14px 0;margin-bottom:16px;text-align:center;transition:background .2s;text-decoration:none;color:inherit;}
        .tk-pt:hover{background:rgba(163,70,32,0.12);}
        .tk-pt-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--copper);background:rgba(163,70,32,0.18);padding:3px 10px;border-radius:999px;margin-bottom:10px;}
        .tk-pt-title{font-size:14px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;}
        .tk-pt-desc{font-size:13.5px;color:var(--ink-2);line-height:1.65;margin:0 auto 10px;max-width:500px;}
        .tk-pt-act{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}

        .tk-srow{display:flex;justify-content:flex-end;margin-bottom:14px;}
        .tk-sbtn{font-size:10px;font-weight:700;letter-spacing:3px;padding:8px 16px;background:none;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;cursor:pointer;text-transform:uppercase;font-family:inherit;}
        .tk-sbtn:hover{border-color:var(--copper);color:var(--copper);}

        .tk-scard{padding:24px;background:var(--copper-soft);border:1px solid var(--line);border-radius:14px;margin-bottom:20px;}
        .tk-slab{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--copper);margin-bottom:10px;}
        .tk-sdesc{font-size:14px;color:var(--ink-2);line-height:1.65;margin-bottom:16px;}
        .tk-srow2{display:flex;gap:10px;flex-wrap:wrap;}
        .tk-srow2 input{flex:1;min-width:140px;margin:0;}
        .tk-sbtn2{font-size:11px;font-weight:700;letter-spacing:3px;padding:12px 20px;background:transparent;color:var(--copper);border:1px solid var(--copper);cursor:pointer;text-transform:uppercase;font-family:inherit;border-radius:8px;}
        .tk-sbtn2:disabled{opacity:0.4;}

        .tk-panel{padding:26px;background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:24px;}
        .tk-ptitle{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--ink-3);margin-bottom:16px;}
        .tk-phelp{font-size:13px;color:var(--ink-3);line-height:1.65;margin-bottom:14px;}
        .tk-pitem{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--line);}
        .tk-pitem:last-child{border-bottom:none;}
        .tk-plabel{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:3px;}
        .tk-psub{font-size:12.5px;color:var(--ink-3);line-height:1.5;}
        .tk-tgl{font-size:10px;font-weight:700;letter-spacing:2px;padding:6px 14px;cursor:pointer;min-width:82px;border-radius:999px;text-transform:uppercase;font-family:inherit;transition:all .15s;}
        .tk-tgl.on{background:var(--copper);color:var(--card);border:1px solid var(--copper);}
        .tk-tgl.off{background:transparent;color:var(--ink-3);border:1px solid var(--line-2);}
        .tk-ta{width:100%;margin-top:6px;min-height:64px;resize:vertical;}
        .tk-save{font-size:11px;font-weight:700;letter-spacing:3px;padding:10px 20px;background:transparent;color:var(--copper);border:1px solid var(--copper);border-radius:8px;cursor:pointer;margin-top:12px;text-transform:uppercase;font-family:inherit;}

        .tk-err{font-size:13px;color:#b82030;margin-top:12px;padding:10px 14px;border:1px solid rgba(184,32,48,0.3);background:rgba(184,32,48,0.06);border-radius:8px;}
      `}</style>
      <main className="page narrow" style={{ maxWidth: '760px' }}>
        <div className="tk-top">
          <div className="tk-userbar">
            <div className="u"><span>Logged in as </span><b>{profile?.username || user.username}</b></div>
            <button className="out" onClick={signOut}>Log out</button>
          </div>

          <a href="/mission_phoenix_habit_journal_2026.pdf" download className="tk-pt">
            <div className="tk-pt-badge">Recommended</div>
            <div className="tk-pt-title">Physical habit tracker</div>
            <p className="tk-pt-desc">Download and print a physical habit tracker. Many find that pen-and-paper tracking works best for building real accountability.</p>
            <div className="tk-pt-act">Download PDF ↓</div>
          </a>

          <div className="tk-srow">
            <button onClick={() => setShowSettings(!showSettings)} className="tk-sbtn">
              {showSettings ? 'Close settings' : 'Settings'}
            </button>
          </div>

          {checkedDates.length === 0 && (
            <div className="tk-scard">
              <div className="tk-slab">Already on a streak?</div>
              <p className="tk-sdesc">If you already have clean days behind you, enter how many and we&rsquo;ll fill the calendar for you.</p>
              <div className="tk-srow2">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="5000"
                  value={streakInput}
                  onChange={e => setStreakInput(e.target.value)}
                  placeholder="e.g. 365"
                />
                <button onClick={handleSetStreak} disabled={streakBusy || !streakInput} className="tk-sbtn2">
                  {streakBusy ? 'Setting...' : 'Set streak'}
                </button>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="tk-panel">
              <div className="tk-ptitle">Set your day count</div>
              <p className="tk-phelp">Enter how many days clean you are. This fills in past days ending today. Existing logged days are kept.</p>
              <div className="tk-srow2">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="5000"
                  value={streakInput}
                  onChange={e => setStreakInput(e.target.value)}
                  placeholder="e.g. 365"
                />
                <button onClick={handleSetStreak} disabled={streakBusy || !streakInput} className="tk-sbtn2">
                  {streakBusy ? 'Setting...' : 'Set streak'}
                </button>
              </div>

              <div className="tk-ptitle" style={{ marginTop: '28px' }}>Profile privacy</div>
              <p className="tk-phelp">Control what other members see on your public profile.</p>
              {[
                ['is_public', 'Profile visible to others', 'When private, nothing below is shown at all.'],
                ['show_streak', 'Current streak (days clean)', 'Shows your current consecutive-day count.'],
                ['show_total_days', 'Total days logged', 'Lifetime count across all check-ins.'],
                ['show_message', 'Your reason / message', 'The short note below.'],
              ].map(([f, l, sub]) => (
                <div key={f} className="tk-pitem">
                  <div style={{ flex: 1 }}>
                    <div className="tk-plabel">{l}</div>
                    <div className="tk-psub">{sub}</div>
                  </div>
                  <button onClick={() => toggleProfileField(f)} className={`tk-tgl ${profile?.[f] ? 'on' : 'off'}`}>
                    {profile?.[f] ? 'Public' : 'Private'}
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '20px' }}>
                <label className="tk-plabel" style={{ display: 'block', marginBottom: '2px' }}>Your reason (shown on your public profile if enabled)</label>
                <textarea className="tk-ta input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Why are you doing this?" maxLength={200} />
                <button onClick={saveSettings} className="tk-save">{saveStatus || 'Save'}</button>
              </div>
            </div>
          )}

          {error && <div className="tk-err">{error}</div>}
        </div>

        <Journey
          daysClean={daysClean}
          checkedDates={checkedDates}
          onCheckToday={handleCheckToday}
          isTodayChecked={isTodayChecked}
          showQuote={showQuote}
          dismissQuote={dismissQuote}
          todayQuote={todayQuote}
          showNotePrompt={showNotePrompt}
          onSaveNote={handleSaveNote}
          onSkipNote={handleSkipNote}
          recentNotes={recentNotes}
          onToggleDate={handleToggleDate}
        />
      </main>
    </>
  );
}

export default function Tracker() {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured()) return (
    <main className="page narrow">
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '18px', letterSpacing: '4px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>Tracker coming soon</h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.7 }}>The recovery tracker is being set up.</p>
      </div>
    </main>
  );
  if (loading) return <main className="page narrow"><p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: '3px' }}>Loading...</p></main>;
  if (!user) return <AuthForm />;
  return <TrackerDashboard />;
}
