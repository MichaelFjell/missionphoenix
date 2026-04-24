export default function Support() {
  return (
    <>
      <style>{`
        .sp-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .sp-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .sp-lead{font-size:17px;line-height:1.9;color:var(--ink-2);margin-bottom:24px;}
        .sp-donate{display:block;text-align:center;padding:40px 32px;background:var(--card);border:1px solid var(--line);border-radius:18px;margin:32px 0;transition:all .2s;}
        .sp-donate:hover{border-color:var(--copper);background:var(--copper-soft);}
        .sp-lab{font-size:15px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--copper);margin-bottom:10px;}
        .sp-url{font-size:15px;color:var(--ink-3);}
        .sp-thanks{font-size:16px;line-height:1.9;color:var(--ink-2);font-style:italic;}
      `}</style>
      <main className="page narrow">
        <h1 className="sp-title">Support Mission Phoenix</h1>
        <div className="sp-sep"></div>
        <p className="sp-lead">Mission Phoenix is a one-man operation built on passion, not profit. Every donation, no matter how small, helps keep this mission alive and growing.</p>
        <p className="sp-lead">Your support goes directly towards spreading awareness of the real cost of pornography, maintaining this platform, and building resources to help the next generation avoid the darkness of addiction.</p>
        <a href="https://ko-fi.com/missionphoenix" target="_blank" rel="noopener noreferrer" className="sp-donate">
          <div className="sp-lab">Donate via Ko-Fi</div>
          <div className="sp-url">ko-fi.com/missionphoenix</div>
        </a>
        <p className="sp-thanks">Any amount is greatly appreciated and helpful. Thank you for being part of this mission.</p>
      </main>
    </>
  );
}
