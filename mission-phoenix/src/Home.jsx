import { useState } from 'react';
import { Link } from 'react-router-dom';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@FenixMichael';
const INTRO_VIDEO_ID = '6tSsU98H4hE';
const INTRO_VIDEO_TITLE = 'Introduction to Mission Phoenix';

// Click-to-play: nothing loads from YouTube until the visitor asks for it.
function IntroVideo() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="vid-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}?autoplay=1&rel=0`}
          title={INTRO_VIDEO_TITLE}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="vid-frame">
      <button type="button" className="vid-play" onClick={() => setPlaying(true)} aria-label={`Play: ${INTRO_VIDEO_TITLE}`}>
        <img src="/intro-thumb.jpg" alt="" width="800" height="450" />
        <span className="pb">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>
      </button>
    </div>
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
        .side-card.vid::before{content:"";position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,var(--copper-soft),transparent 70%);}
        .side-card .sec-title{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin-bottom:14px;display:flex;align-items:center;gap:10px;position:relative;}
        .side-card .sec-title::before{display:none;}
        main.home-page > .sec-title::before{display:none;}
        .side-card h2{font-size:22px;font-weight:800;letter-spacing:-0.015em;line-height:1.2;margin-bottom:8px;position:relative;}
        .side-card p.sm{font-size:13.5px;line-height:1.55;color:var(--ink-2);margin-bottom:16px;position:relative;}
        .vid-frame{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;border:1px solid var(--line);}
        .vid-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}
        .vid-play{display:block;width:100%;height:100%;padding:0;border:0;background:none;cursor:pointer;}
        .vid-play img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s;}
        /* Bottom-right, so the play button never covers the thumbnail headline. */
        .vid-play .pb{position:absolute;right:12px;bottom:12px;width:52px;height:52px;border-radius:50%;background:var(--copper);color:var(--on-accent);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px -8px rgba(0,0,0,0.7);transition:transform .25s,background .25s;}
        .vid-play .pb svg{width:26px;height:26px;margin-left:3px;}
        .vid-play:hover img{transform:scale(1.03);}
        .vid-play:hover .pb{transform:scale(1.09);background:var(--copper-2);}
        .vid-play:focus-visible{outline:2px solid var(--copper);outline-offset:3px;}
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
              <Link to="/quiz" className="btn primary">Am I at risk? →</Link>
              <Link to="/about" className="btn ghost">Read Michael's story</Link>
            </div>
          </div>

          <aside className="hero-side">
            <div className="side-card vid">
              <div className="sec-title">Start here</div>
              <h2>Who I am, and why this exists.</h2>
              <p className="sm">A short introduction to me and to Mission Phoenix, in my own words.</p>
              <IntroVideo />
              <div className="note">
                <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer">Mission Phoenix on YouTube →</a>
              </div>
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
          <Link to="/proof-bank" className="tile">
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h11a1 1 0 011 1v16H7a1 1 0 01-1-1z"/><path d="M6 17h12"/><path d="M9.5 9.3l1.9 1.9L15 7.6"/></svg></div>
            <h3>The Proof Bank</h3>
            <p>Rewrite the beliefs your addiction wrote about you, and collect real proof that the new ones are true.</p>
            <div className="foot"><span className="m">Free · private</span><span className="arr">→</span></div>
          </Link>
          <Link to="https://discord.com/invite/tXnBUSbq92" className="tile">
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
