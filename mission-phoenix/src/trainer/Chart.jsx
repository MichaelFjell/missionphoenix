import { useState } from 'react';

// Hand-rolled SVG line chart for per-exercise progression.
// points: [{ date: ISO, top_load, top_reps, est_1rm }]
// Renders top-set load (solid copper) and est-1RM (dashed copper).

const PAD = { top: 18, right: 14, bottom: 28, left: 38 };

export default function Chart({ points, width = 520, height = 240 }) {
  const [hover, setHover] = useState(null);

  if (!points || points.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-3)', fontSize: 13, border: '1px dashed var(--line)',
        borderRadius: 12, background: 'var(--card)',
      }}>
        Log a session to see progression.
      </div>
    );
  }

  const xs = points.map((_, i) => i);
  const ys = points.flatMap(p => [p.top_load || 0, p.est_1rm || 0]);
  const yMin = Math.max(0, Math.floor(Math.min(...ys) * 0.85));
  const yMax = Math.ceil(Math.max(...ys, yMin + 1) * 1.05);

  const w = width - PAD.left - PAD.right;
  const h = height - PAD.top - PAD.bottom;
  const xFor = (i) => PAD.left + (xs.length === 1 ? w / 2 : (i / (xs.length - 1)) * w);
  const yFor = (v) => PAD.top + h - ((v - yMin) / (yMax - yMin)) * h;

  const linePath = (key) => points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p[key] || 0).toFixed(1)}`
  ).join(' ');

  // Y-axis ticks (4)
  const ticks = [0, 1, 2, 3].map(t => yMin + ((yMax - yMin) * t) / 3);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: width }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ display: 'block', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12 }}
      >
        {/* Y grid + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left} x2={width - PAD.right}
              y1={yFor(t)} y2={yFor(t)}
              stroke="var(--line)" strokeDasharray="2 4"
            />
            <text
              x={PAD.left - 6} y={yFor(t) + 4}
              fontSize="10" textAnchor="end" fill="var(--ink-3)"
              fontFamily="Manrope, sans-serif"
            >{Math.round(t)}</text>
          </g>
        ))}

        {/* Est-1RM line (dashed) */}
        <path d={linePath('est_1rm')} fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.55" />
        {/* Top-set load line (solid) */}
        <path d={linePath('top_load')} fill="none" stroke="var(--copper)" strokeWidth="2" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={xFor(i)} cy={yFor(p.top_load || 0)}
              r={hover === i ? 5 : 3.5}
              fill="var(--copper)" stroke="var(--card)" strokeWidth="2"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
              style={{ cursor: 'pointer' }}
            />
            {/* Invisible hit area for easier touch */}
            <rect
              x={xFor(i) - 14} y={PAD.top}
              width={28} height={h}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}

        {/* Hover tooltip */}
        {hover !== null && points[hover] && (
          (() => {
            const p = points[hover];
            const cx = xFor(hover);
            const cy = yFor(p.top_load || 0);
            const tipW = 130, tipH = 56;
            const tipX = Math.min(width - PAD.right - tipW, Math.max(PAD.left, cx - tipW / 2));
            const tipY = Math.max(PAD.top, cy - tipH - 10);
            const d = new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            return (
              <g pointerEvents="none">
                <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={8}
                  fill="var(--bg-2)" stroke="var(--line-2)" />
                <text x={tipX + 10} y={tipY + 16} fontSize="11" fill="var(--ink-3)" fontFamily="Manrope, sans-serif">{d}</text>
                <text x={tipX + 10} y={tipY + 32} fontSize="12" fill="var(--ink)" fontFamily="Manrope, sans-serif" fontWeight="700">
                  {p.top_load ? `${p.top_load}kg × ${p.top_reps}` : '—'}
                </text>
                <text x={tipX + 10} y={tipY + 48} fontSize="10" fill="var(--copper)" fontFamily="Manrope, sans-serif">
                  est 1RM ≈ {Math.round(p.est_1rm)}kg
                </text>
              </g>
            );
          })()
        )}

        {/* Legend */}
        <g transform={`translate(${PAD.left}, ${height - 6})`}>
          <line x1="0" y1="-2" x2="14" y2="-2" stroke="var(--copper)" strokeWidth="2" />
          <text x="20" y="2" fontSize="10" fill="var(--ink-3)" fontFamily="Manrope, sans-serif">top set</text>
          <line x1="80" y1="-2" x2="94" y2="-2" stroke="var(--copper)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.55" />
          <text x="100" y="2" fontSize="10" fill="var(--ink-3)" fontFamily="Manrope, sans-serif">est 1RM</text>
        </g>
      </svg>
    </div>
  );
}
