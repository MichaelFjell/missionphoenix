import { daysBetween } from './portalUtils.js';

// Simple SVG line chart of urge intensity (0–10) over the program.
// points: [{ date: 'YYYY-MM-DD', urge: number, acted: bool }] sorted ascending.
export default function UrgeChart({ points }) {
  if (!points || points.length === 0) return null;
  const W = 600, H = 140, padL = 26, padR = 10, padT = 10, padB = 20;
  const first = points[0].date;
  const last = points[points.length - 1].date;
  const span = Math.max(1, daysBetween(first, last));
  const x = (date) => padL + (daysBetween(first, date) / span) * (W - padL - padR);
  const y = (urge) => padT + (1 - urge / 10) * (H - padT - padB);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date).toFixed(1)},${y(p.urge).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Urge intensity chart">
      {[0, 5, 10].map((v) => (
        <g key={v}>
          <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
          <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--ink-3)">{v}</text>
        </g>
      ))}
      {points.length > 1 && <path d={path} fill="none" stroke="var(--copper)" strokeWidth="2" />}
      {points.map((p) => (
        <circle key={p.date} cx={x(p.date)} cy={y(p.urge)} r="3.5"
          fill={p.acted ? '#d06552' : 'var(--copper)'} />
      ))}
    </svg>
  );
}
