// Conditional-slot rule engine.
// Given a session's slots and recent workouts, decide which conditional
// slots should be surfaced as "optional today" with an explanatory note.

const DAY = 86400000;

function withinLastDays(performedAt, days) {
  const t = new Date(performedAt).getTime();
  return Date.now() - t <= days * DAY;
}

function neckLogsLast7Days(workouts) {
  const NECK_TAG = 'rehab';
  let count = 0;
  for (const w of workouts) {
    if (!withinLastDays(w.performed_at, 7)) continue;
    for (const s of w.sets || []) {
      // Heuristic: any logged set with slug starting with 'neck-' or matching a neck slug pattern.
      if (/^neck-|^plate-neck-|^banded-neck-/.test(s.exercise_slug)) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

export function evaluateSlots(slots, workouts) {
  return slots.map(slot => {
    if (!slot.conditional) return { ...slot, _suggested: true, _suggestion_reason: null };
    if (slot.conditional_rule === 'neck-rotation') {
      const n = neckLogsLast7Days(workouts);
      const suggested = n < 2;
      return {
        ...slot,
        _suggested: suggested,
        _suggestion_reason: suggested
          ? `Neck trained ${n}× in last 7 days — include today.`
          : `Neck already trained ${n}× this week — skip if short on time.`,
      };
    }
    return { ...slot, _suggested: true, _suggestion_reason: null };
  });
}
