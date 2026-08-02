import { useEffect } from 'react';

/**
 * Ligger på is. Sidan finns kvar för gamla länkar och bokmärken, men den
 * länkas inte längre från menyn, foten eller sitemapen, och den ska inte
 * indexeras. The Proof Bank (src/ProofBank.jsx) är sidan som visas i stället.
 */
export default function HonestyInventory() {
  useEffect(() => {
    const meta = document.head.querySelector('meta[name="robots"]');
    if (!meta) return undefined;
    const previous = meta.content;
    meta.content = 'noindex, follow';
    return () => { meta.content = previous; };
  }, []);

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
        .hi-pick{display:grid;gap:14px;margin:30px 0 10px;}
        @media(min-width:720px){.hi-pick{grid-template-columns:1fr 1fr;}}
        .hi-pick-card{padding:22px 24px;background:var(--card);border:1px solid var(--line);border-radius:16px;}
        .hi-pick-card h3{font-size:15px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin:0 0 10px;}
        .hi-pick-card p{font-size:15px;line-height:1.7;color:var(--ink-2);margin:0 0 12px;}
        .hi-pick-card p:last-of-type{margin-bottom:0;}
        .hi-pick-card .hi-for{font-size:14px;color:var(--ink-3);}
        .hi-pick-card .hi-for strong{color:var(--ink-2);font-weight:700;}
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
            There are two free, private tools here, and they are two separate
            apps. The Honesty Inventory is about telling the truth and keeping
            your word to yourself. The Proof Bank is about changing the picture
            of who you are. They were one app for a while, and splitting them
            was the right call: they treat two different injuries, and each one
            works better when it is allowed to be simple.
          </p>
          <p>
            Both exist because addiction does two kinds of damage that outlast
            the substance. It breaks your trust in your own word: every
            &ldquo;tomorrow I&apos;ll stop&rdquo; that didn&apos;t hold taught
            you that your promises mean nothing. And it writes a story about who
            you are: &ldquo;I always ruin things,&rdquo; &ldquo;I can&apos;t be
            trusted,&rdquo; &ldquo;people leave when they see the real me.&rdquo;
            Getting sober stops the drinking or the using. It does not, by
            itself, rewrite the story. That takes deliberate work.
          </p>
        </div>

        <h2 className="hi-h2"><small>App one</small>The Honesty Inventory</h2>
        <div className="hi-body">
          <p>
            The smaller and simpler of the two. It is built on Nathaniel
            Branden&apos;s work on the six pillars of self-esteem, and it stays
            close to one question: is what you say the same as what you do?
          </p>
          <p>
            It starts with twenty concrete, everyday questions across two
            scales, self-trust and self-respect. You get one of four profiles: a
            map of where the damage is greatest and where your strength still
            is. A map, not a verdict.
          </p>
          <p>
            Then the daily practice, and this is the heart of it. One small
            promise to yourself each morning. Five to fifteen minutes. In the
            evening you answer whether you kept it, kept or not kept, no gray
            zone. Every kept promise is a deposit in an account that never
            resets, and watching that account grow is watching self-trust come
            back. Alongside it there is a lie log, because a lie weighs the most
            when it is carried alone: register it, repair it by telling someone,
            or consciously release it. Truth telling and one kept promise a day.
            That is the whole app, and it is deliberately not more than that.
          </p>
        </div>

        <h2 className="hi-h2"><small>App two</small>The Proof Bank</h2>
        <div className="hi-body">
          <p>
            The deeper and more demanding of the two, built on David Bayer&apos;s
            work on limiting beliefs and adapted for recovery. This one is not
            about behaviour. It is about the self-image underneath the
            behaviour, and about letting go of old beliefs in favour of far
            better ones.
          </p>
          <p>
            You write the old belief word for word, exactly as it sounds in your
            head. You write the new decision that replaces it, in the present
            tense, as something already true. And then you do what no
            affirmation ever does: you collect proof. This is the part that
            matters. Telling yourself something you do not believe creates
            cognitive dissonance, and your mind quietly throws the new belief
            out. Evidence is what closes that gap. When you can point to real,
            dated events that could only be true of the new you, there is
            nothing left to argue with, and the belief stops being a slogan and
            becomes something you actually carry.
          </p>
          <p>
            Proof means concrete events with dates. A compliment someone gave
            you. Something you finished. A promise you kept. The app is built
            around a daily rhythm that keeps the evidence flowing:
          </p>
        </div>

        <ul className="hi-loop">
          <li>
            <strong>Morning ritual.</strong> Read each new decision aloud, see
            the latest proofs that support it, breathe and let it land. Then
            give yourself one to three small promises for the day.
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
            Keep at it and the bank starts speaking for itself. Once you have
            kept promises steadily for a few weeks, the app adds a proof you
            cannot write by hand, one that reads your own track record back to
            you and updates itself quietly as the weeks roll. The weekly review
            shows the old beliefs firing less and less often, and when a new
            decision has become obviously true you mark it as integrated and it
            moves to a quiet archive with its full proof history. That is the
            goal of the whole system: not motivation, not streaks for their own
            sake, but a new self-image built the only way one can honestly be
            built, out of true things that actually happened.
          </p>
        </div>

        <h2 className="hi-h2"><small>Which one</small>Where to start</h2>
        <div className="hi-pick">
          <div className="hi-pick-card">
            <h3>The Honesty Inventory</h3>
            <p>
              Simpler, lighter, and about behaviour: lies, truth telling, and
              one promise to yourself each morning.
            </p>
            <p className="hi-for">
              <strong>Start here if</strong> your word to yourself has stopped
              meaning anything, if you are still lying about small things, or if
              you want one honest practice a day and nothing more.
            </p>
          </div>
          <div className="hi-pick-card">
            <h3>The Proof Bank</h3>
            <p>
              Deeper, and about identity: replacing the beliefs your addiction
              wrote about you, and proving the new ones true.
            </p>
            <p className="hi-for">
              <strong>Start here if</strong> you are doing the right things but
              still feel like the same person underneath, or if a sentence like
              &ldquo;I ruin everything&rdquo; runs the show.
            </p>
          </div>
        </div>

        <div className="hi-body">
          <p>
            You can use both, and they work well together: the inventory keeps
            you honest day to day, and the Proof Bank turns that honesty into a
            different self-image over months. But you do not have to. Pick the
            one that names your problem and leave the other alone until you want
            it. Each installs separately, each keeps its own data, and neither
            one can see the other.
          </p>
        </div>

        <div className="hi-personal">
          <p>
            I built these because I needed them, and I use them every day: the
            morning ritual with coffee, a catch or two when an old thought grabs
            hold, two honest minutes at night. Rebuilding trust in my own word
            was the first work of my recovery. Rebuilding the picture of who I
            am is the work that came after, and these are the tools I do both
            with.
          </p>
        </div>

        <ul className="hi-facts">
          <li><strong>Completely free.</strong> No account, no login, no ads, and it always will be.</li>
          <li><strong>Fully private.</strong> Everything you write stays on your device. Nothing is sent to any server.</li>
          <li><strong>Two separate apps.</strong> Install one or both. They keep separate data and separate rhythms.</li>
          <li><strong>Works like an app.</strong> Installs on your home screen and works offline.</li>
          <li><strong>Yours to keep.</strong> Each app exports its own backup file, and the Proof Bank can print your collected evidence as a proof book.</li>
          <li><strong>Two languages.</strong> Both are available in English and Swedish.</li>
        </ul>

        <a className="hi-cta" href="/inventory-demo.html?lang=en">
          <div className="hi-cta-lab">See how they work</div>
          <div className="hi-cta-sub">Step-by-step guide to both apps, screenshots and installation instructions</div>
        </a>
        <p className="hi-alt">
          Already know them? <a href="/inventory/">Open the Honesty Inventory &rarr;</a>
        </p>
        <p className="hi-alt">
          <a href="/proofbank/">Open the Proof Bank &rarr;</a>
        </p>

        <p className="hi-attr">
          The Honesty Inventory is inspired by Nathaniel Branden&apos;s work on
          the six pillars of self-esteem. The Proof Bank is inspired by David
          Bayer&apos;s work on identifying and replacing limiting beliefs. Both
          are self-reflection tools, not psychological tests or a substitute for
          treatment.
        </p>
      </main>
    </>
  );
}
