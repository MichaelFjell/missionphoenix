import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from './main.jsx';
import { isSupabaseConfigured } from './supabase.js';
import { loadProgram, loadWorkouts } from './trainer/store.js';
import { progressionForExercise } from './trainer/oneRm.js';
import Chart from './trainer/Chart.jsx';
import './trainer.css';

function ExerciseView() {
  const { user } = useAuth();
  const { slug } = useParams();
  const [program, setProgram] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, w] = await Promise.all([
        loadProgram(user?.id),
        loadWorkouts(user?.id, { limit: 500 }),
      ]);
      if (cancelled) return;
      setProgram(p);
      setWorkouts(w);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const meta = useMemo(() => {
    for (const s of program) {
      for (const slot of s.slots || []) {
        if (slot.exercise.slug === slug) return slot.exercise;
        const alt = (slot.alternatives || []).find(a => a.slug === slug);
        if (alt) return alt;
      }
    }
    // Fallback: pull from workout history
    for (const w of workouts) {
      const found = (w.sets || []).find(s => s.exercise_slug === slug);
      if (found) return { name: found.exercise_name, slug, tags: [] };
    }
    return null;
  }, [program, workouts, slug]);

  const { points, best_1rm } = useMemo(
    () => progressionForExercise(workouts, slug),
    [workouts, slug]
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
        <h1>{meta?.name || slug}</h1>
        <div className="sub">
          {meta?.tags?.length ? meta.tags.join(' · ') : 'No tags'}
          {best_1rm > 0 && <> · best est-1RM {Math.round(best_1rm)}kg</>}
        </div>
      </div>

      <Chart points={points} />

      <div className="tr-ex-list">
        {points.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '20px 0' }}>
            No logs for this exercise yet.
          </div>
        )}
        {[...points].reverse().map(p => (
          <div className="item" key={p.workout_id + '-' + p.date}>
            <div className="d">{new Date(p.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
            <div className="sets">
              Top set: <b>{p.top_load}kg × {p.top_reps}</b>
              <span style={{ color: 'var(--ink-3)', marginLeft: 10 }}>est-1RM ≈ {Math.round(p.est_1rm)}kg</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function TrainerExercise() {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured()) return <Navigate to="/trainer" replace />;
  if (loading) return null;
  if (!user) return <Navigate to="/trainer" replace />;
  return <ExerciseView />;
}
