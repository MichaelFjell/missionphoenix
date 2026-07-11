// Date helpers for the coaching portal. All "local dates" are the client's
// calendar date in their own timezone, formatted YYYY-MM-DD.

export function localDateISO(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function addDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// b - a in whole days
export function daysBetween(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

// Consecutive checked-in days ending today (or yesterday, if today isn't done yet).
export function computeStreak(dateSet, todayISO) {
  let d = dateSet.has(todayISO) ? todayISO : addDaysISO(todayISO, -1);
  let streak = 0;
  while (dateSet.has(d)) { streak++; d = addDaysISO(d, -1); }
  return streak;
}

export function fmtNice(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function listTimezones() {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['Europe/Stockholm', 'Europe/London', 'Europe/Berlin', 'UTC',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'Asia/Tokyo', 'Australia/Sydney'];
  }
}
