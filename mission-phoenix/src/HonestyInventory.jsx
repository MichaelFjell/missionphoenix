export default function HonestyInventory() {
  return (
    <>
      <style>{`
        .hi-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .hi-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .hi-body p{font-size:16px;line-height:1.85;color:var(--ink-2);margin-bottom:20px;}
        .hi-personal{margin:32px 0;padding:22px 26px;background:var(--copper-soft);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;}
        .hi-personal p{font-size:16px;line-height:1.85;color:var(--ink-2);margin:0;}
        .hi-facts{list-style:none;padding:0;margin:32px 0;display:grid;gap:10px;}
        .hi-facts li{padding:14px 18px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:15px;line-height:1.6;color:var(--ink-2);}
        .hi-facts li strong{color:var(--copper);font-weight:700;}
        .hi-cta{display:block;text-align:center;padding:36px 32px;background:var(--card);border:1px solid var(--line);border-radius:18px;margin:36px 0 14px;transition:all .2s;}
        .hi-cta:hover{border-color:var(--copper);background:var(--copper-soft);}
        .hi-cta-lab{font-size:15px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--copper);margin-bottom:10px;}
        .hi-cta-sub{font-size:15px;color:var(--ink-3);}
        .hi-alt{text-align:center;font-size:15px;color:var(--ink-3);margin-bottom:8px;}
        .hi-alt a{color:var(--copper);font-weight:700;text-decoration:none;}
        .hi-alt a:hover{text-decoration:underline;}
        .hi-attr{margin-top:36px;font-size:13.5px;line-height:1.7;color:var(--ink-3);}
      `}</style>
      <main className="page narrow">
        <h1 className="hi-title">The Honesty Inventory</h1>
        <div className="hi-sep"></div>

        <div className="hi-body">
          <p>
            The Honesty Inventory is a free self-reflection tool for recovery. It
            measures the gap between what you tell yourself and what you actually
            do &mdash; and then helps you close it, one small kept promise a day.
          </p>
          <p>
            It&apos;s grounded in Nathaniel Branden&apos;s work on self-esteem.
            Addiction damages self-esteem through broken private promises: every
            &ldquo;tomorrow I&apos;ll stop&rdquo; that doesn&apos;t hold teaches
            you that your own word is worth nothing. The inventory makes that
            damage visible through twenty concrete, everyday questions across two
            scales &mdash; self-trust and self-respect. You get one of four
            profiles: a map of where the damage is greatest and where your
            strength still is. A map, not a verdict.
          </p>
          <p>
            Then comes the real work: the promise log. One small promise a day
            &mdash; five to fifteen minutes, kept or not kept, no gray zone. Every
            kept promise is a deposit in an account that never resets, and
            watching that account grow is watching self-trust come back.
          </p>
        </div>

        <div className="hi-personal">
          <p>
            I built this because I needed it, and I use it personally &mdash; one
            promise in the morning, one honest answer at night. Rebuilding trust
            in my own word has been some of the most important work of my
            recovery, and this is the tool I do it with.
          </p>
        </div>

        <ul className="hi-facts">
          <li><strong>Completely free.</strong> No account, no login, no ads &mdash; and it always will be.</li>
          <li><strong>Fully private.</strong> Everything stays on your device. Nothing is ever sent to a server.</li>
          <li><strong>Works like an app.</strong> Installs on your home screen and works offline.</li>
          <li><strong>Two languages.</strong> Available in English and Swedish.</li>
        </ul>

        <a className="hi-cta" href="/inventory-demo.html?lang=en">
          <div className="hi-cta-lab">See how it works</div>
          <div className="hi-cta-sub">Step-by-step guide, screenshots and installation instructions</div>
        </a>
        <p className="hi-alt">
          Already know it? <a href="/inventory/">Open the app directly &rarr;</a>
        </p>

        <p className="hi-attr">
          Inspired by Nathaniel Branden&apos;s work on the six pillars of
          self-esteem. The Honesty Inventory is a self-reflection tool, not a
          psychological test.
        </p>
      </main>
    </>
  );
}
