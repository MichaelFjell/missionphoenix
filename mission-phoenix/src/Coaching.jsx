import BookingWidget from './BookingWidget.jsx';

export default function Coaching() {
  return (
    <>
      <style>{`
        .co-sub{font-size:20px;font-weight:700;color:var(--ink);margin-bottom:14px;}
        .co-lead{font-size:18px;line-height:1.75;color:var(--ink-2);max-width:640px;margin-bottom:56px;}
        .co-sec{margin-bottom:56px;}
        .co-2col{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        @media(max-width:720px){.co-2col{grid-template-columns:1fr;}}
        .co-card h3{font-size:16px;font-weight:800;margin-bottom:10px;}
        .co-card p{font-size:15px;line-height:1.8;color:var(--ink-2);}
        .co-card p+p{margin-top:12px;}
        .co-stake{border-left:3px solid var(--copper);}
        .co-price-row{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:12px;}
        .co-price{font-size:44px;font-weight:800;color:var(--copper);letter-spacing:-0.02em;}
        .co-price-per{font-size:15px;color:var(--ink-3);}
        .co-student{font-size:15px;color:var(--ink-2);margin-bottom:16px;}
        .co-spots{font-size:14px;font-weight:700;letter-spacing:0.5px;color:var(--ink);}
        .co-faq-q{font-size:16px;font-weight:800;margin-bottom:8px;}
        .co-faq-a{font-size:15px;line-height:1.8;color:var(--ink-2);}
        .co-faq-item{padding:22px 0;border-bottom:1px solid var(--line);}
        .co-faq-item:last-child{border-bottom:none;}
        .co-book-lede{font-size:16px;line-height:1.8;color:var(--ink-2);max-width:640px;margin-bottom:28px;}
      `}</style>
      <main className="page narrow">
        <div className="eyebrow"><span className="d"></span>One on one</div>
        <h1 className="page-title">Coaching</h1>
        <p className="co-sub">30 days of daily accountability. One on one.</p>
        <p className="co-lead">
          Most people do not fail because they lack information. They fail because nobody is
          watching. This fixes that.
        </p>

        <section className="co-sec co-2col">
          <div className="card co-card">
            <h3>Who this is for</h3>
            <p>
              You are quitting porn, or you are early in recovery and losing momentum. You have
              tried on your own. Streaks, resets, promises. It has not held. You are ready to
              report to someone every single day for 30 days.
            </p>
          </div>
          <div className="card co-card">
            <h3>Who this is not for</h3>
            <p>
              If you are looking for motivation videos, this is not it. If you are in active
              crisis or need medical or psychiatric care, you need treatment, not coaching. I
              will tell you that on the call and point you in the right direction.
            </p>
          </div>
        </section>

        <section className="co-sec">
          <h2 className="sec-title">What you get</h2>
          <div className="card co-card" style={{ marginBottom: 20 }}>
            <h3>Daily checkins</h3>
            <p>
              Every evening you send me a short structured report. Urges, triggers, what you
              did, tomorrow&apos;s plan. I read every report myself. You get a personal reply
              within 24 hours. No autoresponders. No assistants.
            </p>
          </div>
          <div className="card co-card co-stake" style={{ marginBottom: 20 }}>
            <p>
              Everything free is easy to abandon. You know this. You have downloaded the free
              apps. Joined the free servers. Watched the free videos. And quit all of it without
              a second thought, because quitting cost nothing.
            </p>
            <p>
              When you pay, you have a stake. Skipping a checkin is no longer neutral. Every
              report you send is you protecting your own investment. That shift alone changes
              how seriously you take the 30 days. Not because the money is large. Because it is
              yours.
            </p>
            <p>
              And it cuts both ways. You are not one follower out of thousands. You are one of 3
              clients that I am 100% invested in and focused on. I read your report every day. I
              prepare your call every week. I adjust your plan when the data says so. You are
              paying for a coach who is all in, and I expect the same back.
            </p>
            <p>
              That is the deal. You show up every day. I show up every day. For 30 days neither
              of us gets to coast.
            </p>
          </div>
          <div className="co-2col">
            <div className="card co-card">
              <h3>Weekly call</h3>
              <p>
                45 minutes on Zoom, once a week. We go through the patterns in your reports.
                What is working, what is breaking, what to change.
              </p>
            </div>
            <div className="card co-card">
              <h3>A personal plan</h3>
              <p>
                Built in week one from your strengths, weaknesses and circumstances. Not a
                template. Adjusted every week based on your data.
              </p>
            </div>
          </div>
        </section>

        <section className="co-sec">
          <h2 className="sec-title">Who I am</h2>
          <div className="card co-card">
            <p>
              My name is Michael. I spent decades addicted. Porn, alcohol, cannabis,
              amphetamines, benzos. The chain always started in the same place. I am now over a
              year fully clean off of everything, doing yoga, dancing, running, lifting,
              meditating regularly. I run Mission Phoenix as my hobby to help mentor people who
              struggle with this insidious addiction. In the future I will also be speaking in
              schools and classes about my experience with it and help steer the younger
              generation away from porn or at the very least, spread information about the true
              cost of pornography and what the consequences of becoming addicted to it.
            </p>
          </div>
        </section>

        <section className="co-sec">
          <h2 className="sec-title">Price</h2>
          <div className="card co-card">
            <div className="co-price-row">
              <span className="co-price">$199</span>
              <span className="co-price-per">for 30 days</span>
            </div>
            <p className="co-student">$99 if you are a verified student.</p>
            <p className="co-spots">
              I take a maximum of 3 clients at a time. When the spots are full, they are full.
            </p>
          </div>
        </section>

        <section className="co-sec" id="book-section">
          <h2 className="sec-title">How it starts</h2>
          <p className="co-book-lede">
            Book a free 30 minute call below. We go through where you are, what you have tried
            and what you want. If it is a fit, we start. If it is not, I will say so.
          </p>
          <BookingWidget />
        </section>

        <section className="co-sec">
          <h2 className="sec-title">FAQ</h2>
          <div className="card" style={{ paddingTop: 10, paddingBottom: 10 }}>
            <div className="co-faq-item">
              <div className="co-faq-q">Is this therapy?</div>
              <div className="co-faq-a">
                No. This is coaching, mentorship and accountability. It is not a substitute for
                professional treatment. I am however an in-training sex addiction therapist
                currently for DBK Sweden, the first sex addiction clinic in Sweden.
              </div>
            </div>
            <div className="co-faq-item">
              <div className="co-faq-q">What if I relapse during the 30 days?</div>
              <div className="co-faq-a">
                Then we work with it. A relapse is data. You report it like everything else and
                we adjust the plan. You do not get kicked out for being honest.
              </div>
            </div>
            <div className="co-faq-item">
              <div className="co-faq-q">What happens after 30 days?</div>
              <div className="co-faq-a">
                You can continue month by month if a spot is open. The goal is to build a system
                you run yourself.
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
