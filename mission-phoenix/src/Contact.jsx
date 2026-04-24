export default function Contact() {
  return (
    <>
      <style>{`
        .ct-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .ct-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .ct-lead{font-size:17px;line-height:1.85;color:var(--ink-2);margin-bottom:36px;}
        .ct-cards{display:flex;flex-direction:column;gap:14px;}
        .ct-card{display:block;padding:26px 28px;background:var(--card);border:1px solid var(--line);border-radius:14px;transition:border-color .2s;}
        .ct-card:hover{border-color:var(--copper);}
        .ct-lab{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--ink-3);margin-bottom:8px;}
        .ct-addr{font-size:17px;font-weight:700;letter-spacing:1px;color:var(--copper);}
      `}</style>
      <main className="page narrow">
        <h1 className="ct-title">Contact</h1>
        <div className="ct-sep"></div>
        <p className="ct-lead">For personal or business inquiries, reach out through either email below.</p>
        <div className="ct-cards">
          <a href="mailto:fjellmicha@proton.me" className="ct-card">
            <div className="ct-lab">ProtonMail</div>
            <div className="ct-addr">fjellmicha@proton.me</div>
          </a>
          <a href="mailto:fjellmichaa@gmail.com" className="ct-card">
            <div className="ct-lab">Gmail</div>
            <div className="ct-addr">fjellmichaa@gmail.com</div>
          </a>
        </div>
      </main>
    </>
  );
}
