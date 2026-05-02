import { useEffect, useRef, useState } from 'react';

// Floating rest timer with three presets + manual input + vibrate on done.
// Listens for the global 'mp-trainer-set-saved' event to show a tap-to-start
// toast above the bar.

function fmt(s) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const PRESETS = [
  { label: '90s', seconds: 90 },
  { label: '2min', seconds: 120 },
  { label: '3min', seconds: 180 },
];

export default function RestTimer() {
  const [target, setTarget] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const intervalRef = useRef(null);
  const dismissTimeoutRef = useRef(null);

  // Drive the countdown.
  useEffect(() => {
    if (target == null) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(400); } catch {}
          }
          setTarget(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target]);

  // Auto-suggest toast on every set save.
  useEffect(() => {
    const onSetSaved = () => {
      if (target != null) return; // already running
      setShowToast(true);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = setTimeout(() => setShowToast(false), 6000);
    };
    window.addEventListener('mp-trainer-set-saved', onSetSaved);
    return () => window.removeEventListener('mp-trainer-set-saved', onSetSaved);
  }, [target]);

  const start = (seconds) => {
    setShowToast(false);
    setTarget(seconds);
    setSecondsLeft(seconds);
  };
  const cancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTarget(null);
    setSecondsLeft(0);
  };
  const startCustom = () => {
    const n = Number(customInput);
    if (Number.isFinite(n) && n > 0) {
      start(Math.round(n));
      setCustomInput('');
    }
  };

  const running = target != null;

  return (
    <>
      {showToast && !running && (
        <div className="tr-rest-toast">
          <span>Start 2min rest?</span>
          <button type="button" onClick={() => start(120)} className="tr-rest-toast-go">Start</button>
          <button type="button" onClick={() => setShowToast(false)} className="tr-rest-toast-x" aria-label="dismiss">×</button>
        </div>
      )}

      <div className={`tr-rest ${running ? 'running' : ''}`}>
        {running ? (
          <>
            <span className="tr-rest-label">Resting</span>
            <span className="tr-rest-clock">{fmt(secondsLeft)}</span>
            <button type="button" className="tr-rest-cancel" onClick={cancel}>Cancel</button>
          </>
        ) : (
          <>
            <span className="tr-rest-label">Rest</span>
            <div className="tr-rest-presets">
              {PRESETS.map(p => (
                <button key={p.label} type="button" className="tr-rest-preset" onClick={() => start(p.seconds)}>
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="number" inputMode="numeric" min="1" placeholder="sec"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startCustom(); }}
              className="tr-rest-input"
            />
            <button type="button" className="tr-rest-go" onClick={startCustom} disabled={!customInput}>Go</button>
          </>
        )}
      </div>
    </>
  );
}

export function notifySetSaved() {
  try { window.dispatchEvent(new CustomEvent('mp-trainer-set-saved')); } catch {}
}
