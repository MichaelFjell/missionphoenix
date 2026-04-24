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
      <main className="page narrow">
        <h2 style={{ fontSize: '18px', letterSpacing: '4px', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', marginTop: '60px' }}>Journal coming soon</h2>
      </main>
    );
  }

  const groups = groupByDate(entries);

  return (
    <>
      <style>{`
        .jl-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;gap:16px;flex-wrap:wrap;}
        .jl-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;}
        .jl-sub{font-size:15px;color:var(--ink-3);margin:0;line-height:1.7;max-width:520px;}
        .jl-refresh{font-size:16px;background:transparent;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;cursor:pointer;padding:8px 14px;flex-shrink:0;font-family:inherit;}
        .jl-refresh:hover{border-color:var(--copper);color:var(--copper);}
        .jl-err{font-size:13px;color:#b82030;margin-bottom:24px;padding:12px 16px;border:1px solid rgba(184,32,48,0.3);background:rgba(184,32,48,0.06);border-radius:8px;line-height:1.6;}
        .jl-loading{font-size:13px;letter-spacing:3px;color:var(--ink-3);text-align:center;padding:60px;}
        .jl-empty{text-align:center;padding:60px 0;border:1px dashed var(--line);border-radius:14px;}
        .jl-empty .t{font-size:16px;color:var(--ink-2);font-style:italic;margin-bottom:8px;}
        .jl-empty .h{font-size:14px;color:var(--ink-3);line-height:1.6;}
        .jl-divider{display:flex;align-items:center;gap:12px;padding:24px 0 12px;border-bottom:1px solid var(--line);margin-bottom:14px;}
        .jl-divider .d{font-size:12px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}
        .jl-divider .a{font-size:12px;color:var(--ink-3);}
        .jl-entry{padding:18px 22px;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;margin-bottom:10px;}
        .jl-etop{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;}
        .jl-user{font-size:12px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}
        .jl-habit{font-size:10px;font-weight:700;letter-spacing:2px;padding:3px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--ink-3);text-transform:uppercase;}
        .jl-text{font-size:15px;line-height:1.75;color:var(--ink-2);margin:0;font-style:italic;}
        .jl-foot{text-align:center;padding:32px 0;border-top:1px solid var(--line);margin-top:32px;}
        .jl-foot a{font-size:12px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}
        .jl-foot a:hover{text-decoration:underline;}
      `}</style>
      <main className="page narrow">
        <div className="jl-head">
          <div>
            <h1 className="jl-title">Community Journal</h1>
            <p className="jl-sub">Real words from real people in recovery. Wins, struggles, and everything in between.</p>
          </div>
          <button onClick={loadJournal} className="jl-refresh" title="Refresh" disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </div>

        {error && <div className="jl-err">{error}</div>}

        {loading ? (
          <div className="jl-loading">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="jl-empty">
            <p className="t">No public journal entries yet.</p>
            <p className="h">When tracking your habits, you can add notes and choose to share them here.</p>
          </div>
        ) : (
          <div>
            {groups.map(group => (
              <div key={group.date}>
                <div className="jl-divider">
                  <span className="d">{formatDate(group.date)}</span>
                  <span className="a">{timeAgo(group.date)}</span>
                </div>
                {group.entries.map(entry => (
                  <div key={entry.id} className="jl-entry">
                    <div className="jl-etop">
                      <span className="jl-user">{entry.profiles?.username || 'Anonymous'}</span>
                      {entry.habits?.name && <span className="jl-habit">{entry.habits.name}</span>}
                    </div>
                    <p className="jl-text">{entry.note_text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="jl-foot">
          <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer">
            Want deeper conversations? Join Discord →
          </a>
        </div>
      </main>
    </>
  );
}
