// Epley one-rep-max estimate and PR helpers.

export function epley(load_kg, reps) {
  if (!load_kg || !reps || reps < 1) return 0;
  if (reps === 1) return load_kg;
  return load_kg * (1 + reps / 30);
}

// Top set per workout for an exercise = the set with the highest est-1RM.
export function topSetForExercise(workout, slug) {
  const candidates = (workout.sets || []).filter(s => s.exercise_slug === slug && s.load_kg);
  if (!candidates.length) return null;
  let best = candidates[0];
  let bestE = epley(best.load_kg, best.reps);
  for (let i = 1; i < candidates.length; i++) {
    const e = epley(candidates[i].load_kg, candidates[i].reps);
    if (e > bestE) { best = candidates[i]; bestE = e; }
  }
  return { ...best, est_1rm: bestE };
}

// Returns { points: [{ date, top_load, top_reps, est_1rm }], best_1rm }
export function progressionForExercise(workouts, slug) {
  const points = [];
  let best_1rm = 0;
  const sorted = [...workouts].sort((a, b) =>
    new Date(a.performed_at) - new Date(b.performed_at)
  );
  for (const w of sorted) {
    const top = topSetForExercise(w, slug);
    if (!top) continue;
    points.push({
      date: w.performed_at,
      top_load: top.load_kg,
      top_reps: top.reps,
      est_1rm: top.est_1rm,
      workout_id: w.client_id || w.id,
    });
    if (top.est_1rm > best_1rm) best_1rm = top.est_1rm;
  }
  return { points, best_1rm };
}

// Is a freshly-logged set a PR for that exercise vs. all previous workouts?
export function isPR(workouts, currentClientId, slug, load_kg, reps) {
  const e = epley(load_kg, reps);
  if (!e) return false;
  let prev = 0;
  for (const w of workouts) {
    if ((w.client_id || w.id) === currentClientId) continue;
    for (const s of w.sets || []) {
      if (s.exercise_slug !== slug || !s.load_kg) continue;
      const ee = epley(s.load_kg, s.reps);
      if (ee > prev) prev = ee;
    }
  }
  return e > prev;
}
