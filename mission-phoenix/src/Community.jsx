export default function Community() {
  return (
    <>
      <style>{`
        .cm-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;}
        .cm-sub{font-size:15px;color:var(--ink-3);margin-bottom:40px;line-height:1.7;}
        .cm-discord{display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px;border:1px solid var(--line);border-radius:14px;background:var(--card);}
        .cm-discord-icon{font-size:48px;margin-bottom:20px;}
        .cm-discord-heading{font-size:16px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--ink);margin-bottom:12px;}
        .cm-discord-text{font-size:15px;color:var(--ink-3);line-height:1.7;max-width:420px;margin-bottom:28px;}
        .cm-discord-btn{display:inline-block;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--copper);border:1px solid var(--copper);border-radius:999px;padding:12px 28px;text-decoration:none;transition:all .15s;}
        .cm-discord-btn:hover{background:var(--copper);color:#fff;}
      `}</style>
      <main className="page narrow">
        <h1 className="cm-title">Community</h1>
        <p className="cm-sub">People in recovery. No ranking. No competition. Just proof that you're not alone.</p>

        <div className="cm-discord">
          <div className="cm-discord-icon">🔥</div>
          <div className="cm-discord-heading">Join the fight</div>
          <p className="cm-discord-text">
            The Mission Phoenix community lives on Discord — real conversations, accountability, and support from people who get it.
          </p>
          
            href="https://discord.com/invite/tXnBUSbq92"
            target="_blank"
            rel="noopener noreferrer"
            className="cm-discord-btn"
          >
            Join on Discord →
          </a>
        </div>
      </main>
    </>
  );
}
