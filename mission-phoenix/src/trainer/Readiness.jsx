import { useState } from 'react';

// Inline readiness check shown at the top of a session before logging.
// onSave({ sleep_quality, energy, mood, niggles, skipped:false, recorded_at })
// onSkip({ skipped: true, recorded_at }) — both close the card.

const SCALE = [1, 2, 3, 4, 5];

function Segmented({ label, value, onChange }) {
  return (
    <div className="rd-row">
      <div className="rd-label">{label}</div>
      <div className="rd-seg" role="radiogroup" aria-label={label}>
        {SCALE.map(n => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            className={`rd-pip ${value === n ? 'on' : ''}`}
            onClick={() => onChange(n)}
          >{n}</button>
        ))}
      </div>
    </div>
  );
}

export default function ReadinessCard({ onSave, onSkip }) {
  const [sleep, setSleep] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [niggles, setNiggles] = useState('');

  const save = () => onSave({
    sleep_quality: sleep, energy, mood,
    niggles: niggles.trim(),
    skipped: false,
    recorded_at: new Date().toISOString(),
  });

  const skip = () => onSkip({
    skipped: true,
    recorded_at: new Date().toISOString(),
  });

  return (
    <div className="tr-readiness">
      <div className="rd-head">
        <span className="rd-eyebrow">Readiness</span>
        <button type="button" className="rd-skip" onClick={skip}>Skip</button>
      </div>
      <Segmented label="Sleep"  value={sleep}  onChange={setSleep} />
      <Segmented label="Energy" value={energy} onChange={setEnergy} />
      <Segmented label="Mood"   value={mood}   onChange={setMood} />
      <label className="field" style={{ marginTop: 12 }}>Anything to note?</label>
      <input
        type="text" className="input"
        placeholder="Achilles tight, low back tweak, etc."
        value={niggles}
        onChange={e => setNiggles(e.target.value)}
      />
      <button type="button" className="btn primary sm rd-save" onClick={save}>
        Save &amp; start
      </button>
    </div>
  );
}

// Badge shown next to a logged workout on the dashboard.
export function ReadinessBadge({ readiness, onClick }) {
  if (!readiness || readiness.skipped) return null;
  const dotColor = (n) =>
    n >= 4 ? 'var(--mp-live)' :
    n <= 2 ? 'var(--copper)' :
    'var(--ink-3)';
  return (
    <button
      type="button"
      className="rd-badge"
      onClick={onClick}
      title={readiness.niggles ? `Note: ${readiness.niggles}` : 'No niggles noted'}
    >
      <span className="rd-dot" style={{ background: dotColor(readiness.sleep_quality) }} />
      <span className="rd-dot" style={{ background: dotColor(readiness.energy) }} />
      <span className="rd-dot" style={{ background: dotColor(readiness.mood) }} />
      {readiness.niggles && <span className="rd-flag">!</span>}
    </button>
  );
}
