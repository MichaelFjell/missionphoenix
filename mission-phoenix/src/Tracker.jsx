import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './main.jsx';
import { supabase, isSupabaseConfigured } from './supabase.js';
import { Link } from 'react-router-dom';

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
      <p style={authS.sub}>{mode === 'login' ? 'Track your recovery streak.' : 'No email needed. Just pick a username.'}</p>
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

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function getMonthDays(year, month) {
  const days = [];
  let startDay = new Date(year, month, 1).getDay() - 1;
  if (startDay < 0) startDay = 6;
  for (let i = 0; i < startDay; i++) days.push(null);
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}
function ds2(y, m, d) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

function NoteModal({ habit, date, note, isPublicInit, onSave, onClose }) {
  const [text, setText] = useState(note || '');
  const [sharePublic, setSharePublic] = useState(isPublicInit || false);
  return (
    <div style={noteS.overlay} onClick={onClose}>
      <div style={noteS.modal} onClick={e => e.stopPropagation()}>
        <div style={noteS.header}>
          <span style={noteS.habitLabel}>{habit.name}</span>
          <span style={noteS.dateLabel}>{date}</span>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="How did it go? Any urges? How did you feel?" style={noteS.textarea} maxLength={500} autoFocus />
        <div style={noteS.charCount}>{text.length}/500</div>
        <div style={noteS.shareRow}>
          <button onClick={() => setSharePublic(!sharePublic)} style={{ ...noteS.shareToggle, background: sharePublic ? '#c45a2a' : '#222' }}>{sharePublic ? 'PUBLIC' : 'PRIVATE'}</button>
          <span style={noteS.shareLabel}>{sharePublic ? 'Will appear in community journal' : 'Only visible to you'}</span>
        </div>
        <div style={noteS.actions}>
          <button onClick={() => onSave(text, sharePublic)} style={noteS.saveBtn}>SAVE NOTE</button>
          <button onClick={onClose} style={noteS.cancelBtn}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
const noteS = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  modal: { maxWidth: '460px', width: '100%', background: '#111', border: '1px solid #2a2a2a', padding: '28px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  habitLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#e8e4dc' },
  dateLabel: { fontSize: '13px', color: '#555' },
  textarea: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '15px', padding: '14px', background: 'rgba(10,10,10,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', resize: 'vertical', minHeight: '120px' },
  charCount: { fontSize: '11px', color: '#333', textAlign: 'right', marginTop: '4px', marginBottom: '12px' },
  shareRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  shareToggle: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '5px 14px', color: '#e8e4dc', border: 'none', cursor: 'pointer', minWidth: '70px' },
  shareLabel: { fontSize: '12px', color: '#555' },
  actions: { display: 'flex', gap: '8px' },
  saveBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '10px 24px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer', flex: 1 },
  cancelBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '10px 24px', background: 'none', color: '#555', border: '1px solid #333', cursor: 'pointer' },
};

function TrackerDashboard() {
  const { user, profile, updateProfile } = useAuth();
  const [habits, setHabits] = useState([]);
  const [checks, setChecks] = useState({});
  const [notes, setNotes] = useState({});
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState(profile?.motivational_message || '');
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const today = ds2(now.getFullYear(), now.getMonth(), now.getDate());
  const monthDays = getMonthDays(viewYear, viewMonth);
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (isCurrentMonth) return; if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  const loadData = useCallback(async () => {
    if (!user) return;
    const { data: h } = await supabase.from('habits').select('*').eq('user_id', user.id).order('sort_order');
    if (h) setHabits(h);
    const { data: c } = await supabase.from('daily_checks').select('*').eq('user_id', user.id);
    if (c) { const m = {}; c.forEach(x => { m[`${x.habit_id}_${x.check_date}`] = x; }); setChecks(m); }
    const { data: n } = await supabase.from('daily_notes').select('*').eq('user_id', user.id);
    if (n) { const m = {}; n.forEach(x => { m[`${x.habit_id}_${x.note_date}`] = x; }); setNotes(m); }
    setLoading(false);
  }, [user]);
  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!loading && habits.length === 0 && user) {
      (async () => { const { data } = await supabase.from('habits').insert({ user_id: user.id, name: 'No pornography', sort_order: 0 }).select().single(); if (data) setHabits([data]); })();
    }
  }, [loading, habits.length, user]);

  const toggleCheck = async (habitId, date) => {
    const key = `${habitId}_${date}`;
    if (checks[key]) {
      await supabase.from('daily_checks').delete().eq('id', checks[key].id);
      const next = { ...checks }; delete next[key]; setChecks(next);
    } else {
      const { data } = await supabase.from('daily_checks').insert({ habit_id: habitId, user_id: user.id, check_date: date }).select().single();
      if (data) setChecks({ ...checks, [key]: data });
    }
  };
  const superDay = async () => {
    const nc = { ...checks };
    for (const h of habits) {
      const key = `${h.id}_${today}`;
      if (!nc[key]) { const { data } = await supabase.from('daily_checks').insert({ habit_id: h.id, user_id: user.id, check_date: today }).select().single(); if (data) nc[key] = data; }
    }
    setChecks(nc);
  };
  const allCheckedToday = habits.length > 0 && habits.every(h => checks[`${h.id}_${today}`]);

  const saveNote = async (habitId, date, text, isPublic) => {
    const key = `${habitId}_${date}`;
    const existing = notes[key];
    if (existing) {
      const { data } = await supabase.from('daily_notes').update({ note_text: text, is_public: isPublic }).eq('id', existing.id).select().single();
      if (data) setNotes({ ...notes, [key]: data });
    } else if (text.trim()) {
      const { data } = await supabase.from('daily_notes').insert({ habit_id: habitId, user_id: user.id, note_date: date, note_text: text, is_public: isPublic }).select().single();
      if (data) setNotes({ ...notes, [key]: data });
    }
    setNoteModal(null);
  };
  const addHabit = async () => {
    if (!newHabit.trim()) return;
    const { data } = await supabase.from('habits').insert({ user_id: user.id, name: newHabit.trim(), sort_order: habits.length }).select().single();
    if (data) setHabits([...habits, data]); setNewHabit(''); setShowAdd(false);
  };
  const removeHabit = async (id) => {
    await supabase.from('daily_checks').delete().eq('habit_id', id);
    await supabase.from('daily_notes').delete().eq('habit_id', id);
    await supabase.from('habits').delete().eq('id', id);
    setHabits(habits.filter(h => h.id !== id));
  };
  const getStreak = (habitId) => { let s = 0; const d = new Date(); while (true) { const x = ds2(d.getFullYear(), d.getMonth(), d.getDate()); if (checks[`${habitId}_${x}`]) { s++; d.setDate(d.getDate() - 1); } else break; } return s; };
  const getTotalDays = (habitId) => Object.keys(checks).filter(k => k.startsWith(habitId)).length;
  const toggleProfileField = async (field) => { await updateProfile({ [field]: !profile[field] }); };
  const saveSettings = async () => { await updateProfile({ motivational_message: message }); };

  if (loading) return <div style={st.loading}>Loading...</div>;
  return (
    <div style={st.root}><div style={st.container}>
      <div style={st.header}>
        <div><h1 style={st.title}>RECOVERY TRACKER</h1><p style={st.subtitle}>Check off each day. Build your streak. Write your story.</p></div>
        <button onClick={() => setShowSettings(!showSettings)} style={st.settingsBtn}>{showSettings ? 'CLOSE' : 'SETTINGS'}</button>
      </div>
      <button onClick={superDay} disabled={allCheckedToday} style={{ ...st.superDayBtn, opacity: allCheckedToday ? 0.3 : 1, borderColor: allCheckedToday ? '#222' : '#c45a2a', color: allCheckedToday ? '#444' : '#c45a2a' }}>
        {allCheckedToday ? '\u2713  ALL HABITS CHECKED TODAY' : '\u26A1  SUPER DAY \u2014 CHECK ALL HABITS'}
      </button>
      {showSettings && (
        <div style={st.settingsPanel}>
          <h3 style={st.settingsTitle}>PROFILE SETTINGS</h3>
          {[['is_public','Public Profile'],['show_streak','Show Streak'],['show_total_days','Show Total Days'],['show_habits','Show Habits'],['show_message','Show Message']].map(([f,l]) => (
            <div key={f} style={st.settingsRow}><span style={st.settingsLabel}>{l}</span>
              <button onClick={() => toggleProfileField(f)} style={{ ...st.toggleBtn, background: profile[f] ? '#c45a2a' : '#222' }}>{profile[f] ? 'ON' : 'OFF'}</button>
            </div>
          ))}
          <div style={{ marginTop: '20px' }}><label style={st.settingsLabel}>Motivational Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Why are you doing this?" style={st.textarea} maxLength={200} />
            <button onClick={saveSettings} style={st.saveBtn}>SAVE MESSAGE</button>
          </div>
        </div>
      )}
      <div style={st.monthNav}>
        <button onClick={prevMonth} style={st.monthBtn}>{'\u2190'}</button>
        <span style={st.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ ...st.monthBtn, opacity: isCurrentMonth ? 0.2 : 1 }}>{'\u2192'}</button>
      </div>
      {habits.map(habit => {
        const streak = getStreak(habit.id); const total = getTotalDays(habit.id);
        return (
          <div key={habit.id} style={st.habitBlock}>
            <div style={st.habitHeader}>
              <div style={st.habitInfo}><span style={st.habitName}>{habit.name}</span>
                <div style={st.habitStats}><span style={st.streak}><span style={st.streakNum}>{streak}</span> day streak</span><span style={st.totalDays}>{total} total</span></div>
              </div>
              {habits.length > 1 && <button onClick={() => removeHabit(habit.id)} style={st.removeBtn} title="Remove">{'\u00D7'}</button>}
            </div>
            <div style={st.weekdayRow}>{WEEKDAYS.map(d => <div key={d} style={st.weekdayLabel}>{d}</div>)}</div>
            <div style={st.calendar}>
              {monthDays.map((day, i) => {
                if (day === null) return <div key={`e${i}`} style={st.emptyCell} />;
                const date = ds2(viewYear, viewMonth, day);
                const checked = !!checks[`${habit.id}_${date}`];
                const isToday = date === today;
                const hasNote = !!notes[`${habit.id}_${date}`];
                const isFuture = new Date(`${date}T12:00:00`) > now;
                return (
                  <div key={day} style={{ position: 'relative' }}>
                    <button onClick={() => !isFuture && toggleCheck(habit.id, date)} style={{
                      ...st.dayCell,
                      background: checked ? '#c45a2a' : 'rgba(20,20,20,0.6)',
                      borderColor: isToday ? '#c45a2a' : checked ? '#c45a2a33' : '#1a1a1a',
                      boxShadow: isToday ? '0 0 0 2px #c45a2a44' : 'none',
                      color: checked ? '#0a0a0a' : isFuture ? '#2a2a2a' : '#555',
                      cursor: isFuture ? 'default' : 'pointer',
                    }}>
                      <span style={st.dayNum}>{day}</span>
                      {checked && <span style={st.checkMark}>{'\u2713'}</span>}
                    </button>
                    {checked && <button onClick={() => setNoteModal({ habit, date })} style={{ ...st.noteBtn, color: hasNote ? '#c45a2a' : '#333' }} title={hasNote ? 'Edit note' : 'Add note'}>{hasNote ? '\u270E' : '+'}</button>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {showAdd ? (
        <div style={st.addForm}>
          <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="e.g. Meditated, Exercised, Read book..." style={st.addInput} maxLength={50} onKeyDown={e => e.key === 'Enter' && addHabit()} autoFocus />
          <div style={st.addBtns}><button onClick={addHabit} style={st.addConfirm}>ADD</button><button onClick={() => { setShowAdd(false); setNewHabit(''); }} style={st.addCancel}>CANCEL</button></div>
        </div>
      ) : <button onClick={() => setShowAdd(true)} style={st.addHabitBtn}>+ ADD HABIT TO TRACK</button>}
      <div style={st.bottomLinks}><Link to="/community" style={st.bottomLink}>VIEW COMMUNITY {'\u2192'}</Link><Link to="/journal" style={st.bottomLink}>COMMUNITY JOURNAL {'\u2192'}</Link></div>
    </div>
    {noteModal && <NoteModal habit={noteModal.habit} date={noteModal.date} note={notes[`${noteModal.habit.id}_${noteModal.date}`]?.note_text || ''} isPublicInit={notes[`${noteModal.habit.id}_${noteModal.date}`]?.is_public || false} onSave={(t, p) => saveNote(noteModal.habit.id, noteModal.date, t, p)} onClose={() => setNoteModal(null)} />}
    </div>
  );
}
const st = {
  root: { minHeight: '100vh' }, container: { maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' },
  loading: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#555', textAlign: 'center', padding: '100px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '6px', color: '#e8e4dc', fontWeight: 400, margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#666', margin: 0, lineHeight: 1.6 },
  settingsBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '3px', padding: '8px 16px', background: 'none', color: '#555', border: '1px solid #333', cursor: 'pointer' },
  superDayBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', padding: '16px 24px', background: 'none', border: '1px solid #c45a2a', color: '#c45a2a', cursor: 'pointer', width: '100%', marginBottom: '32px', transition: 'all 0.2s' },
  settingsPanel: { padding: '28px', background: 'rgba(15,15,15,0.8)', border: '1px solid #1a1a1a', marginBottom: '32px' },
  settingsTitle: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', color: '#666', fontWeight: 400, marginBottom: '20px' },
  settingsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #141414' },
  settingsLabel: { fontSize: '14px', color: '#888', display: 'block', marginBottom: '6px' },
  toggleBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '4px 14px', color: '#e8e4dc', border: 'none', cursor: 'pointer', minWidth: '50px' },
  textarea: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '15px', padding: '12px', background: 'rgba(10,10,10,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', resize: 'vertical', minHeight: '60px', marginTop: '4px' },
  saveBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '10px 20px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer', marginTop: '12px' },
  monthNav: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '28px' },
  monthBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px 12px' },
  monthLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '16px', letterSpacing: '4px', color: '#e8e4dc', minWidth: '180px', textAlign: 'center' },
  habitBlock: { marginBottom: '36px', padding: '24px', background: 'rgba(15,15,15,0.4)', border: '1px solid #1a1a1a' },
  habitHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  habitInfo: { flex: 1 }, habitName: { fontFamily: "'Oswald', sans-serif", fontSize: '15px', letterSpacing: '3px', color: '#e8e4dc' },
  habitStats: { display: 'flex', gap: '20px', marginTop: '6px' },
  streak: { fontSize: '13px', color: '#888' }, streakNum: { fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: '#c45a2a', marginRight: '4px' },
  totalDays: { fontSize: '13px', color: '#555' },
  removeBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: '#444', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  weekdayRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' },
  weekdayLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '9px', letterSpacing: '1px', color: '#444', textAlign: 'center', padding: '4px 0' },
  calendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  emptyCell: { aspectRatio: '1' },
  dayCell: { width: '100%', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #1a1a1a', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', padding: '2px' },
  dayNum: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', lineHeight: 1 },
  checkMark: { fontSize: '11px', lineHeight: 1, fontWeight: 'bold' },
  noteBtn: { position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', fontSize: '10px', lineHeight: '16px', textAlign: 'center', background: '#111', border: '1px solid #222', cursor: 'pointer', padding: 0, borderRadius: '2px', zIndex: 2 },
  addHabitBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '3px', padding: '16px 24px', background: 'none', color: '#555', border: '1px dashed #2a2a2a', cursor: 'pointer', width: '100%', marginBottom: '40px' },
  addForm: { padding: '20px', border: '1px solid #2a2a2a', marginBottom: '40px' },
  addInput: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '16px', padding: '12px', background: 'rgba(10,10,10,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', marginBottom: '12px' },
  addBtns: { display: 'flex', gap: '8px' },
  addConfirm: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '8px 20px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer' },
  addCancel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '8px 20px', background: 'none', color: '#555', border: '1px solid #333', cursor: 'pointer' },
  bottomLinks: { display: 'flex', gap: '24px', justifyContent: 'center', padding: '32px 0', borderTop: '1px solid #1a1a1a', flexWrap: 'wrap' },
  bottomLink: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', color: '#555', textDecoration: 'none' },
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
