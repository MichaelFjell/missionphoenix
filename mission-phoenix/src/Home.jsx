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

  if (status === 'success') {
    return (
      <div style={{ padding: '14px', background: 'var(--copper-soft)', borderRadius: '10px', color: 'var(--copper)', fontWeight: 600, fontSize: '14px' }}>
        ✓ {msg}
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="nl-form">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button className="btn primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && <div style={{ fontSize: '12px', color: '#b82030', marginTop: '8px' }}>{msg}</div>}
    </>
  );
}

export default function Home() {
  return (
    <>
      <style>{`
        main.home-page{max-width:1160px;margin:0 auto;padding:36px 32px 56px;}
        .home-hero{display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center;padding:12px 0 44px;}
        .home-hero h1{font-size:clamp(40px,5vw,64px);font-weight:800;line-height:1.03;letter-spacing:-0.025em;margin-bottom:22px;}
        .home-hero h1 em{font-style:normal;color:var(--copper);}
        .home-hero .tagline{font-size:17px;line-height:1.6;color:var(--ink-2);max-width:540px;margin-bottom:26px;}
        .home-hero .cta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
        .hero-side{display:flex;flex-direction:column;gap:16px;}
        .side-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:28px;position:relative;overflow:hidden;}
        .side-card.nl::before{content:"";position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,var(--copper-soft),transparent 70%);}
        .side-card .sec-title{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin-bottom:14px;display:flex;align-items:center;gap:10px;position:relative;}
        .side-card h2{font-size:22px;font-weight:800;letter-spacing:-0.015em;line-height:1.2;margin-bottom:8px;position:relative;}
        .side-card p.sm{font-size:13.5px;line-height:1.55;color:var(--ink-2);margin-bottom:16px;position:relative;}
        .nl-form{display:flex;gap:8px;position:relative;}
        .nl-form input{flex:1;padding:12px 14px;border-radius:10px;border:1px solid var(--line-2);background:var(--bg);font-family:inherit;font-size:14px;color:var(--ink);outline:none;}
        .nl-form input:focus{border-color:var(--copper);background:var(--card);}
        .side-card .note{font-size:11.5px;color:var(--ink-3);margin-top:10px;position:relative;}
        .side-card .note a{color:var(--copper);font-weight:600;}
        .discord-row{display:flex;align-items:center;gap:14px;}
        .discord-row svg{flex-shrink:0;color:#5865F2;}
        .discord-row .dtxt{flex:1;}
        .discord-row .dtxt .t{font-size:14.5px;font-weight:700;letter-spacing:-0.01em;}
        .discord-row .dtxt .s{font-size:12.5px;color:var(--ink-3);margin-top:2px;}
        .discord-row .go{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--copper);text-transform:uppercase;}
        .home-features{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:8px;}
        .tile{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px 24px 22px;transition:all .25s;display:block;}
        .tile:hover{border-color:var(--copper);transform:translateY(-3px);box-shadow:0 12px 32px -18px rgba(163,70,32,0.35);}
        .tile .ico{width:42px;height:42px;border-radius:12px;background:var(--copper-soft);display:flex;align-items:center;justify-content:center;color:var(--copper);margin-bottom:16px;}
        .tile .ico svg{width:22px;height:22px;}
        .tile h3{font-size:17px;font-weight:700;letter-spacing:-0.01em;margin-bottom:6px;}
        .tile p{font-size:13.5px;line-height:1.55;color:var(--ink-2);margin-bottom:14px;}
        .tile .foot{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--line);font-size:12px;}
        .tile .foot .m{color:var(--ink-3);font-weight:500;}
        .tile .foot .arr{color:var(--copper);font-weight:700;}
        .home-tool{margin-top:28px;padding:20px 24px;background:var(--card);border:1px solid var(--line);border-radius:16px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
        .home-tool:hover{border-color:var(--copper);}
        .home-tool .ci{width:40px;height:40px;border-radius:10px;background:var(--ink);color:var(--card);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .home-tool .tx{flex:1;min-width:260px;}
        .home-tool .tx .t{font-size:14px;font-weight:700;letter-spacing:0.5px;color:var(--ink);}
        .home-tool .tx .rec{font-size:10.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--copper);margin-bottom:2px;}
        .home-tool .tx p{font-size:13px;line-height:1.5;color:var(--ink-2);margin-top:4px;}
        .home-tool .arr{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--copper);text-transform:uppercase;}
        @media (max-width:920px){
          .home-hero{grid-template-columns:1fr;gap:28px;padding-bottom:32px;}
          .home-features{grid-template-columns:1fr;}
        }
      `}</style>
      <main className="page home-page">
        <section className="home-hero">
          <div>
            <div className="eyebrow"><span className="d"></span>Recovery starts where honesty starts</div>
            <h1>You don't have to do this <em>alone</em>.</h1>
            <p className="tagline">A community and life mission to spread awareness of the real cost of pornography. A beacon of light for those already in the darkness, and a commitment to helping steer the next generation away from it.</p>
            <div className="cta">
              <Link to="/quiz" className="btn primary">Take the assessment →</Link>
              <Link to="/about" className="btn ghost">Read Michael's story</Link>
            </div>
          </div>

          <aside className="hero-side">
            <div className="side-card nl">
              <div className="sec-title">Weekly dispatch</div>
              <h2>Honest words about breaking free.</h2>
              <p className="sm">Hand-written by Michael, once a week. No AI-slop. No drip campaigns. Unsubscribe any time.</p>
              <NewsletterSignup />
              <div className="note">One email per week. <Link to="/archive">Read past issues →</Link></div>
            </div>

            <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer" className="side-card discord-row">
              <svg width="28" height="22" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A26.5 26.5 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9a.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.4 45.6v-.1c1.4-15-2.3-28.4-9.8-40.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1zm23.3 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1z" /></svg>
              <div className="dtxt">
                <div className="t">Join the Discord community</div>
                <div className="s">Free. Private. Men recovering together.</div>
              </div>
              <div className="go">Open →</div>
            </a>
          </aside>
        </section>

        <div className="sec-title" style={{ marginBottom: '14px' }}>What's here</div>

        <section className="home-features">
          <Link to="/quiz" className="tile">
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/></svg></div>
            <h3>Self-Assessment</h3>
            <p>5 questions. Research-backed facts. No data stored. A wake-up call that takes 2 minutes.</p>
            <div className="foot"><span className="m">2 minutes · anonymous</span><span className="arr">→</span></div>
          </Link>
          <Link to="/tracker" className="tile">
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 20h16M6 20V13M11 20V9M16 20V15M20 20V6"/></svg></div>
            <h3>Recovery Tracker</h3>
            <p>Track your streak. Build daily habits. See your progress. Join others fighting the same battle.</p>
            <div className="foot"><span className="m">Private · daily</span><span className="arr">→</span></div>
          </Link>
          <Link to="/community" className="tile">
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M14 19c0-2 2-3.5 4-3.5s4 1.5 4 3.5"/></svg></div>
            <h3>Community</h3>
            <p>Private Discord. Men recovering together. No performance, no preaching — just the daily work.</p>
            <div className="foot"><span className="m">Anonymous</span><span className="arr">→</span></div>
          </Link>
        </section>

        <a href="https://getcoldturkey.com/" target="_blank" rel="noopener noreferrer" className="home-tool">
          <div className="ci">❄</div>
          <div className="tx">
            <div className="rec">Recommended tool</div>
            <div className="t">Cold Turkey Blocker</div>
            <p>Block porn sites and social media. Set a random password you never write down so you can't disable it in a moment of weakness. The free version is enough.</p>
          </div>
          <div className="arr">Visit →</div>
        </a>
      </main>
    </>
  );
}
