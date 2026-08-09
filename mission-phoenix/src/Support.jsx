// ---- Laptop fund ---------------------------------------------------------
// GOAL_USD is the full cost of the replacement laptop.
// RAISED_USD is the running total. Update this one number as donations come in
// and the counter, the bar and the "still needed" figure all follow.
const GOAL_USD = 1200;
const RAISED_USD = 30;

const usd = (n) => '$' + n.toLocaleString('en-US');

export default function Support() {
  const raised = Math.max(0, Math.min(RAISED_USD, GOAL_USD));
  const pct = Math.round((raised / GOAL_USD) * 100);
  const left = GOAL_USD - raised;

  return (
    <>
      <style>{`
        .sp-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .sp-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .sp-lead{font-size:17px;line-height:1.9;color:var(--ink-2);margin-bottom:24px;}
        .sp-h2{font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin:44px 0 16px;}

        .sp-goal{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:32px;margin:32px 0;}
        .sp-goal-lab{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--copper);margin-bottom:10px;}
        .sp-goal-title{font-size:clamp(20px,3vw,25px);font-weight:800;line-height:1.3;margin-bottom:22px;}
        .sp-nums{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:12px;}
        .sp-raised{font-size:clamp(28px,5vw,36px);font-weight:800;color:var(--copper);line-height:1;}
        .sp-of{font-size:15px;color:var(--ink-3);font-weight:600;}
        .sp-bar{height:12px;border-radius:999px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden;}
        .sp-bar-fill{height:100%;border-radius:999px;background:var(--copper);min-width:4px;transition:width .4s ease;}
        .sp-meta{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:14px;color:var(--ink-3);}
        .sp-meta b{color:var(--ink-2);font-weight:700;}

        .sp-donate{display:block;text-align:center;padding:40px 32px;background:var(--card);border:1px solid var(--line);border-radius:18px;margin:32px 0;transition:all .2s;}
        .sp-donate:hover{border-color:var(--copper);background:var(--copper-soft);}
        .sp-lab{font-size:15px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--copper);margin-bottom:10px;}
        .sp-url{font-size:15px;color:var(--ink-3);}
        .sp-note{font-size:15px;line-height:1.8;color:var(--ink-3);border-left:2px solid var(--copper);padding-left:18px;margin:28px 0;}
        .sp-thanks{font-size:16px;line-height:1.9;color:var(--ink-2);font-style:italic;}
      `}</style>
      <main className="page narrow">
        <h1 className="sp-title">Support Mission Phoenix</h1>
        <div className="sp-sep"></div>
        <p className="sp-lead">Mission Phoenix is a one-man operation built on passion, not profit. Every donation, no matter how small, helps keep this mission alive and growing.</p>
        <p className="sp-lead">Your support goes directly towards spreading awareness of the real cost of pornography, maintaining this platform, and building resources to help the next generation avoid the darkness of addiction.</p>

        <div className="sp-goal">
          <div className="sp-goal-lab">Current goal</div>
          <div className="sp-goal-title">A new laptop for Mission Phoenix</div>
          <div className="sp-nums">
            <span className="sp-raised">{usd(raised)}</span>
            <span className="sp-of">raised of {usd(GOAL_USD)}</span>
          </div>
          <div
            className="sp-bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Laptop fund: ${usd(raised)} raised of ${usd(GOAL_USD)}`}
          >
            <div className="sp-bar-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="sp-meta">
            <span><b>{pct}%</b> funded</span>
            <span><b>{usd(left)}</b> still needed</span>
          </div>
        </div>

        <h2 className="sp-h2">Why a laptop</h2>
        <p className="sp-lead">My laptop is the tool I do all of this work on. The screen is broken and the rest of the computer is in poor condition</p>
        <p className="sp-lead">Every contribution that comes in through Ko-fi goes into the laptop fund until the {usd(GOAL_USD)} is covered</p>

        <h2 className="sp-h2">Why support matters right now</h2>
        <p className="sp-lead">I am currently on <strong>skuldsanering</strong>, the Swedish debt relief programme, sometimes translated as debt sanitization. It runs for the next five years, until 2030, when all of my debts will finally be cleared.</p>
        <p className="sp-lead">For those five years I live on what Sweden calls <strong>existensminimum</strong>, the existential minimum. In practice that means two things: I cannot take a loan of any size, and I cannot save. The monthly budget is set so low that everything above the bare minimum goes to my creditors, so there is nothing left over at the end of the month to put aside. Buying a laptop myself, or saving up for one slowly, simply is not possible during this period.</p>
        <p className="sp-note">To be clear about where the money goes: donations made now are for the laptop and nothing else, until the goal is reached.</p>

        <a href="https://ko-fi.com/missionphoenix" target="_blank" rel="noopener noreferrer" className="sp-donate">
          <div className="sp-lab">Donate via Ko-Fi</div>
          <div className="sp-url">ko-fi.com/missionphoenix</div>
        </a>
        <p className="sp-thanks">Any amount is greatly appreciated and helpful. If Mission Phoenix has given you something, a video, a tool, an hour in group, or just the sense that someone else has walked this road, then helping with this keeps the work going. Thank you for being part of this mission.</p>
      </main>
    </>
  );
}
