import { useState, useRef, useMemo } from "react";

// ─── QUIZ QUESTIONS ─────────────────────────────────────────
const QUESTIONS = [
  {
    id: "exposure_age",
    question: "When were you first exposed to pornography?",
    options: [
      { label: "Under 10", value: "under10", score: 4 },
      { label: "10–12", value: "10-12", score: 3 },
      { label: "12–15", value: "12-15", score: 2 },
      { label: "16+", value: "16+", score: 1 },
    ],
  },
  {
    id: "frequency",
    question: "How often have you consumed pornography in the past year?",
    options: [
      { label: "Once or more daily", value: "daily", score: 4 },
      { label: "Every other day", value: "every_other", score: 3 },
      { label: "Once a week", value: "weekly", score: 2 },
      { label: "1–2 times a month", value: "monthly", score: 1 },
    ],
  },
  {
    id: "session_length",
    question: "How long does a typical session last?",
    options: [
      { label: "Less than 1 hour", value: "under1", score: 1 },
      { label: "1–2 hours", value: "1-2", score: 2 },
      { label: "3–5 hours", value: "3-5", score: 3 },
      { label: "6+ hours", value: "6+", score: 4 },
    ],
  },
  {
    id: "substances",
    question: "Do you combine porn with any other substance?",
    subtitle: "Select all that apply",
    multi: true,
    options: [
      { label: "Cannabis / Weed", value: "weed", score: 2 },
      { label: "Alcohol", value: "alcohol", score: 2 },
      { label: "Amphetamines / Stimulants", value: "amphetamines", score: 3 },
      { label: "Other substances", value: "other", score: 2 },
      { label: "No, porn only", value: "none", score: 0 },
    ],
  },
  {
    id: "fetish_escalation",
    question: "Have you developed fetishes you believe you wouldn't have without pornography?",
    subtitle: "Content that disturbs you afterwards. Things you'd never seek in real life.",
    options: [
      { label: "Yes, significantly", value: "yes_significant", score: 4 },
      { label: "Yes, somewhat", value: "yes_somewhat", score: 3 },
      { label: "I'm not sure", value: "unsure", score: 2 },
      { label: "No", value: "no", score: 0 },
    ],
  },
];

// ─── RANDOM FACTS POOL (shown during quiz) ─────────────────
const QUIZ_FACTS = [
  {
    text: "After just 6 weeks of one-hour weekly porn sessions, both men and women reported significantly less satisfaction with their partner's affection, appearance, and sexual performance.",
    source: "Zillmann & Bryant, Journal of Applied Social Psychology, 1988",
  },
  {
    text: "The Kinsey Report (1948) found erectile dysfunction in less than 1% of men under 19. Six studies since 2010 found rates of 14–33% in the same age group. That's a 1,000% increase.",
    source: "Your Brain on Porn, citing Kinsey (1948) + 6 post-2010 studies",
  },
  {
    text: "78.6% of males aged 16–21 reported a sexual problem during partnered activity. ED affected 45%, low desire 46%, difficulty orgasming 24%.",
    source: "O'Sullivan et al., Canadian sexologists' study, 2016",
  },
  {
    text: "Individuals who consumed both adult and deviant pornography started viewing adult porn at a significantly younger age than those who stayed with adult-only content.",
    source: "Seigfried-Spellar, Int. J. Cyber Behavior, Psychology and Learning, 2016",
  },
  {
    text: "Your brain responds to internet pornography the same way it responds to cocaine — decreased grey matter, reduced dopamine sensitivity, and compulsive seeking behavior.",
    source: "Voon et al., Cambridge University, PLOS ONE, 2014",
  },
  {
    text: "Prolonged pornography consumption trivializes both rape and child sexual abuse as criminal offenses in the minds of consumers.",
    source: "Zillmann, Effects of Prolonged Consumption of Pornography, U.S. Surgeon General report, 1986",
  },
  {
    text: "Dopamine isn't the 'pleasure chemical' — it's the 'seeking chemical.' It doesn't say 'that was good.' It says 'more, different, keep going.' Porn hijacks this system.",
    source: "Berridge & Robinson, Brain Research Reviews, 1993",
  },
  {
    text: "A study of 231 men charged with child pornography possession found their collections included a wide range of deviant material, including bestiality — suggesting a pattern of generalized escalation.",
    source: "Endrass et al., BMC Psychiatry, 2009",
  },
  {
    text: "In Japan, 36% of men aged 16–19 reported no interest in sex in 2010 — more than double the 17.5% from just two years earlier. In France, 20% of young men reported the same.",
    source: "Japan Times, 2011; IFOP survey, France, 2008",
  },
  {
    text: "When researchers showed the same erotic film repeatedly, arousal steadily declined. When they introduced novel content on the 19th viewing — arousal instantly spiked. Your brain craves novelty, not satisfaction.",
    source: "Koukounas & Over, Behavioural Brain Research, 2000",
  },
  {
    text: "The prefrontal cortex — your brain's 'brakes' for impulse control — doesn't fully mature until age 25. Porn exposure before that age wires the reward system while the brakes are still being installed.",
    source: "Casey et al., Developmental Psychobiology, 2008",
  },
  {
    text: "Even moderate porn use correlates with reduced grey matter in brain regions associated with motivation, decision-making, and cognitive function.",
    source: "Kühn & Gallinat, JAMA Psychiatry, 2014",
  },
  {
    text: "Almost 60% of porn addicts in a Cambridge University study experienced diminished libido or erectile function with real partners — but not with pornography.",
    source: "Voon et al., Cambridge University, 2014",
  },
  {
    text: "Porn consumers assigned increased importance to sex without emotional involvement. This effect was uniform across both men and women.",
    source: "Zillmann & Bryant, Journal of Applied Social Psychology, 1988",
  },
  {
    text: "AI-generated pornography eliminates the last natural limit on escalation — finite supply. You now have infinite perfect novelty, personalized to your exact tolerance threshold.",
    source: "",
  },
  {
    text: "Sexual interests are conditionable — they can be changed by experience. Unwanted fetishes developed through porn use consistently fade when users quit.",
    source: "Hoffmann, Psychological Bulletin, 2012; Pfaus et al., Archives of Sexual Behavior, 2012",
  },
  {
    text: "Prolonged porn consumption fostered belief that 'less common sexual practices' were more prevalent than they are, distorting users' understanding of normal sexuality.",
    source: "Zillmann, Effects of Prolonged Consumption of Pornography, 1986",
  },
  {
    text: "A meta-analysis of 50 studies with 50,000+ participants confirmed: pornography consumption is associated with lower sexual and relational satisfaction.",
    source: "Wright et al., Human Communication Research, 2017",
  },
];

// ─── SEVERITY-BASED FACTS (shown in results) ───────────────
const SEVERITY_FACTS = {
  low: [
    "Even moderate porn use has been shown to correlate with reduced grey matter in the brain and decreased sexual responsiveness. You don't need to be an 'addict' to be affected.",
    "Porn consumption at any level is associated with lower relationship satisfaction and distorted expectations of real partners.",
  ],
  moderate: [
    "At your level of use, your brain's dopamine baseline has likely shifted. Studies show this is when users first start noticing that real intimacy feels 'flat' compared to porn.",
    "You are in the range where escalation to more extreme content typically begins. Tolerance builds — and what shocked you a year ago may already seem routine.",
    "Research shows habitual users report less satisfaction with their partners' affection, appearance, and sexual performance — even when their partners haven't changed.",
  ],
  severe: [
    "At this level, Cambridge University researchers found almost 60% of subjects experienced erectile dysfunction or diminished libido — but only with real partners. Not with porn.",
    "Your brain's reward circuitry now mirrors patterns seen in cocaine and methamphetamine addiction: decreased grey matter, reduced dopamine receptors, compulsive seeking behavior.",
    "Users at your severity commonly report escalating to content they find personally disturbing — genres they never sought before porn rewired their tolerance thresholds.",
    "The age you first started using porn is a significant predictor of how far escalation goes. Research shows earlier onset correlates with greater progression to extreme and deviant content.",
  ],
  critical: [
    "Combining substances with pornography creates compounding neurological damage. Each substance amplifies the dopamine dysregulation, accelerating the addiction cascade.",
    "At crisis-level addiction, your dopamine system is so compromised that you may be unable to experience motivation, pleasure, or connection outside of the addiction cycle itself.",
    "This level of use typically presents with: complete loss of attraction to real partners, severe erectile dysfunction, social withdrawal, inability to concentrate, depression, and emotional numbness.",
    "A study of men with extreme pornography habits found their collections included material across multiple deviant categories — escalation doesn't plateau, it generalizes.",
    "Recovery from this level is absolutely possible. Brain plasticity works both ways. But it requires complete cessation, not reduction.",
  ],
};

// ─── SEVERITY LEVELS ────────────────────────────────────────
const SEVERITY_LEVELS = [
  {
    threshold: 0, level: "Low Risk", color: "#6b9e6b", key: "low",
    message: "Your usage appears relatively low-risk, but any level of habitual porn use rewires your brain's reward circuitry. The earlier you address it, the easier recovery is.",
  },
  {
    threshold: 6, level: "Moderate", color: "#c4a035", key: "moderate",
    message: "You're showing clear signs of habitual use. Your brain's dopamine baseline has likely shifted — you may already notice that real intimacy, motivation, or focus feels dulled. This doesn't stay at this level. It escalates.",
  },
  {
    threshold: 11, level: "Severe", color: "#a34620", key: "severe",
    message: "You are deep in an addiction cycle. The combination of frequency, session length, and escalating content means your dopamine system is significantly compromised. You may be experiencing erectile dysfunction, social withdrawal, brain fog, or emotional numbness. This is not a habit — it's a dependency.",
  },
  {
    threshold: 16, level: "Critical", color: "#b82030", key: "critical",
    message: "You are in crisis-level addiction. The combination of substances with pornography creates compounding neurological damage. Your addiction cascade means each behavior reinforces the others. Without intervention, this path leads to complete isolation, destroyed relationships, job loss, and potentially worse. You already know this.",
  },
];

// ─── RECOVERY TIMELINE ──────────────────────────────────────
const BENEFITS = [
  { timeframe: "Days 1–7", title: "The Storm", description: "Withdrawal hits hard. Irritability, insomnia, cravings. Your brain is screaming for dopamine. This is where most people fail — and exactly where your fear-based motivation matters most." },
  { timeframe: "Days 7–30", title: "The Fog Lifts", description: "Improved focus and mental clarity. You start remembering what it feels like to be present. Morning motivation returns. Eye contact becomes easier." },
  { timeframe: "Days 30–90", title: "The Rewiring", description: "Dopamine receptors begin recovering. Real attraction to real people returns. Confidence builds naturally — not forced. Emotional depth you forgot you had." },
  { timeframe: "90+ Days", title: "The Person You Were Supposed To Be", description: "Full neurological recovery in progress. Relationships deepen. Ambition returns. You stop surviving and start building. The version of you that addiction buried starts to surface." },
];

// ─── HELPERS ────────────────────────────────────────────────
function getSeverity(score) {
  let result = SEVERITY_LEVELS[0];
  for (const level of SEVERITY_LEVELS) {
    if (score >= level.threshold) result = level;
  }
  return result;
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function Quiz() {
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSelections, setMultiSelections] = useState([]);
  const [score, setScore] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(0);
  const [factFading, setFactFading] = useState(false);
  const resultsRef = useRef(null);

  const quizFacts = useMemo(() => {
    const shuffled = shuffleArray(QUIZ_FACTS);
    return QUESTIONS.map((_, i) => shuffled[i % shuffled.length]);
  }, []);

  const resultFacts = useMemo(() => {
    const severity = getSeverity(score);
    const pool = SEVERITY_FACTS[severity.key] || SEVERITY_FACTS.low;
    return shuffleArray(pool).slice(0, 3);
  }, [score]);

  const handleStart = () => {
    setAnimating(true);
    setTimeout(() => {
      setPhase("quiz");
      setAnimating(false);
    }, 400);
  };

  const handleAnswer = (question, option) => {
    if (animating) return;

    if (question.multi) {
      if (option.value === "none") {
        setMultiSelections(["none"]);
      } else {
        setMultiSelections((prev) => {
          const filtered = prev.filter((v) => v !== "none");
          return filtered.includes(option.value)
            ? filtered.filter((v) => v !== option.value)
            : [...filtered, option.value];
        });
      }
      return;
    }

    setAnimating(true);
    setFactFading(true);
    const newAnswers = { ...answers, [question.id]: option };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        finishQuiz(newAnswers);
      }
      setAnimating(false);
      setTimeout(() => setFactFading(false), 50);
    }, 400);
  };

  const handleMultiSubmit = () => {
    if (multiSelections.length === 0 || animating) return;
    setAnimating(true);
    setFactFading(true);
    const question = QUESTIONS[currentQ];
    const selectedOptions = question.options.filter((o) =>
      multiSelections.includes(o.value)
    );
    const multiScore = selectedOptions.reduce((sum, o) => sum + o.score, 0);
    const newAnswers = {
      ...answers,
      [question.id]: { value: multiSelections, score: multiScore },
    };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        setMultiSelections([]);
      } else {
        finishQuiz(newAnswers);
      }
      setAnimating(false);
      setTimeout(() => setFactFading(false), 50);
    }, 400);
  };

  const finishQuiz = (finalAnswers) => {
    const total = Object.values(finalAnswers).reduce(
      (sum, a) => sum + (a.score || 0),
      0
    );
    setScore(total);
    setPhase("results");
    let i = 0;
    const revealInterval = setInterval(() => {
      i++;
      setResultsRevealed(i);
      if (i >= 14) clearInterval(revealInterval);
    }, 300);
  };

  const handleRestart = () => {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers({});
    setMultiSelections([]);
    setScore(0);
    setResultsRevealed(0);
    setFactFading(false);
  };

  const severity = getSeverity(score);
  const question = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const currentFact = quizFacts[currentQ];

  return (
    <>
      <style>{`
        .qz-wrap{max-width:720px;margin:0 auto;}
        .qz-intro{text-align:center;padding:40px 0 20px;transition:opacity .4s ease, transform .4s ease;}
        .qz-mark{width:64px;height:64px;margin:0 auto 24px;}
        .qz-mark img{width:64px;height:64px;background:var(--copper);-webkit-mask:url(/phoenix.png) center/contain no-repeat;mask:url(/phoenix.png) center/contain no-repeat;}
        .qz-h1{font-size:clamp(32px,5vw,44px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .qz-sep{width:60px;height:2px;background:var(--copper);margin:0 auto 24px;border-radius:2px;}
        .qz-sub{font-size:19px;line-height:1.7;color:var(--ink-2);font-style:italic;max-width:520px;margin:0 auto 16px;}
        .qz-desc{font-size:15px;line-height:1.8;color:var(--ink-3);margin-bottom:40px;}
        .qz-begin{font-size:14px;font-weight:700;letter-spacing:3px;padding:16px 40px;background:transparent;color:var(--copper);border:1px solid var(--copper);cursor:pointer;font-family:inherit;text-transform:uppercase;transition:all .2s;}
        .qz-begin:hover{background:var(--copper);color:var(--card);}
        .qz-disclaim{font-size:11px;font-weight:700;letter-spacing:1px;color:var(--ink-3);text-transform:uppercase;margin-top:28px;}

        .qz-quiz{padding:20px 0;}
        .qz-progress{height:2px;background:var(--line);margin-bottom:12px;overflow:hidden;border-radius:2px;}
        .qz-progress > div{height:100%;background:var(--copper);transition:width .5s ease;}
        .qz-count{font-size:12px;font-weight:700;letter-spacing:3px;color:var(--ink-3);margin-bottom:40px;}
        .qz-card{transition:opacity .35s ease, transform .35s ease;}
        .qz-q{font-size:clamp(22px,4vw,28px);font-weight:700;line-height:1.35;color:var(--ink);margin-bottom:8px;letter-spacing:-0.01em;}
        .qz-qsub{font-size:15px;color:var(--ink-3);font-style:italic;margin-bottom:28px;line-height:1.6;}
        .qz-opts{display:flex;flex-direction:column;gap:10px;}
        .qz-opt{font-size:16px;padding:18px 22px;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:12px;cursor:pointer;text-align:left;transition:all .15s;font-family:inherit;}
        .qz-opt:hover{border-color:var(--copper);background:var(--copper-soft);}
        .qz-opt.on{border-color:var(--copper);background:var(--copper-soft);color:var(--copper);font-weight:600;}
        .qz-continue{margin-top:24px;font-size:13px;font-weight:700;letter-spacing:3px;padding:14px 32px;background:transparent;color:var(--copper);border:1px solid var(--copper);cursor:pointer;font-family:inherit;text-transform:uppercase;}
        .qz-continue:disabled{opacity:0.3;cursor:default;}

        .qz-fact{margin-top:48px;padding-top:28px;border-top:1px solid var(--line);transition:opacity .4s ease, transform .4s ease;}
        .qz-fact-lab{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--copper);margin-bottom:10px;}
        .qz-fact-text{font-size:14px;line-height:1.75;color:var(--ink-2);font-style:italic;margin-bottom:8px;}
        .qz-fact-source{font-size:11px;color:var(--ink-3);}

        .qz-results{padding-top:20px;}
        .qz-rsection{margin-bottom:56px;transition:opacity .6s ease, transform .6s ease;}
        .qz-sev-label{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--ink-3);text-transform:uppercase;margin-bottom:12px;}
        .qz-sev-level{font-size:clamp(40px,10vw,64px);font-weight:800;letter-spacing:3px;margin-bottom:24px;line-height:1;text-transform:uppercase;}
        .qz-score-bar{height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px;}
        .qz-score-fill{height:100%;background:linear-gradient(90deg,#6b9e6b,#c4a035,#a34620,#b82030);transition:width 1.5s ease;border-radius:3px;}
        .qz-score-labs{display:flex;justify-content:space-between;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;}
        .qz-sev-msg{font-size:17px;line-height:1.8;color:var(--ink-2);}

        .qz-rtitle{font-size:13px;font-weight:700;letter-spacing:4px;color:var(--copper);text-transform:uppercase;margin-bottom:24px;}
        .qz-rfacts{display:flex;flex-direction:column;gap:16px;}
        .qz-rfact{display:flex;gap:20px;padding:22px;background:var(--card);border:1px solid var(--line);border-radius:14px;transition:opacity .5s ease, transform .5s ease;}
        .qz-rfact .n{font-size:24px;font-weight:800;color:var(--copper);opacity:0.5;flex-shrink:0;}
        .qz-rfact p{font-size:15.5px;line-height:1.7;color:var(--ink-2);margin:0;}

        .qz-mech{padding:32px;background:var(--copper-soft);border-left:3px solid var(--copper);border-radius:0 14px 14px 0;}
        .qz-mech h3{font-size:14px;font-weight:700;letter-spacing:4px;color:var(--copper);text-transform:uppercase;margin-bottom:18px;}
        .qz-mech p{font-size:16px;line-height:1.8;color:var(--ink-2);margin-bottom:14px;}
        .qz-mech p.strong{color:var(--ink);font-weight:700;}

        .qz-esc p.intro-p{font-size:16px;line-height:1.8;color:var(--ink-2);margin-bottom:24px;}
        .qz-esc-item{display:flex;gap:14px;margin-bottom:16px;padding-left:8px;}
        .qz-esc-item .d{color:var(--copper);font-weight:800;flex-shrink:0;}
        .qz-esc-item p{font-size:15px;line-height:1.7;color:var(--ink-2);margin:0;}
        .qz-esc-warn{margin-top:24px;padding-left:16px;border-left:2px solid var(--line-2);font-size:16px;line-height:1.8;color:var(--ink-2);font-style:italic;}

        .qz-timeline{padding-left:16px;}
        .qz-tl-item{position:relative;padding-left:32px;padding-bottom:32px;border-left:1px solid var(--line);margin-left:6px;}
        .qz-tl-dot{position:absolute;left:-7px;top:4px;width:14px;height:14px;border-radius:50%;background:var(--bg);border:2px solid var(--copper);display:flex;align-items:center;justify-content:center;}
        .qz-tl-dot::after{content:"";width:4px;height:4px;border-radius:50%;background:var(--copper);}
        .qz-tl-time{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--copper);margin-bottom:6px;text-transform:uppercase;}
        .qz-tl-title{font-size:20px;font-weight:700;margin-bottom:8px;letter-spacing:-0.01em;}
        .qz-tl-desc{font-size:15px;line-height:1.7;color:var(--ink-2);}

        .qz-cta{text-align:center;padding:40px 0;border-top:1px solid var(--line);}
        .qz-cta h3{font-size:clamp(18px,3vw,22px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;}
        .qz-cta p.it{font-size:16px;line-height:1.8;color:var(--ink-2);font-style:italic;max-width:520px;margin:0 auto 20px;}
        .qz-cta .author{font-size:14px;color:var(--ink-3);line-height:1.6;margin-bottom:36px;}
        .qz-cta .primary-cta{display:inline-block;font-size:14px;font-weight:700;letter-spacing:3px;padding:16px 40px;background:transparent;color:var(--copper);border:1px solid var(--copper);text-decoration:none;transition:all .2s;text-transform:uppercase;margin-bottom:12px;font-family:inherit;cursor:pointer;}
        .qz-cta .primary-cta:hover{background:var(--copper);color:var(--card);}
        .qz-cta .sub{font-size:13px;color:var(--ink-3);line-height:1.6;margin-bottom:20px;}
        .qz-cta .restart{font-size:14px;background:none;border:none;color:var(--ink-3);cursor:pointer;padding:8px;font-family:inherit;}

        .qz-foot{text-align:center;padding:40px 0 0;border-top:1px solid var(--line);margin-top:24px;}
        .qz-foot .line{width:40px;height:1px;background:var(--line-2);margin:0 auto 20px;}
        .qz-foot .t{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--ink-3);margin-bottom:12px;}
        .qz-foot .s{font-size:11px;color:var(--ink-3);line-height:1.6;max-width:500px;margin:0 auto 14px;}
        .qz-foot .d{font-size:12px;color:var(--ink-3);line-height:1.6;max-width:400px;margin:0 auto 10px;}
        .qz-foot .p{font-size:11px;color:var(--ink-3);line-height:1.6;max-width:400px;margin:0 auto;font-style:italic;}
      `}</style>

      <main className="page narrow">
        <div className="qz-wrap">

          {phase === "intro" && (
            <div className="qz-intro" style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(20px)" : "translateY(0)",
            }}>
              <div className="qz-mark"><img src="/phoenix.png" alt="" /></div>
              <h1 className="qz-h1">Mission Phoenix</h1>
              <div className="qz-sep"></div>
              <p className="qz-sub">A pornography addiction assessment built by someone who lived it.</p>
              <p className="qz-desc">5 questions. No account needed. No data stored.<br />Just honesty with yourself.</p>
              <button className="qz-begin" onClick={handleStart}>Begin Assessment</button>
              <p className="qz-disclaim">This is not a clinical diagnostic tool. It is a wake-up call.</p>
            </div>
          )}

          {phase === "quiz" && (
            <div className="qz-quiz">
              <div className="qz-progress"><div style={{ width: `${progress}%` }} /></div>
              <div className="qz-count">{currentQ + 1} / {QUESTIONS.length}</div>
              <div key={currentQ} className="qz-card" style={{
                opacity: animating ? 0 : 1,
                transform: animating ? "translateX(40px)" : "translateX(0)",
              }}>
                <h2 className="qz-q">{question.question}</h2>
                {question.subtitle && <p className="qz-qsub">{question.subtitle}</p>}
                <div className="qz-opts">
                  {question.options.map((opt) => {
                    const isMulti = question.multi;
                    const isSelected = isMulti
                      ? multiSelections.includes(opt.value)
                      : answers[question.id]?.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(question, opt)}
                        className={`qz-opt${isSelected ? ' on' : ''}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {question.multi && (
                  <button
                    onClick={handleMultiSubmit}
                    disabled={multiSelections.length === 0}
                    className="qz-continue"
                  >
                    Continue →
                  </button>
                )}
              </div>

              <div className="qz-fact" style={{
                opacity: factFading ? 0 : 1,
                transform: factFading ? "translateY(10px)" : "translateY(0)",
              }}>
                <div className="qz-fact-lab">Did You Know</div>
                <p className="qz-fact-text">{currentFact.text}</p>
                {currentFact.source && <p className="qz-fact-source">{currentFact.source}</p>}
              </div>
            </div>
          )}

          {phase === "results" && (
            <div ref={resultsRef} className="qz-results">

              <div className="qz-rsection" style={{
                opacity: resultsRevealed >= 1 ? 1 : 0,
                transform: resultsRevealed >= 1 ? "translateY(0)" : "translateY(30px)",
              }}>
                <div className="qz-sev-label">Your assessment</div>
                <div className="qz-sev-level" style={{ color: severity.color }}>
                  {severity.level}
                </div>
                <div className="qz-score-bar">
                  <div className="qz-score-fill" style={{
                    width: `${Math.min((score / 19) * 100, 100)}%`,
                  }} />
                </div>
                <div className="qz-score-labs">
                  <span style={{ color: "#6b9e6b" }}>Low</span>
                  <span style={{ color: "#c4a035" }}>Moderate</span>
                  <span style={{ color: "#a34620" }}>Severe</span>
                  <span style={{ color: "#b82030" }}>Critical</span>
                </div>
                <p className="qz-sev-msg">{severity.message}</p>
              </div>

              <div className="qz-rsection" style={{
                opacity: resultsRevealed >= 2 ? 1 : 0,
                transform: resultsRevealed >= 2 ? "translateY(0)" : "translateY(30px)",
              }}>
                <h3 className="qz-rtitle">What the research says about your level</h3>
                <div className="qz-rfacts">
                  {resultFacts.map((fact, i) => (
                    <div key={i} className="qz-rfact" style={{
                      opacity: resultsRevealed >= 3 + i ? 1 : 0,
                      transform: resultsRevealed >= 3 + i ? "translateY(0)" : "translateY(15px)",
                    }}>
                      <div className="n">{String(i + 1).padStart(2, "0")}</div>
                      <p>{fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="qz-rsection" style={{
                opacity: resultsRevealed >= 6 ? 1 : 0,
                transform: resultsRevealed >= 6 ? "translateY(0)" : "translateY(30px)",
              }}>
                <div className="qz-mech">
                  <h3>How your brain gets hijacked</h3>
                  <p>Dopamine isn't your pleasure chemical — it's your seeking chemical. It doesn't say "that was satisfying." It says "more, different, keep going." Pornography exploits this by offering infinite novelty at zero effort.</p>
                  <p>When you chronically overstimulate this system, your brain protects itself by reducing dopamine sensitivity. Now you need more extreme content to feel the same thing. This is the same tolerance mechanism behind cocaine and methamphetamine addiction — confirmed by brain imaging studies at Cambridge University and the Max Planck Institute.</p>
                  <p>Meanwhile, your prefrontal cortex — the part that says "this is wrong, stop" — gets overridden by the hijacked reward system. The moral reasoning is still there. That's why you feel disgusted afterward. But in the moment, the dopamine drive literally suppresses your ability to apply those values.</p>
                  <p className="strong">This is not a character flaw. It is a neurological process. And it is reversible.</p>
                </div>
              </div>

              <div className="qz-rsection qz-esc" style={{
                opacity: resultsRevealed >= 7 ? 1 : 0,
                transform: resultsRevealed >= 7 ? "translateY(0)" : "translateY(30px)",
              }}>
                <h3 className="qz-rtitle">The escalation pattern</h3>
                <p className="intro-p">Research confirms what thousands of recovering users already know: porn use escalates. Not because you're broken — because your brain adapts. It demands more extreme stimuli to produce the same neurochemical response.</p>
                <div className="qz-esc-item"><span className="d">—</span><p>Earlier onset of pornography use is the strongest predictor of escalation to deviant content. The younger you started, the deeper the wiring.</p></div>
                <div className="qz-esc-item"><span className="d">—</span><p>Users consistently report arriving at content that previously disgusted them — genres they never sought, fantasies that conflict with their values and identity.</p></div>
                <div className="qz-esc-item"><span className="d">—</span><p>A meta-analysis of 50 studies with over 50,000 participants confirmed that pornography consumption is associated with lower sexual and relational satisfaction — across every study type: cross-sectional, longitudinal, and experimental.</p></div>
                <p className="qz-esc-warn">If you have found yourself watching content that would have disgusted you a year ago, you are not a deviant. You are experiencing a predictable neurological process — one that over 60 peer-reviewed studies have documented. And it will continue escalating until you stop feeding it.</p>
              </div>

              <div className="qz-rsection" style={{
                opacity: resultsRevealed >= 8 ? 1 : 0,
                transform: resultsRevealed >= 8 ? "translateY(0)" : "translateY(30px)",
              }}>
                <h3 className="qz-rtitle">What happens when you stop</h3>
                <div className="qz-timeline">
                  {BENEFITS.map((b, i) => (
                    <div key={i} className="qz-tl-item">
                      <div className="qz-tl-dot"></div>
                      <div className="qz-tl-time">{b.timeframe}</div>
                      <div className="qz-tl-title">{b.title}</div>
                      <div className="qz-tl-desc">{b.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="qz-rsection" style={{
                opacity: resultsRevealed >= 9 ? 1 : 0,
                transform: resultsRevealed >= 9 ? "translateY(0)" : "translateY(30px)",
              }}>
                <div className="qz-cta">
                  <h3>This is your moment of clarity</h3>
                  <p className="it">You're reading this because some part of you already knows. Hope alone won't save you — I tried that for 20 years. What works is finding the one consequence you fear more than the craving. That fear becomes your weapon.</p>
                  <p className="author">
                    — Michael, 41. Cold turkey from daily amphetamines, benzos, weed, and porn.<br />
                    <span style={{ color: "var(--ink-3)", fontSize: "13px" }}>
                      July 15, 2025. Couldn't run 100 meters. Ran 5K in 23:38 by December.
                    </span>
                  </p>
                  <a
                    href="https://discord.com/invite/tXnBUSbq92"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-cta"
                  >
                    Join the community — free
                  </a>
                  <p className="sub">Private Discord server. Men recovering together.<br />No judgment. No cost. Just accountability.</p>
                  <button onClick={handleRestart} className="restart">← Take assessment again</button>
                </div>
              </div>

              <div className="qz-foot">
                <div className="line"></div>
                <div className="t">Mission Phoenix — Alpha</div>
                <p className="s">Research cited: Zillmann &amp; Bryant (1988) · Seigfried-Spellar (2016) · Endrass et al. (2009) · Voon et al. (2014) · Kühn &amp; Gallinat (2014) · Wright et al. (2017) · Wilson, Your Brain on Porn (2014)</p>
                <p className="d">This tool is not a substitute for professional medical or psychological help. If you are in crisis, please contact a healthcare provider.</p>
                <p className="p">Your answers are completely anonymous. No personal data, cookies, or IP addresses are collected.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
