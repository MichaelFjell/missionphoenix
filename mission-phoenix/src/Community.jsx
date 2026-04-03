import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

function formatNoteDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function Community() {
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState('members');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    loadCommunity();
    loadPublicNotes();
  }, []);

  const loadPublicNotes = async () => {
    const { data, error } = await supabase
      .from('daily_notes')
      .select(`
        id, note_text, note_date, created_at,
        habits:habit_id ( name ),
        profiles:user_id ( username )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setNotes(data);
    if (error) console.error('Public notes load error:', error);
  };

  const loadCommunity = async () => {
    // Get public profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: true });

    if (!profiles || profiles.length === 0) { setLoading(false); return; }

    // Get habits and checks for public users
    const userIds = profiles.map(p => p.id);

    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .in('user_id', userIds);

    const { data: checks } = await supabase
      .from('daily_checks')
      .select('*')
      .in('user_id', userIds);

    // Compute streaks and totals
    const enriched = profiles.map(profile => {
      const userHabits = (habits || []).filter(h => h.user_id === profile.id);
      const userChecks = (checks || []).filter(c => c.user_id === profile.id);

      // Calculate best streak across all habits
      let bestStreak = 0;
      let totalDays = 0;

      userHabits.forEach(habit => {
        const habitChecks = userChecks.filter(c => c.habit_id === habit.id);
        totalDays += habitChecks.length;

        // Calculate current streak
        let streak = 0;
        const d = new Date();
        while (true) {
          const ds = d.toISOString().split('T')[0];
          if (habitChecks.some(c => c.check_date === ds)) { streak++; d.setDate(d.getDate() - 1); }
          else break;
        }
        if (streak > bestStreak) bestStreak = streak;
      });

      return {
        ...profile,
        habits: profile.show_habits ? userHabits : [],
        bestStreak,
        totalDays,
      };
    });

    setUsers(enriched);
    setLoading(false);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '4px', color: '#e8e4dc', fontWeight: 400, marginBottom: '16px' }}>
          COMMUNITY COMING SOON
        </h2>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7 }}>
          See who's fighting the same battle. Public profiles will appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>COMMUNITY</h1>
        <p style={s.subtitle}>
          People in recovery. No ranking. No competition. Just proof that you're not alone.
        </p>

        <div style={s.tabs}>
          <button onClick={() => setTab('members')} style={{ ...s.tabBtn, color: tab === 'members' ? '#c45a2a' : '#555', borderBottomColor: tab === 'members' ? '#c45a2a' : 'transparent' }}>MEMBERS</button>
          <button onClick={() => setTab('notes')} style={{ ...s.tabBtn, color: tab === 'notes' ? '#c45a2a' : '#555', borderBottomColor: tab === 'notes' ? '#c45a2a' : 'transparent' }}>PUBLIC NOTES</button>
        </div>

        {tab === 'members' && (
          loading ? (
            <div style={s.loading}>Loading...</div>
          ) : users.length === 0 ? (
            <div style={s.empty}>
              <p style={s.emptyText}>No public profiles yet. Be the first.</p>
            </div>
          ) : (
            <div style={s.list}>
              {users.map(u => (
                <div key={u.id} style={s.card}>
                  <div style={s.cardHeader}>
                    <span style={s.username}>{u.username}</span>
                    {u.show_streak && (
                      <span style={s.streakBadge}>
                        <span style={s.streakNum}>{u.bestStreak}</span> day streak
                      </span>
                    )}
                  </div>

                  {u.show_total_days && (
                    <div style={s.stat}>{u.totalDays} total days tracked</div>
                  )}

                  {u.show_habits && u.habits.length > 0 && (
                    <div style={s.habits}>
                      {u.habits.map(h => (
                        <span key={h.id} style={s.habitTag}>{h.name}</span>
                      ))}
                    </div>
                  )}

                  {u.show_message && u.motivational_message && (
                    <p style={s.message}>"{u.motivational_message}"</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'notes' && (
          notes.length === 0 ? (
            <div style={s.empty}>
              <p style={s.emptyText}>No public notes yet.</p>
              <p style={s.emptyHint}>When tracking your habits, toggle a note to "PUBLIC" to share it here.</p>
            </div>
          ) : (
            <div style={s.notesList}>
              {notes.map(n => (
                <div key={n.id} style={s.noteCard}>
                  <div style={s.noteMeta}>
                    <span style={s.noteDate}>{formatNoteDate(n.note_date)}</span>
                    <span style={s.noteSep}>—</span>
                    {n.habits?.name && <span style={s.noteHabit}>{n.habits.name}</span>}
                  </div>
                  <p style={s.noteText}>{n.note_text}</p>
                  <span style={s.noteAuthor}>— {n.profiles?.username || 'Anonymous'}</span>
                </div>
              ))}
            </div>
          )
        )}

        <div style={s.footer}>
          <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer" style={s.discordLink}>
            JOIN THE DISCORD FOR DEEPER SUPPORT →
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
  subtitle: { fontSize: '15px', color: '#666', margin: '0 0 32px 0', lineHeight: 1.7 },
  loading: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '3px', color: '#555', textAlign: 'center', padding: '60px' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: '15px', color: '#555', fontStyle: 'italic', marginBottom: '8px' },
  emptyHint: { fontSize: '13px', color: '#333', lineHeight: 1.6 },

  tabs: { display: 'flex', gap: '0', marginBottom: '32px', borderBottom: '1px solid #1a1a1a' },
  tabBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', padding: '12px 20px', transition: 'all 0.2s' },

  list: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' },
  card: { padding: '24px', background: 'rgba(15,15,15,0.6)', border: '1px solid #1a1a1a' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  username: { fontFamily: "'Oswald', sans-serif", fontSize: '15px', letterSpacing: '3px', color: '#e8e4dc' },
  streakBadge: { fontSize: '13px', color: '#888' },
  streakNum: { fontFamily: "'Oswald', sans-serif", fontSize: '22px', color: '#c45a2a', marginRight: '4px' },
  stat: { fontSize: '13px', color: '#555', marginBottom: '8px' },
  habits: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' },
  habitTag: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '4px 10px', border: '1px solid #222', color: '#777' },
  message: { fontSize: '14px', color: '#777', fontStyle: 'italic', marginTop: '12px', lineHeight: 1.6 },

  notesList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' },
  noteCard: { padding: '20px 24px', background: 'rgba(15,15,15,0.6)', borderLeft: '2px solid #c45a2a22', borderTop: 'none', borderRight: 'none', borderBottom: '1px solid #141414' },
  noteMeta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  noteDate: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '2px', color: '#666' },
  noteSep: { color: '#333', fontSize: '12px' },
  noteHabit: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '2px 10px', border: '1px solid #222', color: '#888' },
  noteText: { fontSize: '15px', lineHeight: 1.8, color: '#999', margin: '0 0 10px 0', fontStyle: 'italic' },
  noteAuthor: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#c45a2a' },

  footer: { textAlign: 'center', padding: '32px 0', borderTop: '1px solid #1a1a1a' },
  discordLink: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', color: '#555', textDecoration: 'none' },
};
