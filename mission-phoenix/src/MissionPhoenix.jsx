import { useState, useEffect, useRef, useMemo } from "react";

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
    threshold: 11, level: "Severe", color: "#c45a2a", key: "severe",
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
export default function MissionPhoenix() {
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSelections, setMultiSelections] = useState([]);
  const [score, setScore] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(0);
  const [factFading, setFactFading] = useState(false);
  const resultsRef = useRef(null);

  // Pre-shuffle facts for quiz — one per question, stable across re-renders
  const quizFacts = useMemo(() => {
    const shuffled = shuffleArray(QUIZ_FACTS);
    return QUESTIONS.map((_, i) => shuffled[i % shuffled.length]);
  }, []);

  // Pick severity-appropriate result facts
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
    <div style={styles.root}>
      <div style={styles.noise} />

      {/* ALPHA BADGE */}
      <div style={styles.alphaBadge}>ALPHA</div>

      <div style={styles.container}>

        {/* ─── INTRO ─────────────────────────────────── */}
        {phase === "intro" && (
          <div style={{
            ...styles.fadeContainer,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(20px)" : "translateY(0)",
          }}>
            <div style={styles.brandMark}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 4 L28 18 L42 18 L30 26 L34 40 L24 32 L14 40 L18 26 L6 18 L20 18 Z"
                  fill="none" stroke="#c45a2a" strokeWidth="1.5" opacity="0.8" />
                <circle cx="24" cy="24" r="6" fill="#c45a2a" opacity="0.3" />
                <circle cx="24" cy="24" r="2" fill="#c45a2a" />
              </svg>
            </div>
            <h1 style={styles.heroTitle}>MISSION PHOENIX</h1>
            <div style={styles.heroLine} />
            <p style={styles.heroSubtitle}>
              A pornography addiction assessment built by someone who lived it —
              not someone who studied it.
            </p>
            <p style={styles.heroDesc}>
              5 questions. No account needed. No data stored.<br />
              Just honesty with yourself.
            </p>
            <button style={styles.startButton} onClick={handleStart}
              onMouseEnter={e => { e.target.style.background = "#c45a2a"; e.target.style.color = "#0a0a0a"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#c45a2a"; }}>
              BEGIN ASSESSMENT
            </button>
            <p style={styles.disclaimer}>
              This is not a clinical diagnostic tool. It is a wake-up call.
            </p>
          </div>
        )}

        {/* ─── QUIZ ──────────────────────────────────── */}
        {phase === "quiz" && (
          <div style={styles.quizContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <div style={styles.questionCount}>
              {currentQ + 1} / {QUESTIONS.length}
            </div>
            <div
              key={currentQ}
              style={{
                ...styles.questionCard,
                opacity: animating ? 0 : 1,
                transform: animating ? "translateX(40px)" : "translateX(0)",
              }}
            >
              <h2 style={styles.questionText}>{question.question}</h2>
              {question.subtitle && (
                <p style={styles.questionSubtitle}>{question.subtitle}</p>
              )}
              <div style={styles.optionsGrid}>
                {question.options.map((opt) => {
                  const isMulti = question.multi;
                  const isSelected = isMulti
                    ? multiSelections.includes(opt.value)
                    : answers[question.id]?.value === opt.value;

                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(question, opt)}
                      style={{
                        ...styles.optionButton,
                        borderColor: isSelected ? "#c45a2a" : "#2a2a2a",
                        background: isSelected ? "rgba(196,90,42,0.12)" : "rgba(15,15,15,0.8)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.borderColor = "#555";
                          e.target.style.background = "rgba(40,40,40,0.8)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.borderColor = "#2a2a2a";
                          e.target.style.background = "rgba(15,15,15,0.8)";
                        }
                      }}
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
                  style={{
                    ...styles.continueButton,
                    opacity: multiSelections.length === 0 ? 0.3 : 1,
                    cursor: multiSelections.length === 0 ? "default" : "pointer",
                  }}
                >
                  CONTINUE →
                </button>
              )}
            </div>

            {/* ─── RANDOM FACT DURING QUIZ ─── */}
            <div style={{
              ...styles.quizFact,
              opacity: factFading ? 0 : 1,
              transform: factFading ? "translateY(10px)" : "translateY(0)",
            }}>
              <div style={styles.quizFactLabel}>DID YOU KNOW</div>
              <p style={styles.quizFactText}>{currentFact.text}</p>
              {currentFact.source && (
                <p style={styles.quizFactSource}>{currentFact.source}</p>
              )}
            </div>
          </div>
        )}

        {/* ─── RESULTS ───────────────────────────────── */}
        {phase === "results" && (
          <div ref={resultsRef} style={styles.resultsContainer}>

            {/* Severity Assessment */}
            <div style={{
              ...styles.resultSection,
              opacity: resultsRevealed >= 1 ? 1 : 0,
              transform: resultsRevealed >= 1 ? "translateY(0)" : "translateY(30px)",
            }}>
              <div style={styles.severityLabel}>YOUR ASSESSMENT</div>
              <div style={{
                ...styles.severityLevel,
                color: severity.color,
                textShadow: `0 0 40px ${severity.color}44`,
              }}>
                {severity.level}
              </div>
              <div style={styles.scoreBar}>
                <div style={styles.scoreTrack}>
                  <div style={{
                    ...styles.scoreFill,
                    width: `${Math.min((score / 19) * 100, 100)}%`,
                    background: `linear-gradient(90deg, #6b9e6b, #c4a035, #c45a2a, #b82030)`,
                  }} />
                </div>
                <div style={styles.scoreLabels}>
                  <span style={{ color: "#6b9e6b" }}>Low</span>
                  <span style={{ color: "#c4a035" }}>Moderate</span>
                  <span style={{ color: "#c45a2a" }}>Severe</span>
                  <span style={{ color: "#b82030" }}>Critical</span>
                </div>
              </div>
              <p style={styles.severityMessage}>{severity.message}</p>
            </div>

            {/* Severity-Specific Research Facts */}
            <div style={{
              ...styles.resultSection,
              opacity: resultsRevealed >= 2 ? 1 : 0,
              transform: resultsRevealed >= 2 ? "translateY(0)" : "translateY(30px)",
            }}>
              <h3 style={styles.sectionTitle}>WHAT THE RESEARCH SAYS ABOUT YOUR LEVEL</h3>
              <div style={styles.researchFacts}>
                {resultFacts.map((fact, i) => (
                  <div key={i} style={{
                    ...styles.researchFactItem,
                    opacity: resultsRevealed >= 3 + i ? 1 : 0,
                    transform: resultsRevealed >= 3 + i ? "translateY(0)" : "translateY(15px)",
                  }}>
                    <div style={styles.researchFactNumber}>{String(i + 1).padStart(2, "0")}</div>
                    <p style={styles.researchFactText}>{fact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Mechanism — How Your Brain Gets Hijacked */}
            <div style={{
              ...styles.resultSection,
              opacity: resultsRevealed >= 6 ? 1 : 0,
              transform: resultsRevealed >= 6 ? "translateY(0)" : "translateY(30px)",
            }}>
              <div style={styles.edCallout}>
                <h3 style={styles.edTitle}>HOW YOUR BRAIN GETS HIJACKED</h3>
                <p style={styles.edText}>
                  Dopamine isn't your pleasure chemical — it's your seeking chemical. It doesn't say
                  "that was satisfying." It says "more, different, keep going." Pornography exploits
                  this by offering infinite novelty at zero effort.
                </p>
                <p style={styles.edText}>
                  When you chronically overstimulate this system, your brain protects itself by
                  reducing dopamine sensitivity. Now you need more extreme content to feel the same
                  thing. This is the same tolerance mechanism behind cocaine and methamphetamine addiction —
                  confirmed by brain imaging studies at Cambridge University and the Max Planck Institute.
                </p>
                <p style={styles.edText}>
                  Meanwhile, your prefrontal cortex — the part that says "this is wrong, stop" —
                  gets overridden by the hijacked reward system. The moral reasoning is still there.
                  That's why you feel disgusted afterward. But in the moment, the dopamine drive
                  literally suppresses your ability to apply those values.
                </p>
                <p style={styles.edTextBold}>
                  This is not a character flaw. It is a neurological process. And it is reversible.
                </p>
              </div>
            </div>

            {/* Escalation Warning */}
            <div style={{
              ...styles.resultSection,
              opacity: resultsRevealed >= 7 ? 1 : 0,
              transform: resultsRevealed >= 7 ? "translateY(0)" : "translateY(30px)",
            }}>
              <div style={styles.escalationSection}>
                <h3 style={styles.sectionTitle}>THE ESCALATION PATTERN</h3>
                <p style={styles.escalationIntro}>
                  Research confirms what thousands of recovering users already know: porn use escalates.
                  Not because you're broken — because your brain adapts. It demands more extreme stimuli
                  to produce the same neurochemical response.
                </p>
                <div style={styles.escalationFact}>
                  <div style={styles.escalationDash}>—</div>
                  <p style={styles.escalationText}>
                    Earlier onset of pornography use is the strongest predictor of escalation to deviant content.
                    The younger you started, the deeper the wiring.
                  </p>
                </div>
                <div style={styles.escalationFact}>
                  <div style={styles.escalationDash}>—</div>
                  <p style={styles.escalationText}>
                    Users consistently report arriving at content that previously disgusted them — genres
                    they never sought, fantasies that conflict with their values and identity.
                  </p>
                </div>
                <div style={styles.escalationFact}>
                  <div style={styles.escalationDash}>—</div>
                  <p style={styles.escalationText}>
                    A meta-analysis of 50 studies with over 50,000 participants confirmed that pornography
                    consumption is associated with lower sexual and relational satisfaction — across every
                    study type: cross-sectional, longitudinal, and experimental.
                  </p>
                </div>
                <p style={styles.escalationWarning}>
                  If you have found yourself watching content that would have disgusted you a year ago,
                  you are not a deviant. You are experiencing a predictable neurological process — one
                  that over 60 peer-reviewed studies have documented. And it will continue escalating
                  until you stop feeding it.
                </p>
              </div>
            </div>

            {/* Recovery Timeline */}
            <div style={{
              ...styles.resultSection,
              opacity: resultsRevealed >= 8 ? 1 : 0,
              transform: resultsRevealed >= 8 ? "translateY(0)" : "translateY(30px)",
            }}>
              <h3 style={styles.sectionTitle}>WHAT HAPPENS WHEN YOU STOP</h3>
              <div style={styles.timeline}>
                {BENEFITS.map((b, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineDot}>
                      <div style={styles.timelineDotInner} />
                    </div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineTime}>{b.timeframe}</div>
                      <div style={styles.timelineTitle}>{b.title}</div>
                      <div style={styles.timelineDesc}>{b.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA — Discord */}
            <div style={{
              ...styles.resultSection,
              opacity: resultsRevealed >= 9 ? 1 : 0,
              transform: resultsRevealed >= 9 ? "translateY(0)" : "translateY(30px)",
            }}>
              <div style={styles.ctaSection}>
                <h3 style={styles.ctaTitle}>THIS IS YOUR MOMENT OF CLARITY</h3>
                <p style={styles.ctaText}>
                  You're reading this because some part of you already knows. Hope alone won't save
                  you — I tried that for 20 years. What works is finding the one consequence you fear
                  more than the craving. That fear becomes your weapon.
                </p>
                <p style={styles.ctaAuthor}>
                  — Michael, 41. Cold turkey from daily amphetamines, benzos, weed, and porn.
                  <br />
                  <span style={{ color: "#777", fontSize: "13px" }}>
                    July 15, 2025. Couldn't run 100 meters. Ran 5K in 23:38 by December.
                  </span>
                </p>

                <div style={styles.ctaButtons}>
                  <a
                    href="https://discord.com/invite/tXnBUSbq92"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.primaryCta}
                    onMouseEnter={e => { e.target.style.background = "#c45a2a"; e.target.style.color = "#0a0a0a"; }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#c45a2a"; }}
                  >
                    JOIN THE COMMUNITY — FREE
                  </a>
                  <p style={styles.ctaSub}>
                    Private Discord server. Men recovering together.<br />
                    No judgment. No cost. Just accountability.
                  </p>
                </div>

                <button onClick={handleRestart} style={styles.restartBtn}>
                  ← Take assessment again
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <div style={styles.footerLine} />
              <p style={styles.footerText}>
                MISSION PHOENIX — ALPHA
              </p>
              <p style={styles.footerSources}>
                Research cited: Zillmann & Bryant (1988) · Seigfried-Spellar (2016) · Endrass et al. (2009) ·
                Voon et al. (2014) · Kühn & Gallinat (2014) · Wright et al. (2017) · Wilson, Your Brain on Porn (2014)
              </p>
              <p style={styles.footerDisclaimer}>
                This tool is not a substitute for professional medical or psychological help.
                If you are in crisis, please contact a healthcare provider.
              </p>
              <p style={styles.footerPrivacy}>
                Your answers are completely anonymous. No personal data, cookies, or IP
                addresses are collected.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#d4d0c8",
    fontFamily: "'EB Garamond', 'Garamond', 'Georgia', serif",
    position: "relative",
    overflow: "hidden",
  },
  noise: {
    position: "fixed",
    inset: 0,
    background: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.008) 2px,
      rgba(255,255,255,0.008) 4px
    )`,
    pointerEvents: "none",
    zIndex: 0,
  },
  alphaBadge: {
    position: "fixed",
    top: "16px",
    right: "16px",
    fontFamily: "'Oswald', 'Impact', 'Arial Narrow', sans-serif",
    fontSize: "10px",
    letterSpacing: "3px",
    padding: "4px 12px",
    border: "1px solid #333",
    color: "#555",
    background: "rgba(10,10,10,0.9)",
    zIndex: 10,
  },
  container: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "60px 24px",
    position: "relative",
    zIndex: 1,
  },
  brandMark: {
    marginBottom: "32px",
    opacity: 0.8,
  },
  fadeContainer: {
    transition: "opacity 0.4s ease, transform 0.4s ease",
  },
  heroTitle: {
    fontFamily: "'Oswald', 'Impact', 'Arial Narrow', sans-serif",
    fontSize: "clamp(36px, 8vw, 56px)",
    fontWeight: 400,
    letterSpacing: "8px",
    color: "#e8e4dc",
    margin: "0 0 16px 0",
    lineHeight: 1.1,
  },
  heroLine: {
    width: "60px",
    height: "1px",
    background: "#c45a2a",
    margin: "0 0 32px 0",
  },
  heroSubtitle: {
    fontSize: "19px",
    lineHeight: 1.7,
    color: "#999",
    margin: "0 0 16px 0",
    maxWidth: "520px",
    fontStyle: "italic",
  },
  heroDesc: {
    fontSize: "15px",
    lineHeight: 1.8,
    color: "#666",
    margin: "0 0 48px 0",
  },
  startButton: {
    fontFamily: "'Oswald', 'Impact', 'Arial Narrow', sans-serif",
    fontSize: "15px",
    letterSpacing: "4px",
    padding: "16px 40px",
    background: "transparent",
    color: "#c45a2a",
    border: "1px solid #c45a2a",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "block",
    marginBottom: "32px",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#444",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "'Oswald', sans-serif",
  },

  // Quiz
  quizContainer: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  progressBar: {
    height: "2px",
    background: "#1a1a1a",
    marginBottom: "12px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#c45a2a",
    transition: "width 0.5s ease",
  },
  questionCount: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "12px",
    letterSpacing: "4px",
    color: "#555",
    marginBottom: "48px",
  },
  questionCard: {
    transition: "opacity 0.35s ease, transform 0.35s ease",
  },
  questionText: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: "clamp(22px, 5vw, 30px)",
    fontWeight: 400,
    lineHeight: 1.5,
    color: "#e8e4dc",
    margin: "0 0 8px 0",
  },
  questionSubtitle: {
    fontSize: "15px",
    color: "#777",
    fontStyle: "italic",
    margin: "0 0 36px 0",
    lineHeight: 1.6,
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "24px",
  },
  optionButton: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: "17px",
    padding: "18px 24px",
    background: "rgba(15,15,15,0.8)",
    color: "#d4d0c8",
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    lineHeight: 1.4,
  },
  continueButton: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "14px",
    letterSpacing: "3px",
    padding: "14px 32px",
    background: "transparent",
    color: "#c45a2a",
    border: "1px solid #c45a2a",
    cursor: "pointer",
    marginTop: "28px",
    transition: "opacity 0.3s ease",
  },

  // Quiz Fact
  quizFact: {
    marginTop: "48px",
    paddingTop: "32px",
    borderTop: "1px solid #1a1a1a",
    transition: "opacity 0.4s ease, transform 0.4s ease",
  },
  quizFactLabel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "9px",
    letterSpacing: "4px",
    color: "#c45a2a",
    marginBottom: "10px",
    opacity: 0.7,
  },
  quizFactText: {
    fontSize: "14px",
    lineHeight: 1.8,
    color: "#777",
    margin: "0 0 8px 0",
    fontStyle: "italic",
  },
  quizFactSource: {
    fontSize: "11px",
    color: "#3a3a3a",
    margin: 0,
    lineHeight: 1.4,
  },

  // Results
  resultsContainer: {
    paddingTop: "20px",
  },
  resultSection: {
    marginBottom: "64px",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  },
  severityLabel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "11px",
    letterSpacing: "5px",
    color: "#555",
    marginBottom: "12px",
  },
  severityLevel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "clamp(40px, 10vw, 64px)",
    fontWeight: 400,
    letterSpacing: "4px",
    marginBottom: "24px",
    lineHeight: 1,
  },
  scoreBar: {
    marginBottom: "32px",
  },
  scoreTrack: {
    height: "4px",
    background: "#1a1a1a",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  scoreFill: {
    height: "100%",
    transition: "width 1.5s ease",
    borderRadius: "2px",
  },
  scoreLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  severityMessage: {
    fontSize: "18px",
    lineHeight: 1.8,
    color: "#bbb",
    maxWidth: "600px",
  },

  // Research Facts (severity-based results)
  sectionTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "13px",
    letterSpacing: "5px",
    color: "#666",
    marginBottom: "32px",
    fontWeight: 400,
  },
  researchFacts: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  researchFactItem: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    padding: "24px",
    background: "rgba(20,20,20,0.6)",
    border: "1px solid #1a1a1a",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  },
  researchFactNumber: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "28px",
    color: "#c45a2a",
    opacity: 0.4,
    flexShrink: 0,
    lineHeight: 1,
    marginTop: "2px",
  },
  researchFactText: {
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#999",
    margin: 0,
  },

  // Mechanism callout
  edCallout: {
    padding: "36px",
    borderLeft: "2px solid #c45a2a",
    background: "rgba(196,90,42,0.04)",
  },
  edTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "14px",
    letterSpacing: "4px",
    color: "#c45a2a",
    marginTop: 0,
    marginBottom: "20px",
    fontWeight: 400,
  },
  edText: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: "#999",
    margin: "0 0 16px 0",
  },
  edTextBold: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: "#e8e4dc",
    margin: 0,
    fontWeight: 600,
  },

  // Escalation
  escalationSection: {
    padding: "0",
  },
  escalationIntro: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: "#999",
    marginBottom: "28px",
  },
  escalationFact: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
    paddingLeft: "8px",
  },
  escalationDash: {
    color: "#c45a2a",
    fontFamily: "'Oswald', sans-serif",
    fontSize: "18px",
    flexShrink: 0,
    marginTop: "2px",
  },
  escalationText: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#888",
    margin: 0,
  },
  escalationWarning: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: "#ccc",
    marginTop: "28px",
    fontStyle: "italic",
    paddingLeft: "8px",
    borderLeft: "1px solid #333",
  },

  // Timeline
  timeline: {
    position: "relative",
    paddingLeft: "32px",
  },
  timelineItem: {
    position: "relative",
    paddingBottom: "36px",
    borderLeft: "1px solid #222",
    paddingLeft: "28px",
    marginLeft: "6px",
  },
  timelineDot: {
    position: "absolute",
    left: "-7px",
    top: "4px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "1px solid #c45a2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
  },
  timelineDotInner: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#c45a2a",
  },
  timelineContent: {},
  timelineTime: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "11px",
    letterSpacing: "3px",
    color: "#c45a2a",
    marginBottom: "4px",
  },
  timelineTitle: {
    fontSize: "20px",
    color: "#e8e4dc",
    marginBottom: "8px",
    fontWeight: 600,
  },
  timelineDesc: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#888",
  },

  // CTA
  ctaSection: {
    textAlign: "center",
    padding: "48px 0",
    borderTop: "1px solid #1a1a1a",
  },
  ctaTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "clamp(18px, 4vw, 24px)",
    letterSpacing: "5px",
    color: "#e8e4dc",
    marginTop: 0,
    marginBottom: "24px",
    fontWeight: 400,
  },
  ctaText: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: "#999",
    maxWidth: "520px",
    margin: "0 auto 24px",
    fontStyle: "italic",
  },
  ctaAuthor: {
    fontSize: "15px",
    color: "#777",
    lineHeight: 1.6,
    marginBottom: "48px",
  },
  ctaButtons: {
    marginBottom: "36px",
  },
  primaryCta: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "15px",
    letterSpacing: "4px",
    padding: "18px 48px",
    background: "transparent",
    color: "#c45a2a",
    border: "1px solid #c45a2a",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "16px",
  },
  ctaSub: {
    fontSize: "13px",
    color: "#555",
    lineHeight: 1.6,
  },
  restartBtn: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: "14px",
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    padding: "8px",
  },

  // Footer
  footer: {
    textAlign: "center",
    padding: "48px 0 24px",
  },
  footerLine: {
    width: "40px",
    height: "1px",
    background: "#333",
    margin: "0 auto 24px",
  },
  footerText: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "11px",
    letterSpacing: "4px",
    color: "#444",
    marginBottom: "12px",
  },
  footerSources: {
    fontSize: "11px",
    color: "#2a2a2a",
    lineHeight: 1.6,
    maxWidth: "500px",
    margin: "0 auto 16px",
  },
  footerDisclaimer: {
    fontSize: "12px",
    color: "#333",
    lineHeight: 1.6,
    maxWidth: "400px",
    margin: "0 auto 12px",
  },
  footerPrivacy: {
    fontSize: "11px",
    color: "#2a2a2a",
    lineHeight: 1.6,
    maxWidth: "400px",
    margin: "0 auto",
    fontStyle: "italic",
  },
};
