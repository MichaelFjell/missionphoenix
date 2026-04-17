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
    <div style={authS.wrapper}><div style={authS.box}>
      <h2 style={authS.title}>{mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}</h2>
      <p style={authS.sub}>{mode === 'login' ? 'Track your journey.' : 'No email needed. Just pick a username.'}</p>
      {error && <div style={authS.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={authS.form}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={authS.input} autoComplete="username" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={authS.input} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
        <button type="submit" disabled={loading} style={{ ...authS.btn, opacity: loading ? 0.5 : 1 }}>{loading ? '...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}</button>
      </form>
      <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={authS.toggle}>
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </div></div>
  );
}
const authS = {
  wrapper: { display: 'flex', justifyContent: 'center', padding: '80px 24px' },
  box: { maxWidth: '380px', width: '100%' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '5px', color: '#e8e4dc', marginBottom: '8px', fontWeight: 400 },
  sub: { fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 },
  error: { fontSize: '13px', color: '#b82030', marginBottom: '16px', padding: '10px 14px', border: '1px solid #b8203044', background: 'rgba(184,32,48,0.06)' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '16px', padding: '14px 16px', background: 'rgba(15,15,15,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none' },
  btn: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '4px', padding: '14px', background: 'transparent', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer', marginTop: '8px' },
  toggle: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '14px', color: '#555', background: 'none', border: 'none', cursor: 'pointer', marginTop: '20px', textDecoration: 'underline', textUnderlineOffset: '3px' },
};

function ds(date) { return date.toISOString().slice(0, 10); }
function formatEntryDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

function TrackerDashboard() {
  const { user, profile, updateProfile } = useAuth();
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

  const today = ds(new Date());

  const loadData = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      // Get or create the primary habit (No pornography, sort_order 0)
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

      // All check dates for the primary habit
      const { data: checks, error: ckErr } = await supabase
        .from('daily_checks')
        .select('check_date')
        .eq('habit_id', h.id)
        .eq('user_id', user.id)
        .order('check_date', { ascending: false });
      if (ckErr) throw ckErr;
      setCheckedDates((checks || []).map(c => c.check_date));

      // Last 10 notes for the primary habit
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

  // Current consecutive streak ending at today or yesterday
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
    // Take them to the community to see what others wrote
    navigate('/community');
  };

  const handleSkipNote = () => setShowNotePrompt(false);

  // Backfill or unmark any past day from the mini calendar.
  // Today uses the same insert path as LOG TODAY so the quote/note flow triggers;
  // past days are a silent correction, no quote.
  const handleToggleDate = async (dateStr, isCurrentlyChecked) => {
    if (!primaryHabit) return;
    if (dateStr > today) return; // no future logging
    if (dateStr === today && !isCurrentlyChecked) {
      // Route through the normal flow so the user still gets the quote reward
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

  // Bulk-fill N consecutive days ending today. Used by people who already have
  // an existing streak when they sign up. Skips dates already logged.
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
        // Batch inserts to stay well under any row-limit
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
  const saveSettings = async () => { await updateProfile({ motivational_message: message }); };

  if (loading) return <div style={st.loading}>Loading...</div>;

  return (
    <div style={st.root}>
      {/* Physical tracker PDF + Settings toggle */}
      <div style={st.topWrap}>
        <a href="/mission_phoenix_habit_journal_2026.pdf" download style={st.physicalTracker}>
          <div style={st.ptBadge}>RECOMMENDED</div>
          <div style={st.ptTitle}>PHYSICAL HABIT TRACKER</div>
          <p style={st.ptDesc}>Download and print a physical habit tracker. Many find that pen-and-paper tracking works best for building real accountability.</p>
          <div style={st.ptAction}>DOWNLOAD PDF</div>
        </a>
        <div style={st.settingsRow}>
          <button onClick={() => setShowSettings(!showSettings)} style={st.settingsBtn}>
            {showSettings ? 'CLOSE SETTINGS' : 'SETTINGS'}
          </button>
        </div>
        {/* Prominent streak-import for fresh users */}
        {checkedDates.length === 0 && (
          <div style={st.streakCard}>
            <div style={st.streakLabel}>ALREADY ON A STREAK?</div>
            <p style={st.streakDesc}>If you already have clean days behind you, enter how many and we&rsquo;ll fill the calendar for you.</p>
            <div style={st.streakRow}>
              <input
                type="number"
                min="1"
                max="5000"
                value={streakInput}
                onChange={e => setStreakInput(e.target.value)}
                placeholder="e.g. 365"
                style={st.streakInput}
              />
              <button onClick={handleSetStreak} disabled={streakBusy || !streakInput} style={{ ...st.streakBtn, opacity: streakBusy || !streakInput ? 0.4 : 1 }}>
                {streakBusy ? 'SETTING...' : 'SET STREAK'}
              </button>
            </div>
          </div>
        )}
        {showSettings && (
          <div style={st.settingsPanel}>
            <h3 style={st.settingsTitle}>SET YOUR DAY COUNT</h3>
            <p style={st.settingsHelp}>Enter how many days clean you are. This fills in past days ending today. Existing logged days are kept.</p>
            <div style={st.streakRow}>
              <input
                type="number"
                min="1"
                max="5000"
                value={streakInput}
                onChange={e => setStreakInput(e.target.value)}
                placeholder="e.g. 365"
                style={st.streakInput}
              />
              <button onClick={handleSetStreak} disabled={streakBusy || !streakInput} style={{ ...st.streakBtn, opacity: streakBusy || !streakInput ? 0.4 : 1 }}>
                {streakBusy ? 'SETTING...' : 'SET STREAK'}
              </button>
            </div>
            <h3 style={{ ...st.settingsTitle, marginTop: '32px' }}>PROFILE PRIVACY</h3>
            {[['is_public','Public profile'],['show_streak','Show streak'],['show_total_days','Show total days'],['show_message','Show message']].map(([f,l]) => (
              <div key={f} style={st.settingsRowItem}>
                <span style={st.settingsLabel}>{l}</span>
                <button onClick={() => toggleProfileField(f)} style={{ ...st.toggleBtn, background: profile[f] ? '#c45a2a' : '#222' }}>{profile[f] ? 'ON' : 'OFF'}</button>
              </div>
            ))}
            <div style={{ marginTop: '20px' }}>
              <label style={st.settingsLabel}>Your reason (shown on your public profile if enabled)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Why are you doing this?" style={st.textarea} maxLength={200} />
              <button onClick={saveSettings} style={st.saveBtn}>SAVE</button>
            </div>
          </div>
        )}
        {error && <div style={st.error}>{error}</div>}
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
    </div>
  );
}

const st = {
  root: { minHeight: '100vh' },
  topWrap: { maxWidth: '720px', margin: '0 auto', padding: '40px 24px 0' },
  physicalTracker: { display: 'block', padding: '20px 24px', background: 'rgba(196,90,42,0.06)', border: '1px solid #c45a2a33', marginBottom: '20px', textDecoration: 'none', cursor: 'pointer', textAlign: 'center' },
  ptBadge: { fontFamily: "'Oswald', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#c45a2a', background: 'rgba(196,90,42,0.15)', display: 'inline-block', padding: '3px 10px', marginBottom: '8px' },
  ptTitle: { fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '4px', color: '#e8e4dc', marginBottom: '6px' },
  ptDesc: { fontSize: '13px', color: '#777', lineHeight: 1.6, margin: '0 0 10px 0', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' },
  ptAction: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#c45a2a' },
  settingsRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' },
  settingsBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '3px', padding: '8px 16px', background: 'none', color: '#555', border: '1px solid #333', cursor: 'pointer' },
  settingsPanel: { padding: '28px', background: 'rgba(15,15,15,0.8)', border: '1px solid #1a1a1a', marginBottom: '24px' },
  settingsTitle: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', color: '#666', fontWeight: 400, marginBottom: '20px' },
  settingsRowItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #141414' },
  settingsLabel: { fontSize: '14px', color: '#888', display: 'block', marginBottom: '6px' },
  toggleBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '4px 14px', color: '#e8e4dc', border: 'none', cursor: 'pointer', minWidth: '50px' },
  textarea: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '15px', padding: '12px', background: 'rgba(10,10,10,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', resize: 'vertical', minHeight: '60px', marginTop: '4px', boxSizing: 'border-box' },
  saveBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '10px 20px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer', marginTop: '12px' },
  error: { fontSize: '13px', color: '#b82030', marginTop: '12px', padding: '10px 14px', border: '1px solid #b8203044', background: 'rgba(184,32,48,0.06)' },
  streakCard: { padding: '24px', background: 'rgba(196,90,42,0.05)', border: '1px solid #c45a2a33', marginBottom: '20px' },
  streakLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '4px', color: '#c45a2a', marginBottom: '10px' },
  streakDesc: { fontSize: '14px', color: '#888', lineHeight: 1.6, margin: '0 0 16px 0', fontFamily: "'EB Garamond', Georgia, serif" },
  streakRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  streakInput: { flex: 1, minWidth: '140px', fontFamily: "'Oswald', sans-serif", fontSize: '16px', letterSpacing: '2px', padding: '12px 14px', background: 'rgba(10,10,10,0.8)', color: '#e8e4dc', border: '1px solid #2a2a2a', outline: 'none' },
  streakBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '12px 20px', background: 'transparent', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer' },
  settingsHelp: { fontSize: '13px', color: '#666', lineHeight: 1.6, margin: '0 0 14px 0', fontFamily: "'EB Garamond', Georgia, serif" },
  loading: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#555', textAlign: 'center', padding: '100px 24px' },
};

export default function Tracker() {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured()) return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '4px', color: '#e8e4dc', fontWeight: 400, marginBottom: '16px' }}>TRACKER COMING SOON</h2>
      <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7 }}>The recovery tracker is being set up.</p>
    </div>
  );
  if (loading) return <div style={st.loading}>Loading...</div>;
  if (!user) return <AuthForm />;
  return <TrackerDashboard />;
}
