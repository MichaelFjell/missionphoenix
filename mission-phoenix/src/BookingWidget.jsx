import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

// Fallback for browsers without Intl.supportedValuesOf (Safari < 15.4)
const FALLBACK_ZONES = [
  'Europe/Stockholm', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid',
  'Europe/Rome', 'Europe/Amsterdam', 'Europe/Helsinki', 'Europe/Athens', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Sao_Paulo', 'America/Mexico_City', 'Africa/Cairo',
  'Africa/Johannesburg', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata',
  'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Tokyo',
  'Asia/Seoul', 'Australia/Sydney', 'Pacific/Auckland', 'UTC',
];

function allZones(detected) {
  let zones = FALLBACK_ZONES;
  try {
    if (typeof Intl.supportedValuesOf === 'function') zones = Intl.supportedValuesOf('timeZone');
  } catch { /* fallback */ }
  return zones.includes(detected) ? zones : [detected, ...zones];
}

function detectZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Stockholm';
  } catch {
    return 'Europe/Stockholm';
  }
}

// 'YYYY-MM-DD' for an instant, as seen in tz
function dayKey(date, tz) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

function fmtTime(iso, tz) {
  return new Intl.DateTimeFormat(undefined, { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function fmtDayLong(key, tz) {
  // key is 'YYYY-MM-DD' in tz; noon UTC on that date is safely the same calendar day everywhere relevant
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

function fmtFull(iso, tz) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');

export default function BookingWidget() {
  const [tz, setTz] = useState(detectZone);
  const [slots, setSlots] = useState(null); // array of ISO strings, null = loading
  const [loadError, setLoadError] = useState('');
  const [cursor, setCursor] = useState(null); // 'YYYY-MM'
  const [selectedDay, setSelectedDay] = useState(null); // 'YYYY-MM-DD'
  const [selectedSlot, setSelectedSlot] = useState(null); // ISO
  const [step, setStep] = useState('pick'); // pick | form | done
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [banner, setBanner] = useState('');
  const [done, setDone] = useState(null); // { iso, email }

  const zones = useMemo(() => allZones(detectZone()), []);

  const loadSlots = useCallback(async () => {
    if (!isSupabaseConfigured()) { setSlots([]); return; }
    const { data, error } = await supabase.rpc('get_available_slots');
    if (error) {
      setLoadError('Could not load available times. Please refresh the page.');
      setSlots([]);
      return;
    }
    setLoadError('');
    setSlots((data || []).map((r) => r.slot_start));
  }, []);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const iso of slots || []) {
      const k = dayKey(new Date(iso), tz);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(iso);
    }
    for (const list of m.values()) list.sort();
    return m;
  }, [slots, tz]);

  const todayKey = dayKey(new Date(), tz);
  const minMonth = todayKey.slice(0, 7);
  const maxMonth = useMemo(() => {
    const keys = [...byDay.keys()].sort();
    const horizon = dayKey(new Date(Date.now() + 21 * 86400000), tz).slice(0, 7);
    const last = keys.length ? keys[keys.length - 1].slice(0, 7) : horizon;
    return last > horizon ? last : horizon;
  }, [byDay, tz]);

  useEffect(() => {
    if (!cursor) setCursor(minMonth);
  }, [cursor, minMonth]);

  // Changing timezone can shift which local date a slot falls on
  const changeTz = (z) => {
    setTz(z);
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const moveMonth = (dir) => {
    if (!cursor) return;
    const [y, m] = cursor.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + dir, 1));
    setCursor(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc('book_slot', {
      p_starts_at: selectedSlot,
      p_name: form.name.trim(),
      p_email: form.email.trim(),
      p_message: form.message.trim(),
      p_timezone: tz,
    });
    setSubmitting(false);
    if (error) {
      const msg = error.message || '';
      if (msg.includes('SLOT_TAKEN')) {
        setBanner('That time was just taken by someone else. Please pick another one.');
        setStep('pick');
        setSelectedSlot(null);
        setSelectedDay(null);
        loadSlots();
      } else if (msg.includes('ALREADY_BOOKED')) {
        setFormError('You already have an upcoming call booked with this email. Reply to your confirmation email if you need to change it.');
      } else if (msg.includes('INVALID_EMAIL')) {
        setFormError('That email address does not look valid.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
      return;
    }
    setDone({ iso: selectedSlot, email: form.email.trim() });
    setStep('done');
    loadSlots();
  };

  // ---- render helpers ----

  const renderCalendar = () => {
    if (!cursor) return null;
    const [y, m] = cursor.split('-').map(Number); // m is 1-based
    const daysInMonth = new Date(y, m, 0).getDate();
    const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday first
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${cursor}-${pad(d)}`);

    return (
      <div className="bk-cal">
        <div className="bk-cal-head">
          <button type="button" className="bk-nav" onClick={() => moveMonth(-1)} disabled={cursor <= minMonth} aria-label="Previous month">‹</button>
          <div className="bk-month">{MONTH_NAMES[m - 1]} {y}</div>
          <button type="button" className="bk-nav" onClick={() => moveMonth(1)} disabled={cursor >= maxMonth} aria-label="Next month">›</button>
        </div>
        <div className="bk-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => (
            <div key={w} className="bk-dow">{w}</div>
          ))}
          {cells.map((key, i) => {
            if (!key) return <div key={`e${i}`} />;
            const n = byDay.get(key)?.length || 0;
            const past = key < todayKey;
            const open = n > 0;
            return (
              <button
                key={key}
                type="button"
                className={
                  'bk-day' + (open ? ' open' : '') +
                  (past ? ' past' : '') +
                  (selectedDay === key ? ' sel' : '')
                }
                disabled={!open}
                onClick={() => { setSelectedDay(key); setSelectedSlot(null); }}
              >
                <span>{Number(key.slice(8))}</span>
                {open && <i className="bk-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSlots = () => {
    if (!selectedDay) return <p className="bk-hint">Days marked with a dot have open times. Pick one.</p>;
    const list = byDay.get(selectedDay) || [];
    return (
      <div className="bk-slots">
        <div className="bk-slots-day">{fmtDayLong(selectedDay, tz)}</div>
        <div className="bk-slot-list">
          {list.map((iso) => (
            <button
              key={iso}
              type="button"
              className={'bk-slot' + (selectedSlot === iso ? ' sel' : '')}
              onClick={() => setSelectedSlot(iso)}
            >
              {fmtTime(iso, tz)}
            </button>
          ))}
        </div>
        {selectedSlot && (
          <button type="button" className="btn primary bk-continue" onClick={() => { setBanner(''); setStep('form'); }}>
            Continue with {fmtTime(selectedSlot, tz)} →
          </button>
        )}
      </div>
    );
  };

  if (!isSupabaseConfigured()) {
    return <div className="card bk-card"><p className="muted">Booking is temporarily unavailable. Email fjellmichaa@gmail.com to set up a call.</p></div>;
  }

  return (
    <div className="card bk-card" id="book">
      <style>{`
        .bk-card{padding:28px;}
        .bk-tz{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:22px;font-size:13px;color:var(--ink-3);}
        .bk-tz select{padding:8px 12px;border-radius:8px;border:1px solid var(--line-2);background:var(--bg);color:var(--ink);font-family:inherit;font-size:13px;max-width:280px;}
        .bk-banner{background:var(--copper-soft);border:1px solid var(--copper);color:var(--copper);padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:18px;}
        .bk-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:32px;align-items:start;}
        @media(max-width:720px){.bk-layout{grid-template-columns:1fr;}}
        .bk-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .bk-month{font-weight:700;font-size:15px;letter-spacing:0.3px;}
        .bk-nav{width:34px;height:34px;border-radius:8px;border:1px solid var(--line-2);background:transparent;color:var(--ink);font-size:18px;cursor:pointer;}
        .bk-nav:disabled{opacity:0.3;cursor:default;}
        .bk-nav:not(:disabled):hover{border-color:var(--copper);color:var(--copper);}
        .bk-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
        .bk-dow{text-align:center;font-size:11px;font-weight:700;letter-spacing:1px;color:var(--ink-3);padding:6px 0;text-transform:uppercase;}
        .bk-day{position:relative;aspect-ratio:1;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--ink-3);font-size:14px;font-family:inherit;display:flex;align-items:center;justify-content:center;cursor:default;}
        .bk-day.open{border-color:var(--line-2);color:var(--ink);cursor:pointer;font-weight:600;}
        .bk-day.open:hover{border-color:var(--copper);}
        .bk-day.sel{background:var(--copper);color:var(--on-accent);border-color:var(--copper);}
        .bk-day.past{opacity:0.35;}
        .bk-dot{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--copper);}
        .bk-day.sel .bk-dot{background:var(--on-accent);}
        .bk-hint{font-size:14px;color:var(--ink-3);padding-top:8px;}
        .bk-slots-day{font-weight:700;font-size:15px;margin-bottom:14px;}
        .bk-slot-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;}
        .bk-slot{padding:10px 18px;border-radius:10px;border:1px solid var(--line-2);background:transparent;color:var(--ink);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;}
        .bk-slot:hover{border-color:var(--copper);color:var(--copper);}
        .bk-slot.sel{background:var(--copper);color:var(--on-accent);border-color:var(--copper);}
        .bk-continue{width:100%;justify-content:center;}
        .bk-empty{font-size:15px;color:var(--ink-2);}
        .bk-form-when{background:var(--copper-soft);color:var(--copper);font-weight:700;padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:20px;}
        .bk-err{color:#d06552;font-size:14px;margin-bottom:14px;}
        .bk-actions{display:flex;gap:10px;flex-wrap:wrap;}
        .bk-done{text-align:center;padding:24px 8px;}
        .bk-done-icon{width:56px;height:56px;border-radius:50%;background:var(--copper-soft);color:var(--copper);font-size:26px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
        .bk-done h3{font-size:22px;font-weight:800;margin-bottom:10px;}
        .bk-done p{font-size:15px;color:var(--ink-2);line-height:1.7;max-width:440px;margin:0 auto 8px;}
        .bk-done .when{font-size:17px;font-weight:700;color:var(--copper);margin-bottom:14px;}
      `}</style>

      {step !== 'done' && (
        <div className="bk-tz">
          <span>Times shown in</span>
          <select value={tz} onChange={(e) => changeTz(e.target.value)} aria-label="Timezone">
            {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      )}

      {banner && step === 'pick' && <div className="bk-banner">{banner}</div>}

      {step === 'pick' && (
        slots === null ? (
          <p className="muted">Loading available times…</p>
        ) : loadError ? (
          <p className="bk-err">{loadError}</p>
        ) : byDay.size === 0 ? (
          <p className="bk-empty">No open times right now. New times are released continuously — check back soon, or email fjellmichaa@gmail.com.</p>
        ) : (
          <div className="bk-layout">
            {renderCalendar()}
            {renderSlots()}
          </div>
        )
      )}

      {step === 'form' && (
        <form onSubmit={submit}>
          <div className="bk-form-when">{fmtFull(selectedSlot, tz)} · 30 minutes · free</div>
          <div className="field-wrap">
            <label className="field" htmlFor="bk-name">Name</label>
            <input id="bk-name" type="text" maxLength={200} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field-wrap">
            <label className="field" htmlFor="bk-email">Email</label>
            <input id="bk-email" type="email" maxLength={320} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field-wrap">
            <label className="field" htmlFor="bk-msg">Where are you in your recovery and what do you want out of this call?</label>
            <textarea id="bk-msg" rows={5} maxLength={5000} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          {formError && <p className="bk-err">{formError}</p>}
          <div className="bk-actions">
            <button type="button" className="btn ghost" onClick={() => { setStep('pick'); setFormError(''); }} disabled={submitting}>← Back</button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? 'Booking…' : 'Book this call'}
            </button>
          </div>
        </form>
      )}

      {step === 'done' && done && (
        <div className="bk-done">
          <div className="bk-done-icon">✓</div>
          <h3>Your call is booked</h3>
          <div className="when">{fmtFull(done.iso, tz)}</div>
          <p>A confirmation has been sent to <strong>{done.email}</strong>. You will get the Zoom link in a separate email before the call.</p>
          <p>Come as you are. We go through where you are, what you have tried and what you want.</p>
        </div>
      )}
    </div>
  );
}
