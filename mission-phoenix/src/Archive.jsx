export default function Archive() {
  const newsletters = [
    {
      title: 'The lying and cheating porn addict',
      date: '24/04/2026',
      url: 'https://buttondown.com/missionphoenix/archive/the-lying-and-cheating-porn-addict/',
    },
    {
      title: 'Porn is the killer of creative energy',
      date: '17/04/2026',
      url: 'https://buttondown.com/missionphoenix/archive/porn-is-the-killer-of-creative-energy/',
    },
    {
      title: 'Welcome to the first newsletter of Mission Phoenix',
      date: '10/04/2026',
      url: 'https://buttondown.com/missionphoenix/archive/welcome-to-the-first-newsletter-of-mission-phoenix/',
    },
  ];

  return (
    <>
      <style>{`
        .arc-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .arc-sep{width:60px;height:2px;background:var(--copper);margin-bottom:24px;border-radius:2px;}
        .arc-desc{font-size:16px;line-height:1.7;color:var(--ink-2);margin-bottom:40px;max-width:600px;}
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
        <p className="arc-desc">This is the archive of all the sent out newsletters, linked with dates. Click any entry to read it in full.</p>
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
