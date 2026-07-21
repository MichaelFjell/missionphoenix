export default function HonestyInventory() {
  return (
    <>
      <style>{`
        .hi-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .hi-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .hi-body p{font-size:16px;line-height:1.85;color:var(--ink-2);margin-bottom:20px;}
        .hi-h2{font-size:clamp(19px,2.6vw,23px);font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin:44px 0 6px;}
        .hi-h2 small{display:block;font-size:12.5px;letter-spacing:3px;color:var(--copper);margin-bottom:6px;}
        .hi-personal{margin:32px 0;padding:22px 26px;background:var(--copper-soft);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;}
        .hi-personal p{font-size:16px;line-height:1.85;color:var(--ink-2);margin:0;}
        .hi-facts{list-style:none;padding:0;margin:32px 0;display:grid;gap:10px;}
        .hi-facts li{padding:14px 18px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:15px;line-height:1.6;color:var(--ink-2);}
        .hi-facts li strong{color:var(--copper);font-weight:700;}
        .hi-loop{list-style:none;padding:0;margin:26px 0;display:grid;gap:8px;counter-reset:loop;}
        .hi-loop li{padding:13px 17px 13px 52px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:15px;line-height:1.65;color:var(--ink-2);position:relative;counter-increment:loop;}
        .hi-loop li::before{content:counter(loop);position:absolute;left:16px;top:12px;width:24px;height:24px;border-radius:50%;background:var(--copper-soft);border:1px solid var(--copper);color:var(--copper);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;}
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
            The Honesty Inventory is a free, private tool for recovery. It has
            grown into two rooms inside one app. The first room measures the gap
            between what you tell yourself and what you actually do, and helps
            you close it, one small kept promise a day. The second room, called
            Bevisbanken (the Proof Bank), takes the next step: it replaces the
            old beliefs your addiction wrote about you with new decisions, and
            then backs those decisions with collected evidence until they become
            who you are.
          </p>
          <p>
            Both rooms exist because addiction does two kinds of damage that
            outlast the substance. It breaks your trust in your own word: every
            &ldquo;tomorrow I&apos;ll stop&rdquo; that didn&apos;t hold taught
            you that your promises mean nothing. And it writes a story about
            who you are: &ldquo;I always ruin things,&rdquo; &ldquo;I
            can&apos;t be trusted,&rdquo; &ldquo;people leave when they see the
            real me.&rdquo; Getting sober stops the drinking or the using. It
            does not, by itself, rewrite the story. That takes deliberate work,
            and this app is built to do exactly that work.
          </p>
        </div>

        <h2 className="hi-h2"><small>Room one</small>The inventory and the promise log</h2>
        <div className="hi-body">
          <p>
            Grounded in Nathaniel Branden&apos;s work on the six pillars of
            self-esteem, the inventory asks twenty concrete, everyday questions
            across two scales: self-trust and self-respect. You get one of four
            profiles, a map of where the damage is greatest and where your
            strength still is. A map, not a verdict.
          </p>
          <p>
            Then the daily practice: one small promise a day, five to fifteen
            minutes, kept or not kept, no gray zone. Every kept promise is a
            deposit in an account that never resets. Watching that account grow
            is watching self-trust come back. There is also a lie log, because a
            lie weighs the most when it is carried alone: register it, repair it
            by telling someone, or consciously release it.
          </p>
        </div>

        <h2 className="hi-h2"><small>Room two</small>Bevisbanken: the Proof Bank</h2>
        <div className="hi-body">
          <p>
            This room is built on David Bayer&apos;s work on limiting beliefs,
            adapted for recovery. The method is simple to describe and powerful
            to live: you write down the old belief word for word, exactly as it
            sounds in your head. You write the new decision that replaces it,
            in the present tense, as something already true. And then you do
            what no affirmation ever does: you collect proof.
          </p>
          <p>
            Proof means concrete events with dates. A compliment someone gave
            you. Something you finished. A promise you kept. The app is built
            around a daily rhythm that keeps the evidence flowing:
          </p>
        </div>

        <ul className="hi-loop">
          <li>
            <strong>Morning ritual.</strong> Read each new decision, see the
            latest proofs that support it, take three slow breaths and feel it
            as true. Then give yourself one to three small promises for the day.
          </li>
          <li>
            <strong>Quick catch.</strong> When an old belief fires during the
            day, two taps log the catch and show you the new decision for five
            seconds. Each catch is a rep: notice, replace, move on.
          </li>
          <li>
            <strong>Evening check.</strong> Two minutes. How did the promises
            go? Kept, partly, or not kept, in neutral language, because a broken
            promise is information, not a verdict. Then one question: what
            happened today that confirms one of your decisions?
          </li>
          <li>
            <strong>The loop closes.</strong> A kept promise automatically
            becomes a proof in the self-trust category. Your discipline
            literally turns into evidence, and the evidence feeds the next
            morning&apos;s reading.
          </li>
        </ul>

        <div className="hi-body">
          <p>
            Over weeks, the weekly review shows the old beliefs firing less and
            less often, and when a new decision has become obviously true, you
            mark it as integrated and it moves to a quiet archive with its full
            proof history. That is the goal of the whole system: not motivation,
            not streaks for their own sake, but a new self-image built the only
            way one can honestly be built, out of true things that actually
            happened. Sober living generates the events. The app makes sure you
            see them, keep them, and read them back to yourself until the new
            story is simply the story.
          </p>
        </div>

        <div className="hi-personal">
          <p>
            I built this because I needed it, and I use it every day: the
            morning ritual with coffee, a catch or two when an old thought
            grabs hold, two honest minutes at night. Rebuilding trust in my own
            word was the first work of my recovery. Rebuilding the picture of
            who I am is the work that came after, and this is the tool I do
            both with.
          </p>
        </div>

        <ul className="hi-facts">
          <li><strong>Completely free.</strong> No account, no login, no ads, and it always will be.</li>
          <li><strong>Fully private.</strong> Everything you write stays on your device. Nothing is sent to any server.</li>
          <li><strong>Two tools in one.</strong> Switch between the inventory and the Proof Bank at the top of the app. Each keeps its own rhythm.</li>
          <li><strong>Works like an app.</strong> Installs on your home screen and works offline.</li>
          <li><strong>Yours to keep.</strong> One backup file covers both rooms, and the Proof Bank can print your collected evidence as a proof book.</li>
          <li><strong>Two languages.</strong> Available in English and Swedish.</li>
        </ul>

        <a className="hi-cta" href="/inventory-demo.html?lang=en">
          <div className="hi-cta-lab">See how it works</div>
          <div className="hi-cta-sub">Step-by-step guide to both rooms, screenshots and installation instructions</div>
        </a>
        <p className="hi-alt">
          Already know it? <a href="/inventory/">Open the app directly &rarr;</a>
        </p>

        <p className="hi-attr">
          The inventory and promise log are inspired by Nathaniel
          Branden&apos;s work on the six pillars of self-esteem. Bevisbanken is
          inspired by David Bayer&apos;s work on identifying and replacing
          limiting beliefs. The Honesty Inventory is a self-reflection tool,
          not a psychological test or a substitute for treatment.
        </p>
      </main>
    </>
  );
}
