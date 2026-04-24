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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: true });

    if (!profiles || profiles.length === 0) { setLoading(false); return; }

    const userIds = profiles.map(p => p.id);

    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .in('user_id', userIds);

    const { data: checks } = await supabase
      .from('daily_checks')
      .select('*')
      .in('user_id', userIds);

    const enriched = profiles.map(profile => {
      const userHabits = (habits || []).filter(h => h.user_id === profile.id);
      const userChecks = (checks || []).filter(c => c.user_id === profile.id);

      let bestStreak = 0;
      let totalDays = 0;

      userHabits.forEach(habit => {
        const habitChecks = userChecks.filter(c => c.habit_id === habit.id);
        totalDays += habitChecks.length;

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
      <main className="page narrow">
        <h1 className="cm-title">Community coming soon</h1>
        <p className="cm-sub">See who's fighting the same battle. Public profiles will appear here.</p>
      </main>
    );
  }

  return (
    <>
      <style>{`
        .cm-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;}
        .cm-sub{font-size:15px;color:var(--ink-3);margin-bottom:32px;line-height:1.7;}
        .cm-tabs{display:flex;gap:0;margin-bottom:32px;border-bottom:1px solid var(--line);}
        .cm-tab{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;padding:14px 18px;color:var(--ink-3);font-family:inherit;transition:all .15s;white-space:nowrap;}
        .cm-tab:hover{color:var(--ink-2);}
        .cm-tab.on{color:var(--copper);border-bottom-color:var(--copper);}
        .cm-empty{text-align:center;padding:80px 24px;border:1px dashed var(--line);border-radius:14px;}
        .cm-empty p{color:var(--ink-3);font-style:italic;font-size:15px;line-height:1.7;max-width:440px;margin:0 auto;}
        .cm-list{display:flex;flex-direction:column;gap:14px;margin-bottom:48px;}
        .cm-mcard{padding:22px 24px;background:var(--card);border:1px solid var(--line);border-radius:14px;}
        .cm-mhead{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:16px;flex-wrap:wrap;}
        .cm-mname{font-size:15px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--ink);line-height:1.3;min-width:0;flex:1;}
        .cm-streak{font-size:13px;color:var(--ink-2);white-space:nowrap;flex-shrink:0;}
        .cm-streak b{font-size:22px;font-weight:800;color:var(--copper);margin-right:4px;}
        .cm-mstat{font-size:13px;color:var(--ink-3);margin-bottom:8px;}
        .cm-habits{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
        .cm-tag{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border:1px solid var(--line-2);border-radius:999px;color:var(--ink-3);white-space:nowrap;}
        .cm-mmsg{font-size:14px;color:var(--ink-2);font-style:italic;margin-top:12px;line-height:1.6;}
        .cm-ncard{padding:20px 24px;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 14px 14px 0;}
        .cm-nmeta{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;}
        .cm-ndate{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--ink-3);}
        .cm-nsep{color:var(--line-2);}
        .cm-nhabit{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--ink-3);white-space:nowrap;}
        .cm-ntext{font-size:15px;line-height:1.75;color:var(--ink-2);margin:0 0 10px 0;font-style:italic;}
        .cm-nauthor{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--copper);}
        .cm-foot{text-align:center;padding:32px 0;border-top:1px solid var(--line);margin-top:24px;}
        .cm-foot a{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--copper);}
        .cm-foot a:hover{text-decoration:underline;}
        .cm-loading{font-size:13px;letter-spacing:2px;color:var(--ink-3);text-align:center;padding:60px;}
      `}</style>
      <main className="page narrow">
        <h1 className="cm-title">Community</h1>
        <p className="cm-sub">People in recovery. No ranking. No competition. Just proof that you're not alone.</p>

        <div className="cm-tabs">
          <button onClick={() => setTab('members')} className={`cm-tab ${tab === 'members' ? 'on' : ''}`}>Members</button>
          <button onClick={() => setTab('notes')} className={`cm-tab ${tab === 'notes' ? 'on' : ''}`}>Public Notes</button>
        </div>

        {tab === 'members' && (
          loading ? (
            <div className="cm-loading">Loading...</div>
          ) : users.length === 0 ? (
            <div className="cm-empty">
              <p>No public profiles yet. Be the first.</p>
            </div>
          ) : (
            <div className="cm-list">
              {users.map(u => (
                <div key={u.id} className="cm-mcard">
                  <div className="cm-mhead">
                    <div className="cm-mname">{u.username}</div>
                    {u.show_streak && (
                      <div className="cm-streak"><b>{u.bestStreak}</b>day streak</div>
                    )}
                  </div>
                  {u.show_total_days && (
                    <div className="cm-mstat">{u.totalDays} total days tracked</div>
                  )}
                  {u.show_habits && u.habits.length > 0 && (
                    <div className="cm-habits">
                      {u.habits.map(h => (
                        <span key={h.id} className="cm-tag">{h.name}</span>
                      ))}
                    </div>
                  )}
                  {u.show_message && u.motivational_message && (
                    <p className="cm-mmsg">"{u.motivational_message}"</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'notes' && (
          notes.length === 0 ? (
            <div className="cm-empty">
              <p>No public notes yet. When tracking your habits, toggle a note to "PUBLIC" to share it here.</p>
            </div>
          ) : (
            <div className="cm-list">
              {notes.map(n => (
                <div key={n.id} className="cm-ncard">
                  <div className="cm-nmeta">
                    <span className="cm-ndate">{formatNoteDate(n.note_date)}</span>
                    <span className="cm-nsep">—</span>
                    {n.habits?.name && <span className="cm-nhabit">{n.habits.name}</span>}
                  </div>
                  <p className="cm-ntext">{n.note_text}</p>
                  <span className="cm-nauthor">— {n.profiles?.username || 'Anonymous'}</span>
                </div>
              ))}
            </div>
          )
        )}

        <div className="cm-foot">
          <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer">
            Join the Discord for deeper support →
          </a>
        </div>
      </main>
    </>
  );
}
