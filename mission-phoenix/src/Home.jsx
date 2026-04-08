import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabase.js';

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success', 'error', 'loading'
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    // Save to Supabase
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          setMsg("You're already subscribed!");
          return;
        }
        console.error('Newsletter signup error:', error);
        setStatus('error');
        setMsg('Something went wrong. Try again.');
        return;
      }
    }

    // Send to Buttondown if API key is set
    const buttondownKey = import.meta.env.VITE_BUTTONDOWN_API_KEY;
    if (buttondownKey) {
      try {
        await fetch('https://api.buttondown.com/v1/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Token ${buttondownKey}` },
          body: JSON.stringify({ email_address: email.trim().toLowerCase() }),
        });
      } catch (err) {
        console.error('Buttondown error:', err);
      }
    }

    setStatus('success');
    setMsg('Check your email and confirm your subscription to start receiving the newsletter.');
    setEmail('');
  };

  return (
    <div style={ns.root}>
      <div style={ns.label}>GET WEEKLY RECOVERY INSIGHTS</div>
      <p style={ns.desc}>No spam. Just honest words about breaking free, delivered once a week.</p>
      <p style={ns.note}>While some quotes, statistics etc will be copied from other sources, the words in the newsletter are handwritten and worked on by Michael. No copy paste AI slop, ever.</p>
      {status === 'success' ? (
        <div style={ns.successMsg}>{msg}</div>
      ) : (
        <form onSubmit={handleSubmit} style={ns.form}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email"
            required
            style={ns.input}
          />
          <button type="submit" disabled={status === 'loading'} style={{ ...ns.btn, opacity: status === 'loading' ? 0.5 : 1 }}>
            {status === 'loading' ? '...' : 'SUBSCRIBE'}
          </button>
        </form>
      )}
      {status === 'error' && <div style={ns.errorMsg}>{msg}</div>}
    </div>
  );
}

const ns = {
  root: { textAlign: 'center', padding: '40px 0', borderTop: '1px solid #1a1a1a', marginBottom: '48px' },
  label: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '4px', color: '#c45a2a', marginBottom: '8px' },
  desc: { fontSize: '14px', color: '#555', marginBottom: '12px', lineHeight: 1.6 },
  note: { fontSize: '12px', color: '#444', marginBottom: '20px', lineHeight: 1.7, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' },
  form: { display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' },
  input: { flex: 1, fontFamily: "'EB Garamond', Georgia, serif", fontSize: '15px', padding: '12px 16px', background: 'rgba(15,15,15,0.8)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none' },
  btn: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '12px 20px', background: 'none', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer', whiteSpace: 'nowrap' },
  successMsg: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '2px', color: '#c45a2a', padding: '12px 0' },
  errorMsg: { fontSize: '13px', color: '#b82030', marginTop: '8px' },
};

export default function Home() {
  return (
    <div style={s.root}>
      <div style={s.noise} />
      <div style={s.container}>
        <div style={s.brandMark}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 4 L28 18 L42 18 L30 26 L34 40 L24 32 L14 40 L18 26 L6 18 L20 18 Z"
              fill="none" stroke="#c45a2a" strokeWidth="1.5" opacity="0.8" />
            <circle cx="24" cy="24" r="6" fill="#c45a2a" opacity="0.3" />
            <circle cx="24" cy="24" r="2" fill="#c45a2a" />
          </svg>
        </div>

        <h1 style={s.title}>MISSION PHOENIX</h1>
        <div style={s.line} />
        <p style={s.subtitle}>
          A community and a life mission to spread awareness of the real cost of pornography. A beacon of light for those already in the darkness, and a commitment to helping steer the next generation away from it.
        </p>

        <div style={s.cards}>
          <Link to="/quiz" style={s.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; e.currentTarget.style.background = 'rgba(196,90,42,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = 'rgba(15,15,15,0.6)'; }}>
            <div style={s.cardIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="24" rx="2" stroke="#c45a2a" strokeWidth="1" opacity="0.6" />
                <path d="M10 16 L14 20 L22 12" stroke="#c45a2a" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <div style={s.cardLabel}>SELF-ASSESSMENT</div>
            <p style={s.cardDesc}>
              5 questions. Research-backed facts. No data stored. A wake-up call that takes 2 minutes.
            </p>
          </Link>

          <Link to="/tracker" style={s.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; e.currentTarget.style.background = 'rgba(196,90,42,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = 'rgba(15,15,15,0.6)'; }}>
            <div style={s.cardIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="20" width="4" height="8" fill="#c45a2a" opacity="0.3" />
                <rect x="10" y="14" width="4" height="14" fill="#c45a2a" opacity="0.5" />
                <rect x="16" y="8" width="4" height="20" fill="#c45a2a" opacity="0.7" />
                <rect x="22" y="4" width="4" height="24" fill="#c45a2a" opacity="0.9" />
              </svg>
            </div>
            <div style={s.cardLabel}>RECOVERY TRACKER</div>
            <p style={s.cardDesc}>
              Track your streak. Build daily habits. See your progress. Join others who are fighting the same battle.
            </p>
          </Link>
        </div>

        <div style={s.community}>
          <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer" style={s.discordBlock}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c45a2a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}>
            <svg width="28" height="22" viewBox="0 0 71 55" fill="none" style={{ marginBottom: '12px' }}>
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A26.5 26.5 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9a.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.4 45.6v-.1c1.4-15-2.3-28.4-9.8-40.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1zm23.3 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1z" fill="#999"/>
            </svg>
            <div style={s.discordLabel}>JOIN THE DISCORD COMMUNITY</div>
            <p style={s.discordSub}>Free. Private. Men recovering together.</p>
          </a>
        </div>

        <NewsletterSignup />

      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', position: 'relative' },
  noise: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.008) 2px,rgba(255,255,255,0.008) 4px)',
  },
  container: {
    maxWidth: '680px', margin: '0 auto', padding: '80px 24px 60px',
    position: 'relative', zIndex: 1,
  },
  brandMark: { marginBottom: '32px', opacity: 0.8 },
  title: {
    fontFamily: "'Oswald', 'Impact', sans-serif", fontSize: 'clamp(36px, 8vw, 56px)',
    fontWeight: 400, letterSpacing: '8px', color: '#e8e4dc', margin: '0 0 16px 0', lineHeight: 1.1,
  },
  line: { width: '60px', height: '1px', background: '#c45a2a', margin: '0 0 32px 0' },
  subtitle: {
    fontSize: '19px', lineHeight: 1.7, color: '#999', margin: '0 0 56px 0',
    maxWidth: '520px', fontStyle: 'italic',
  },
  cards: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px', marginBottom: '64px',
  },
  card: {
    padding: '36px 28px', background: 'rgba(15,15,15,0.6)', border: '1px solid #1a1a1a',
    textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease', cursor: 'pointer',
    display: 'block',
  },
  cardIcon: { marginBottom: '20px' },
  cardLabel: {
    fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '4px',
    color: '#c45a2a', marginBottom: '12px',
  },
  cardDesc: { fontSize: '15px', lineHeight: 1.7, color: '#777', margin: 0 },
  community: { textAlign: 'center', padding: '40px 0', borderTop: '1px solid #1a1a1a', marginBottom: '48px' },
  discordBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textDecoration: 'none', padding: '28px', border: '1px solid #2a2a2a',
    transition: 'border-color 0.3s', cursor: 'pointer',
  },
  discordLabel: {
    fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '4px',
    color: '#999',
  },
  discordSub: { fontSize: '13px', color: '#666', marginTop: '8px' },
};
