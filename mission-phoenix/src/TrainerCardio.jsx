import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { isSupabaseConfigured } from './supabase.js';
import { loadWorkouts } from './trainer/store.js';
import './trainer.css';

function fmtDur(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '–';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s ? s + 's' : ''}`.trim();
  return `${s}s`;
}

function totals(workout) {
  const block = (workout.sets || [])[0];
  if (!block) return { duration_s: 0, avg_hr: null, distance_km: null, kind: null };
  if (block.kind === 'intervals') {
    const blocks = block.blocks || [];
    const duration_s = blocks.reduce((sum, b) => sum + (b.duration_s || 0), 0);
    const hrs = blocks.map(b => b.avg_hr).filter(n => Number.isFinite(n));
    const avg_hr = hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null;
    return { duration_s, avg_hr, distance_km: null, kind: 'intervals', count: blocks.length };
  }
  if (block.kind === 'steady') {
    return {
      duration_s: block.duration_s || 0,
      avg_hr: block.avg_hr ?? null,
      distance_km: block.distance_km ?? null,
      kind: 'steady',
    };
  }
  return { duration_s: 0, avg_hr: null, distance_km: null, kind: null };
}

function CardioView() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const w = await loadWorkouts(user?.id, { limit: 200 });
      if (cancelled) return;
      setWorkouts(w);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const cardio = useMemo(
    () => workouts.filter(w => w.session_kind === 'cardio'),
    [workouts]
  );

  if (loading) {
    return (
      <main className="page narrow">
        <p style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', letterSpacing: 3 }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="page tr-page narrow">
      <Link to="/trainer" className="btn ghost sm" style={{ marginBottom: 18 }}>← Back</Link>
      <div className="tr-ex-head">
        <h1>Cardio history</h1>
        <div className="sub">{cardio.length} session{cardio.length === 1 ? '' : 's'} logged</div>
      </div>

      <div className="tr-ex-list tr-cardio-list">
        {cardio.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '20px 0' }}>
            No cardio sessions yet. Start an N4×4 or Z2 from the dashboard.
          </div>
        )}
        {cardio.map(w => {
          const t = totals(w);
          return (
            <div className="item item-cardio" key={w.client_id || w.id}>
              <div className="d">
                {new Date(w.performed_at).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} · {w.code}
              </div>
              <div className="sets">
                <b>{t.kind === 'intervals' ? `${t.count} blocks` : 'Steady'}</b>
                <span className="meta-line" style={{ marginTop: 4 }}>
                  <span>{fmtDur(t.duration_s)}</span>
                  {t.avg_hr != null && <span>· avg HR {t.avg_hr}</span>}
                  {t.distance_km != null && <span>· {t.distance_km} km</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function TrainerCardio() {
  const { user, profile, loading } = useAuth();
  if (!isSupabaseConfigured()) return <Navigate to="/trainer" replace />;
  if (loading) return null;
  if (!user) return <Navigate to="/trainer" replace />;
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return <CardioView />;
}
