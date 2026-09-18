import { newsletters, newsletterCount } from './newsletters.js';

export default function Archive() {
  return (
    <>
      <style>{`
        .arc-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .arc-sep{width:60px;height:2px;background:var(--copper);margin-bottom:24px;border-radius:2px;}
        .arc-desc{font-size:16px;line-height:1.7;color:var(--ink-2);margin-bottom:40px;max-width:600px;}
        .arc-desc a{color:var(--copper);font-weight:600;}
        .arc-count{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:700;letter-spacing:0.5px;color:var(--copper);background:var(--copper-soft);padding:7px 16px;border-radius:999px;margin-bottom:24px;}
        .arc-notice{margin-bottom:28px;padding:22px 26px;background:var(--copper-soft);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;max-width:640px;}
        .arc-notice .lab{font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--copper);margin-bottom:8px;}
        .arc-notice p{font-size:15.5px;line-height:1.75;color:var(--ink-2);margin:0;}
        .arc-notice p + p{margin-top:12px;}
        .arc-notice a{color:var(--copper);font-weight:600;}
        .arc-list{display:flex;flex-direction:column;gap:12px;}
        .arc-entry{display:flex;align-items:center;gap:24px;padding:22px 26px;background:var(--card);border:1px solid var(--line);border-radius:14px;transition:all .2s;}
        .arc-entry:hover{border-color:var(--copper);background:var(--copper-soft);}
        .arc-date{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--copper);white-space:nowrap;min-width:100px;}
        .arc-etitle{font-size:16px;line-height:1.5;font-weight:600;color:var(--ink);flex:1;}
        .arc-arrow{color:var(--copper);font-weight:700;font-size:18px;}
      `}</style>
      <main className="page narrow">
        <h1 className="arc-title">Newsletter Archive</h1>
        <div className="arc-sep"></div>
        <div className="arc-count">{newsletterCount} letters · free to read · no signup</div>
        <div className="arc-notice">
          <div className="lab">The newsletter has ended</div>
          <p>New newsletters are no longer being written. They have been replaced by weekly videos on the <a href="https://www.youtube.com/@FenixMichael" target="_blank" rel="noopener noreferrer">Mission Phoenix YouTube channel</a>, where the same reflections, ideas and tips now go out in video form instead.</p>
          <p>Every letter that was sent is still here, and stays here for anyone who wants to read them.</p>
        </div>
        <p className="arc-desc">The full archive of every newsletter that went out, with dates. Click any entry to read it in full.</p>
        <div className="arc-list">
          {newsletters.map((n, i) => (
            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="arc-entry">
              <div className="arc-date">{n.date}</div>
              <div className="arc-etitle">{n.title}</div>
              <div className="arc-arrow">↗</div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
