export default function ProofBank() {
  return (
    <>
      <style>{`
        .pb-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;}
        .pb-sub{font-size:13px;letter-spacing:3px;text-transform:uppercase;color:var(--copper);margin-bottom:14px;}
        .pb-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .pb-body p{font-size:16px;line-height:1.85;color:var(--ink-2);margin-bottom:20px;}
        .pb-h2{font-size:clamp(19px,2.6vw,23px);font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin:44px 0 6px;}
        .pb-h2 small{display:block;font-size:12.5px;letter-spacing:3px;color:var(--copper);margin-bottom:6px;}
        .pb-personal{margin:32px 0;padding:22px 26px;background:var(--copper-soft);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;}
        .pb-personal p{font-size:16px;line-height:1.85;color:var(--ink-2);margin:0;}
        .pb-facts{list-style:none;padding:0;margin:32px 0;display:grid;gap:10px;}
        .pb-facts li{padding:14px 18px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:15px;line-height:1.6;color:var(--ink-2);}
        .pb-facts li strong{color:var(--copper);font-weight:700;}
        .pb-loop{list-style:none;padding:0;margin:26px 0;display:grid;gap:8px;counter-reset:loop;}
        .pb-loop li{padding:13px 17px 13px 52px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:15px;line-height:1.65;color:var(--ink-2);position:relative;counter-increment:loop;}
        .pb-loop li::before{content:counter(loop);position:absolute;left:16px;top:12px;width:24px;height:24px;border-radius:50%;background:var(--copper-soft);border:1px solid var(--copper);color:var(--copper);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .pb-quote{margin:30px 0;padding:20px 24px;background:var(--card);border:1px solid var(--line);border-radius:14px;}
        .pb-quote p{font-size:17px;line-height:1.7;color:var(--ink-2);margin:0;font-style:italic;}
        .pb-cta{display:block;text-align:center;padding:36px 32px;background:var(--card);border:1px solid var(--line);border-radius:18px;margin:36px 0 14px;transition:all .2s;}
        .pb-cta:hover{border-color:var(--copper);background:var(--copper-soft);}
        .pb-cta-lab{font-size:15px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--copper);margin-bottom:10px;}
        .pb-cta-sub{font-size:15px;color:var(--ink-3);}
        .pb-alt{text-align:center;font-size:15px;color:var(--ink-3);margin-bottom:8px;}
        .pb-alt a{color:var(--copper);font-weight:700;text-decoration:none;}
        .pb-alt a:hover{text-decoration:underline;}
        .pb-attr{margin-top:36px;font-size:13.5px;line-height:1.7;color:var(--ink-3);}
      `}</style>
      <main className="page narrow">
        <h1 className="pb-title">The Proof Bank</h1>
        <div className="pb-sep"></div>

        <div className="pb-body">
          <p>
            A free, private app for the part of recovery nobody hands you a
            chip for: changing the picture of who you are. You write down the
            old beliefs your addiction wrote about you, word for word. You
            write the decisions that replace them. And then you collect proof
            that the new ones are true.
          </p>
          <p>
            Addiction does two kinds of damage, and only one of them stops when
            the using stops. It breaks your trust in your own word, and it
            writes a story about who you are: &ldquo;I always ruin
            things,&rdquo; &ldquo;I can&apos;t be trusted,&rdquo; &ldquo;people
            leave when they see the real me.&rdquo; Getting sober ends the
            behaviour. It does not, by itself, rewrite the story. That is what
            this app is for.
          </p>
        </div>

        <h2 className="pb-h2"><small>The idea</small>Why proof, not affirmations</h2>
        <div className="pb-body">
          <p>
            The method comes from David Bayer&apos;s work on limiting beliefs,
            adapted for recovery. Telling yourself something you do not believe
            creates cognitive dissonance, and your mind quietly throws the new
            belief back out. That is why affirmations on their own tend to slide
            off. Evidence is what closes the gap.
          </p>
          <p>
            So you write the old belief exactly as it sounds in your head,
            because that is the sentence you have to recognize when it shows up.
            You write the new decision in the present tense, as something
            already true. And then you gather proof: concrete, dated events that
            could only be true of the new you. A compliment someone gave you.
            Something you finished. A promise you kept. When you can point at
            real things that happened, there is nothing left to argue with, and
            the decision stops being a slogan and becomes something you carry.
          </p>
          <p>
            The bank does not open empty, either. The app starts with a short
            comparison between who you are now and who you were a year ago, or
            during your worst stretch, and every answer becomes your first
            proof.
          </p>
        </div>

        <h2 className="pb-h2"><small>The rhythm</small>What a day looks like</h2>
        <ul className="pb-loop">
          <li>
            <strong>Morning ritual.</strong> Read each new decision, see the
            latest proofs that back it, breathe and let it land. The next
            button is locked for ten seconds, because the ritual is the
            repetition and it should not be rushed. Then give yourself one to
            three small promises for the day.
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

        <div className="pb-body">
          <p>
            Keep at it and the bank starts speaking for itself. Once you have
            kept promises steadily for a few weeks, the app adds a proof you
            cannot write by hand: one that reads your own track record back to
            you and updates itself quietly as the weeks roll. The weekly review
            shows the old beliefs firing less and less often, and when a new
            decision has become obviously true you mark it as integrated and it
            moves to a quiet archive with its full proof history. The whole bank
            can be printed as a proof book, every proof gathered by category,
            for the day your head claims nothing has happened.
          </p>
        </div>

        <div className="pb-quote">
          <p>
            Not motivation, not streaks for their own sake. A new self-image
            built the only way one can honestly be built: out of true things
            that actually happened.
          </p>
        </div>

        <div className="pb-personal">
          <p>
            I built this because I needed it, and I use it every day: the
            morning ritual with coffee, a catch or two when an old thought grabs
            hold, two honest minutes at night. Rebuilding trust in my own word
            was the first work of my recovery. Rebuilding the picture of who I
            am is the work that came after, and this is the tool I do it with.
          </p>
        </div>

        <ul className="pb-facts">
          <li><strong>Completely free.</strong> No account, no login, no ads, and it always will be.</li>
          <li><strong>Fully private.</strong> Everything you write stays on your device. Nothing is sent to any server.</li>
          <li><strong>Works like an app.</strong> Installs on your home screen and works offline.</li>
          <li><strong>Yours to keep.</strong> Export your whole bank as a backup file, and print your collected evidence as a proof book.</li>
          <li><strong>Two languages.</strong> Available in English and Swedish.</li>
        </ul>

        <a className="pb-cta" href="/proofbank.html">
          <div className="pb-cta-lab">See how it works</div>
          <div className="pb-cta-sub">Step-by-step guide, screenshots and installation instructions</div>
        </a>
        <p className="pb-alt">
          Already know it? <a href="/proofbank/">Open The Proof Bank &rarr;</a>
        </p>

        <p className="pb-attr">
          The Proof Bank is inspired by David Bayer&apos;s work on identifying
          and replacing limiting beliefs. It is a self-reflection tool, not a
          psychological test or a substitute for treatment.
        </p>
      </main>
    </>
  );
}
