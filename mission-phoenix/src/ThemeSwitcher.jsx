import { useEffect, useState } from 'react';

const THEMES = [
  { id: 'warm', label: 'Warm' },
  { id: 'oxblood', label: 'Oxblood' },
  { id: 'ember', label: 'Ember' },
  { id: 'slate', label: 'Slate' },
];

function readInitial() {
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('theme');
    if (q && THEMES.some(t => t.id === q)) return q;
    const saved = localStorage.getItem('mp-theme');
    if (saved && THEMES.some(t => t.id === saved)) return saved;
  } catch (e) {}
  return 'warm';
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('warm');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initial = readInitial();
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const apply = (id) => {
    setTheme(id);
    document.documentElement.setAttribute('data-theme', id);
    try { localStorage.setItem('mp-theme', id); } catch (e) {}
  };

  return (
    <>
      <style>{`
        .ts-fab{position:fixed;bottom:18px;right:18px;z-index:999;display:flex;align-items:center;gap:6px;padding:10px 14px;background:var(--mp-panel);color:var(--mp-fg);border:1px solid var(--mp-line-2);border-radius:999px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 24px -8px rgba(0,0,0,0.35);font-family:inherit;}
        .ts-fab:hover{border-color:var(--mp-accent);color:var(--mp-accent);}
        .ts-fab .dot{width:10px;height:10px;border-radius:50%;background:var(--mp-accent);}
        .ts-panel{position:fixed;bottom:64px;right:18px;z-index:999;background:var(--mp-panel);border:1px solid var(--mp-line-2);border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:6px;min-width:180px;box-shadow:0 16px 40px -12px rgba(0,0,0,0.45);}
        .ts-panel h6{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--mp-fg-3);padding:6px 10px 4px;}
        .ts-panel button{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:transparent;border:1px solid transparent;border-radius:10px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:var(--mp-fg);text-align:left;}
        .ts-panel button:hover{border-color:var(--mp-line-3);}
        .ts-panel button[aria-current="true"]{background:var(--mp-accent-soft);color:var(--mp-accent);border-color:var(--mp-accent);}
        .ts-panel button .swatch{width:18px;height:18px;border-radius:50%;border:1px solid var(--mp-line-3);}
      `}</style>
      {open && (
        <div className="ts-panel" role="menu">
          <h6>Theme preview</h6>
          {THEMES.map(t => (
            <button
              key={t.id}
              role="menuitemradio"
              aria-current={theme === t.id ? 'true' : 'false'}
              onClick={() => { apply(t.id); }}
            >
              <span>{t.label}</span>
              <span className="swatch" data-theme={t.id} style={swatchStyle(t.id)} />
            </button>
          ))}
        </div>
      )}
      <button className="ts-fab" onClick={() => setOpen(o => !o)} title="Switch theme (preview only)">
        <span className="dot" />
        <span>{theme}</span>
      </button>
    </>
  );
}

function swatchStyle(id) {
  const map = {
    warm: { background: 'linear-gradient(135deg,#f4ecdd 50%,#a34620 50%)' },
    oxblood: { background: 'linear-gradient(135deg,#170c0c 50%,#e0a653 50%)' },
    ember: { background: 'linear-gradient(135deg,#16110e 50%,#d4763e 50%)' },
    slate: { background: 'linear-gradient(135deg,#141921 50%,#e88b6d 50%)' },
  };
  return map[id] || {};
}
