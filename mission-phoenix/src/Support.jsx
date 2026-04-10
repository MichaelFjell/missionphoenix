export default function Support() {
  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>SUPPORT MISSION PHOENIX</h1>
        <div style={s.line} />

        <p style={s.text}>
          Mission Phoenix is a one-man operation built on passion, not profit. Every donation, no matter how small, helps keep this mission alive and growing.
        </p>

        <p style={s.text}>
          Your support goes directly towards spreading awareness of the real cost of pornography, maintaining this platform, and building resources to help the next generation avoid the darkness of addiction.
        </p>

        <a href="https://ko-fi.com/missionphoenix" target="_blank" rel="noopener noreferrer" style={s.donateBlock}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; e.currentTarget.style.background = 'rgba(196,90,42,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = 'transparent'; }}>
          <div style={s.donateLabel}>DONATE VIA KO-FI</div>
          <div style={s.donateUrl}>ko-fi.com/missionphoenix</div>
        </a>

        <p style={s.thanks}>
          Any amount is greatly appreciated and helpful. Thank you for being part of this mission.
        </p>

      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh' },
  container: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px 80px' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '6px', color: '#e8e4dc', fontWeight: 400, margin: '0 0 16px 0' },
  line: { width: '60px', height: '1px', background: '#c45a2a', marginBottom: '48px' },
  text: { fontSize: '16px', lineHeight: 1.9, color: '#999', marginBottom: '24px' },
  donateBlock: {
    display: 'block', textAlign: 'center', textDecoration: 'none',
    padding: '32px', border: '1px solid #2a2a2a', marginBottom: '32px',
    transition: 'all 0.3s', cursor: 'pointer',
  },
  donateLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '15px', letterSpacing: '4px', color: '#c45a2a', marginBottom: '8px' },
  donateUrl: { fontSize: '14px', color: '#666' },
  thanks: { fontSize: '15px', lineHeight: 1.9, color: '#777', fontStyle: 'italic' },
};
