import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr + 'T12:00:00');
  const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function groupByDate(entries) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;
  for (const entry of entries) {
    if (entry.note_date !== currentDate) {
      currentDate = entry.note_date;
      currentGroup = { date: currentDate, entries: [] };
      groups.push(currentGroup);
    }
    currentGroup.entries.push(entry);
  }
  return groups;
}

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    loadJournal();
  }, []);

  const loadJournal = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('daily_notes')
      .select(`
        id, note_text, note_date, is_public, created_at,
        habits:habit_id ( name ),
        profiles:user_id ( username )
      `)
      .eq('is_public', true)
      .order('note_date', { ascending: false })
      .limit(50);

    if (err) {
      console.error('Journal load error:', err);
      setError('Could not load journal entries. Try refreshing.');
    }
    if (data) setEntries(data);
    setLoading(false);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '4px', color: '#e8e4dc', fontWeight: 400, marginBottom: '16px' }}>JOURNAL COMING SOON</h2>
      </div>
    );
  }

  const groups = groupByDate(entries);

  return (
    <div style={s.root}>
      <div style={s.container}>
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>COMMUNITY JOURNAL</h1>
            <p style={s.subtitle}>
              Real words from real people in recovery. Wins, struggles, and everything in between.
            </p>
          </div>
          <button onClick={loadJournal} style={s.refreshBtn} title="Refresh" disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </div>

        {error && (
          <div style={s.error}>{error}</div>
        )}

        {loading ? (
          <div style={s.loading}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyText}>No public journal entries yet.</p>
            <p style={s.emptyHint}>When tracking your habits, you can add notes and choose to share them here.</p>
          </div>
        ) : (
          <div style={s.entries}>
            {groups.map(group => (
              <div key={group.date}>
                <div style={s.dateDivider}>
                  <span style={s.dateDividerText}>{formatDate(group.date)}</span>
                  <span style={s.dateDividerAgo}>{timeAgo(group.date)}</span>
                </div>
                {group.entries.map(entry => (
                  <div key={entry.id} style={s.entry}>
                    <div style={s.entryTop}>
                      <span style={s.entryUser}>{entry.profiles?.username || 'Anonymous'}</span>
                      {entry.habits?.name && <span style={s.entryHabit}>{entry.habits.name}</span>}
                    </div>
                    <p style={s.entryText}>{entry.note_text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={s.footer}>
          <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer" style={s.discordLink}>
            WANT DEEPER CONVERSATIONS? JOIN DISCORD →
          </a>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh' },
  container: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px 80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', gap: '16px' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '6px', color: '#e8e4dc', fontWeight: 400, margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#666', margin: 0, lineHeight: 1.7 },
  refreshBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', background: 'none', color: '#555', border: '1px solid #2a2a2a', cursor: 'pointer', padding: '6px 12px', flexShrink: 0, marginTop: '4px', lineHeight: 1 },
  error: { fontSize: '13px', color: '#b82030', marginBottom: '24px', padding: '12px 16px', border: '1px solid #b8203044', background: 'rgba(184,32,48,0.06)', lineHeight: 1.6 },
  loading: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#555', textAlign: 'center', padding: '60px' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: '16px', color: '#555', fontStyle: 'italic', marginBottom: '8px' },
  emptyHint: { fontSize: '14px', color: '#333', lineHeight: 1.6 },
  entries: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '48px' },
  dateDivider: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0 12px', borderBottom: '1px solid #1a1a1a', marginBottom: '12px' },
  dateDividerText: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '3px', color: '#888', whiteSpace: 'nowrap' },
  dateDividerAgo: { fontSize: '12px', color: '#444', whiteSpace: 'nowrap' },
  entry: { padding: '16px 20px', background: 'rgba(15,15,15,0.6)', borderLeft: '2px solid #1a1a1a', marginBottom: '8px', marginLeft: '4px' },
  entryTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
  entryUser: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '3px', color: '#c45a2a' },
  entryHabit: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '2px 8px', border: '1px solid #222', color: '#555', lineHeight: '16px' },
  entryText: { fontSize: '15px', lineHeight: 1.8, color: '#999', margin: 0, fontStyle: 'italic' },
  footer: { textAlign: 'center', padding: '32px 0', borderTop: '1px solid #1a1a1a' },
  discordLink: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '4px', color: '#555', textDecoration: 'none' },
};
