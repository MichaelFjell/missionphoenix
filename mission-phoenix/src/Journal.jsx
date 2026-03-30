import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    loadJournal();
  }, []);

  const loadJournal = async () => {
    const { data } = await supabase
      .from('daily_notes')
      .select(`
        id, note_text, note_date, is_public, created_at,
        habits:habit_id ( name ),
        profiles:user_id ( username )
      `)
      .eq('is_public', true)
      .order('note_date', { ascending: false })
      .limit(50);

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

  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>COMMUNITY JOURNAL</h1>
        <p style={s.subtitle}>
          Real words from real people in recovery. Wins, struggles, and everything in between.
        </p>

        {loading ? (
          <div style={s.loading}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyText}>No public journal entries yet.</p>
            <p style={s.emptyHint}>When tracking your habits, you can add notes and choose to share them here.</p>
          </div>
        ) : (
          <div style={s.entries}>
            {entries.map(entry => (
              <div key={entry.id} style={s.entry}>
                <div style={s.entryHeader}>
                  <span style={s.entryUser}>{entry.profiles?.username || 'Anonymous'}</span>
                  <span style={s.entryMeta}>
                    {entry.habits?.name && <span style={s.entryHabit}>{entry.habits.name}</span>}
                    <span style={s.entryDate}>{entry.note_date}</span>
                  </span>
                </div>
                <p style={s.entryText}>{entry.note_text}</p>
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
  title: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '6px', color: '#e8e4dc', fontWeight: 400, margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#666', margin: '0 0 48px 0', lineHeight: 1.7 },
  loading: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#555', textAlign: 'center', padding: '60px' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: '16px', color: '#555', fontStyle: 'italic', marginBottom: '8px' },
  emptyHint: { fontSize: '14px', color: '#333', lineHeight: 1.6 },
  entries: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' },
  entry: { padding: '24px', background: 'rgba(15,15,15,0.6)', border: '1px solid #1a1a1a' },
  entryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  entryUser: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#c45a2a' },
  entryMeta: { display: 'flex', gap: '12px', alignItems: 'center' },
  entryHabit: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '3px 8px', border: '1px solid #222', color: '#666' },
  entryDate: { fontSize: '12px', color: '#444' },
  entryText: { fontSize: '15px', lineHeight: 1.8, color: '#999', margin: 0, fontStyle: 'italic' },
  footer: { textAlign: 'center', padding: '32px 0', borderTop: '1px solid #1a1a1a' },
  discordLink: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '4px', color: '#555', textDecoration: 'none' },
};
