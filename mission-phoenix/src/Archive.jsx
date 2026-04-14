export default function Archive() {
  const newsletters = [
    {
      title: 'Welcome to the first newsletter of Mission Phoenix',
      date: '10/04/2026',
      url: 'https://buttondown.com/missionphoenix/archive/welcome-to-the-first-newsletter-of-mission-phoenix/',
    },
  ];

  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>NEWSLETTER ARCHIVE</h1>
        <div style={s.line} />
        <p style={s.desc}>
          This is the archive of all the sent out newsletters, linked with dates. Click any entry to read it in full.
        </p>

        <div style={s.list}>
          {newsletters.map((n, i) => (
            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={s.entry}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; e.currentTarget.style.background = 'rgba(196,90,42,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = 'transparent'; }}>
              <div style={s.entryDate}>{n.date}</div>
              <div style={s.entryTitle}>{n.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', position: 'relative' },
  container: { maxWidth: '680px', margin: '0 auto', padding: '80px 24px 60px' },
  title: {
    fontFamily: "'Oswald', 'Impact', sans-serif", fontSize: '24px',
    fontWeight: 400, letterSpacing: '6px', color: '#e8e4dc', margin: '0 0 16px 0',
  },
  line: { width: '60px', height: '1px', background: '#c45a2a', margin: '0 0 24px 0' },
  desc: { fontSize: '16px', lineHeight: 1.7, color: '#888', margin: '0 0 48px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  entry: {
    display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px',
    border: '1px solid #2a2a2a', textDecoration: 'none', cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  entryDate: {
    fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '2px',
    color: '#c45a2a', whiteSpace: 'nowrap', minWidth: '90px',
  },
  entryTitle: {
    fontSize: '16px', lineHeight: 1.5, color: '#d4d0c8',
  },
};
