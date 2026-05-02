// Weekly volume helpers. ISO week (Mon-start, exclusive Sunday end).

const DAY = 86400000;

export function startOfIsoWeek(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setDate(date.getDate() - day);
  return date;
}

export function endOfIsoWeek(d = new Date()) {
  const start = startOfIsoWeek(d);
  return new Date(start.getTime() + 7 * DAY);
}

function tonnageOfStrength(workout) {
  let sum = 0;
  for (const s of workout.sets || []) {
    if (Number.isFinite(s.reps) && Number.isFinite(s.load_kg)) {
      sum += s.reps * s.load_kg;
    }
  }
  return sum;
}

function durationOfCardio(workout) {
  const block = (workout.sets || [])[0];
  if (!block) return 0;
  if (block.kind === 'intervals') {
    return (block.blocks || []).reduce((a, b) => a + (b.duration_s || 0), 0);
  }
  if (block.kind === 'steady') {
    return block.duration_s || 0;
  }
  return 0;
}

export function summarizeRange(workouts, fromDate, toDate) {
  const from = fromDate.getTime();
  const to = toDate.getTime();
  let strengthSessions = 0;
  let strengthTonnage = 0;
  let cardioSessions = 0;
  let cardioSeconds = 0;
  for (const w of workouts) {
    const t = new Date(w.performed_at).getTime();
    if (t < from || t >= to) continue;
    if (w.session_kind === 'cardio') {
      cardioSessions += 1;
      cardioSeconds += durationOfCardio(w);
    } else {
      strengthSessions += 1;
      strengthTonnage += tonnageOfStrength(w);
    }
  }
  return {
    strengthSessions, strengthTonnage,
    cardioSessions, cardioSeconds,
    totalSessions: strengthSessions + cardioSessions,
  };
}

export function thisWeekVsLast(workouts, now = new Date()) {
  const thisStart = startOfIsoWeek(now);
  const thisEnd = endOfIsoWeek(now);
  const lastStart = new Date(thisStart.getTime() - 7 * DAY);
  const lastEnd = thisStart;
  return {
    thisWeek: summarizeRange(workouts, thisStart, thisEnd),
    lastWeek: summarizeRange(workouts, lastStart, lastEnd),
  };
}

export function fmtTonnage(kg) {
  if (!Number.isFinite(kg) || kg <= 0) return '0 kg';
  if (kg >= 1000) {
    return `${kg.toLocaleString('en-GB', { maximumFractionDigits: 0 })} kg`;
  }
  return `${Math.round(kg)} kg`;
}

export function fmtDurationLong(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h && m) return `${h}h ${m}min`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export function tonnageDirection(thisKg, lastKg) {
  if (lastKg === 0 && thisKg === 0) return 'flat';
  if (thisKg > lastKg + 0.01) return 'up';
  if (thisKg < lastKg - 0.01) return 'down';
  return 'flat';
}
