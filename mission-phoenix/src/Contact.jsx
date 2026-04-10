export default function Contact() {
  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>CONTACT</h1>
        <div style={s.line} />
        <p style={s.text}>
          For personal or business inquiries, reach out through either email below.
        </p>

        <div style={s.cards}>
          <a href="mailto:fjellmicha@proton.me" style={s.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}>
            <div style={s.cardLabel}>PROTONMAIL</div>
            <div style={s.cardEmail}>fjellmicha@proton.me</div>
          </a>

          <a href="mailto:fjellmichaa@gmail.com" style={s.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}>
            <div style={s.cardLabel}>GMAIL</div>
            <div style={s.cardEmail}>fjellmichaa@gmail.com</div>
          </a>
        </div>

      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh' },
  container: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px 80px' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '6px', color: '#e8e4dc', fontWeight: 400, margin: '0 0 16px 0' },
  line: { width: '60px', height: '1px', background: '#c45a2a', marginBottom: '48px' },
  text: { fontSize: '16px', lineHeight: 1.9, color: '#999', marginBottom: '32px' },

  cards: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    padding: '24px', border: '1px solid #2a2a2a', textDecoration: 'none',
    transition: 'border-color 0.3s', cursor: 'pointer', display: 'block',
  },
  cardLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '4px', color: '#666', marginBottom: '8px' },
  cardEmail: { fontFamily: "'Oswald', sans-serif", fontSize: '16px', letterSpacing: '2px', color: '#c45a2a' },
};
