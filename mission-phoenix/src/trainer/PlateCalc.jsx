import { useEffect, useState } from 'react';

const KEY_PREFS = 'mp.trainer.plates';
const DEFAULT_BAR_KG = 20;
const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

function readPrefs() {
  try {
    const raw = localStorage.getItem(KEY_PREFS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      bar_kg: Number.isFinite(parsed.bar_kg) ? parsed.bar_kg : DEFAULT_BAR_KG,
      plates: Array.isArray(parsed.plates) && parsed.plates.length ? parsed.plates : DEFAULT_PLATES,
    };
  } catch { return null; }
}
function writePrefs(prefs) {
  try { localStorage.setItem(KEY_PREFS, JSON.stringify(prefs)); } catch {}
}

export function computePlates(load_kg, bar_kg, plates) {
  if (!Number.isFinite(load_kg) || load_kg <= 0) return { perSide: [], unmatched: 0 };
  const each = (load_kg - bar_kg) / 2;
  if (each < 0) return { perSide: [], unmatched: 0, belowBar: true };
  if (each === 0) return { perSide: [], unmatched: 0 };
  const sorted = [...plates].filter(p => p > 0).sort((a, b) => b - a);
  const result = [];
  let remaining = each;
  for (const p of sorted) {
    while (remaining >= p - 0.0001) {
      result.push(p);
      remaining -= p;
    }
  }
  return { perSide: result, unmatched: +(remaining * 2).toFixed(2) };
}

export default function PlateCalc({ load_kg, onClose }) {
  const [prefs, setPrefs] = useState(() => readPrefs() || { bar_kg: DEFAULT_BAR_KG, plates: DEFAULT_PLATES });
  const [editing, setEditing] = useState(false);
  const [barInput, setBarInput] = useState(String(prefs.bar_kg));
  const [platesInput, setPlatesInput] = useState(prefs.plates.join(', '));

  useEffect(() => { writePrefs(prefs); }, [prefs]);

  const breakdown = computePlates(load_kg, prefs.bar_kg, prefs.plates);

  const savePrefs = () => {
    const bar = Number(barInput);
    const arr = platesInput.split(/[,\s]+/).map(s => Number(s)).filter(n => Number.isFinite(n) && n > 0);
    setPrefs({
      bar_kg: Number.isFinite(bar) && bar > 0 ? bar : DEFAULT_BAR_KG,
      plates: arr.length ? arr : DEFAULT_PLATES,
    });
    setEditing(false);
  };

  return (
    <div className="tr-plates">
      <div className="tr-plates-head">
        <span className="tr-plates-eyebrow">Plates · {load_kg || '–'}kg target</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="tr-plates-btn" onClick={() => setEditing(!editing)}>
            {editing ? 'Done' : 'Bar / plates'}
          </button>
          {onClose && (
            <button type="button" className="tr-plates-btn" onClick={onClose}>Close</button>
          )}
        </div>
      </div>

      {!editing && (
        <>
          {breakdown.belowBar ? (
            <div className="tr-plates-warn">Target {load_kg}kg is below the {prefs.bar_kg}kg bar.</div>
          ) : breakdown.perSide.length === 0 && load_kg ? (
            <div className="tr-plates-empty">Just the {prefs.bar_kg}kg bar.</div>
          ) : (
            <div className="tr-plates-stack" aria-label="plates per side">
              <span className="tr-plates-side">per side:</span>
              {breakdown.perSide.map((p, i) => (
                <span key={i} className={`tr-plate p-${String(p).replace('.', '_')}`}>
                  {p}
                </span>
              ))}
            </div>
          )}
          {breakdown.unmatched > 0 && (
            <div className="tr-plates-warn">Off by {breakdown.unmatched}kg with current plates.</div>
          )}
        </>
      )}

      {editing && (
        <div className="tr-plates-edit">
          <label className="field">Bar weight (kg)</label>
          <input type="number" inputMode="decimal" className="input"
            value={barInput} onChange={e => setBarInput(e.target.value)} />
          <label className="field" style={{ marginTop: 10 }}>Available plates (kg, comma-separated)</label>
          <input type="text" className="input"
            value={platesInput} onChange={e => setPlatesInput(e.target.value)} />
          <button type="button" className="btn primary sm" onClick={savePrefs} style={{ marginTop: 10 }}>
            Save
          </button>
        </div>
      )}
    </div>
  );
}
