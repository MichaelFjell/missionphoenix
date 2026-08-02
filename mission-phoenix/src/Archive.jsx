export default function Archive() {
  const newsletters = [
    {
      title: 'Changing your old beliefs that still form your self image',
      date: '24/07/2026',
      url: 'https://buttondown.com/missionphoenix/archive/changing-your-old-beliefs-that-still-form-your/',
    },
    {
      title: 'Faith',
      date: '17/07/2026',
      url: 'https://buttondown.com/missionphoenix/archive/faith/',
    },
    {
      title: 'Sobering up solo vs. community healing',
      date: '10/07/2026',
      url: 'https://buttondown.com/missionphoenix/archive/sobering-up-solo-vs-community-healing/',
    },
     {
      title: 'What porn addiction does to your self esteem, and how to rebuild it',
      date: '03/07/2026',
      url: 'https://buttondown.com/missionphoenix/archive/what-porn-addiction-does-to-your-self-esteem-and/',
     },
    {
      title: 'Whats going on in my life right now?',
      date: '26/06/2026',
      url: 'https://buttondown.com/missionphoenix/archive/whats-going-on-in-my-life-right-now/',
    },
    {
      title: 'We are only as sick as our secrets',
      date: '19/06/2026',
      url: 'https://buttondown.com/missionphoenix/archive/we-are-only-as-sick-as-our-secrets/',
    },
    {
      title: 'The myth of the “I’m only harming myself”-excuse',
      date: '12/06/2026',
      url: 'https://buttondown.com/missionphoenix/archive/the-myth-of-the-i-m-only-harming-myself-excuse/',
    },
    {
      title: 'What it feels like to be truly sober',
      date: '05/06/2026',
      url: 'https://buttondown.com/missionphoenix/archive/what-it-feels-like-to-be-truly-sober/',
    },
    {
      title: 'How group vulnerability heals you',
      date: '29/05/2026',
      url: 'https://buttondown.com/missionphoenix/archive/how-group-vulnerability-heals-you/',
    },
    {
      title: 'What you do when nobody is watching',
      date: '22/05/2026',
      url: 'https://buttondown.com/missionphoenix/archive/what-you-do-when-nobody-is-watching/',
    },
    {
      title: 'Finding your life purpose',
      date: '15/05/2026',
      url: 'https://buttondown.com/missionphoenix/archive/finding-your-life-purpose/',
    },
    {
      title: 'Gratitude',
      date: '08/05/2026',
      url: 'https://buttondown.com/missionphoenix/archive/gratitude/',
    },
    {
      title: 'The importance of your subconscious',
      date: '01/05/2026',
      url: 'https://buttondown.com/missionphoenix/archive/the-importance-of-your-subconscious/',
    },
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
        .arc-desc a{color:var(--copper);font-weight:600;}
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
        <p className="arc-desc">This is the archive of all the sent out newsletters, linked with dates. Click any entry to read it in full. The newsletter has been replaced by the <a href="https://www.youtube.com/@FenixMichael" target="_blank" rel="noopener noreferrer">Mission Phoenix YouTube channel</a>, so nothing new is added here, but everything below stays up.</p>
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
