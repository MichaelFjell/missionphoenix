import { useState, useMemo } from 'react';
import { pickDeterministicQuote, pickRandomQuote } from './quotes.js';

// ==== TIERS ====
const TIERS = [
  {
    min: 0, max: 2, name: 'KINDLING',
    brief: 'The fire is lit. Withdrawal is steepest here.',
    brain: "Your brain is flooded with cravings as it searches for the stimulus it was trained to expect. This is withdrawal. It is loudest now and it will never be this loud again. Every hour you hold steady, dopamine receptors that were numbed by overuse begin their slow walk back toward normal sensitivity.",
  },
  {
    min: 3, max: 6, name: 'FIRST FIRE',
    brief: 'Short but real. The first structural change.',
    brain: "Acute withdrawal peaks around day three to four, then begins to ease. Your reward circuit is recalibrating. The cue reactivity, those sudden urges triggered by images or memories, is still strong, but your prefrontal cortex is starting to reassert executive control when you refuse to act.",
  },
  {
    min: 7, max: 13, name: 'THE BREAK',
    brief: 'The first week clean. Identity begins to shift.',
    brain: "One week of non-use allows dopamine receptors to begin partial upregulation. You may experience a flatline, emotions muted, libido low, motivation thin. This is not relapse prevention theater, it is real neural pruning. The pathways you stopped using are weakening.",
  },
  {
    min: 14, max: 29, name: 'THE TURN',
    brief: 'Two weeks in. The body is healing on its own now.',
    brain: "By day fourteen, sleep quality often normalizes and baseline dopamine begins to stabilize. Gray matter changes from chronic use start to reverse. The prefrontal cortex, the seat of long-term thinking and impulse control, begins to regain its rightful authority over the limbic system.",
  },
  {
    min: 30, max: 59, name: 'FORGING',
    brief: 'A month. The new pattern is becoming the default.',
    brain: "At thirty days, you have crossed the first real neuroplastic threshold. Old pathways are measurably quieter. New pathways, the ones you have been building through training, social contact, real intimacy, meaningful work, are consolidating into genuine defaults. You are no longer a man white-knuckling abstinence. You are becoming a man with a different wiring.",
  },
  {
    min: 60, max: 89, name: 'THE WARRIOR',
    brief: 'Two months. Real structural change is visible now.',
    brain: "By day sixty, studies on similar behavioral recoveries suggest substantial normalization of reward sensitivity. What used to feel flat, real conversation, sunlight, training, the natural arc of desire for a real partner, begins to feel vivid again. This is not placebo. This is the brain coming back online.",
  },
  {
    min: 90, max: 179, name: 'THE CLIMB',
    brief: 'Three months. The old self is receding.',
    brain: "Ninety days is a clinically recognized threshold in most behavioral recoveries. The cravings have not vanished, but they arrive less often and pass faster. The neural real estate once occupied by compulsive circuits is being rewired toward the identity and mission you are actually choosing.",
  },
  {
    min: 180, max: 364, name: 'ASCENT',
    brief: 'Six months. The work is compounding now.',
    brain: "Half a year of sustained non-use produces deep structural change. The default mode network, your brain's background hum when you are not actively thinking, has rewired. You think about this less. You are not suppressing it. It is simply no longer the first road your mind travels.",
  },
  {
    min: 365, max: 729, name: 'REBORN',
    brief: 'A year. The man who started is no longer the man still walking.',
    brain: "One year is not a finish line. It is an anniversary. By now the old pathways have grown dusty from disuse. You do not have to consciously reject what once ruled you. You have simply become someone to whom it no longer speaks with the same voice.",
  },
  {
    min: 730, max: 99999, name: 'PHOENIX',
    brief: 'Two years and beyond. The mission is the life.',
    brain: "At this point the science gets quiet, because the science is about the pathology. You are the control group now. You are what recovery looks like after it is no longer a recovery but simply how you live.",
  },
];

function getTier(days) {
  return TIERS.find(t => days >= t.min && days <= t.max) || TIERS[0];
}
function getNextTier(days) {
  const current = getTier(days);
  const idx = TIERS.indexOf(current);
  return TIERS[idx + 1] || null;
}

const MILESTONES = [
  { day: 1, label: 'First day' },
  { day: 7, label: 'One week' },
  { day: 14, label: 'Two weeks' },
  { day: 30, label: 'One month' },
  { day: 60, label: 'Two months' },
  { day: 90, label: 'Three months' },
  { day: 180, label: 'Six months' },
  { day: 365, label: 'One year' },
  { day: 730, label: 'Two years' },
];

function ds(date) { return date.toISOString().slice(0, 10); }

function MiniCalendar({ checkedDates, onToggleDate }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; }, []);
  const todayStr = ds(today);
  const checkedSet = useMemo(() => new Set(checkedDates), [checkedDates]);

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const monthName = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const { cells, leadingBlanks, trailingBlanks } = useMemo(() => {
    const firstOfMonth = new Date(view.year, view.month, 1);
    const lastOfMonth = new Date(view.year, view.month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const arr = [];
    for (let day = 1; day <= daysInMonth; day++) {
      arr.push(new Date(view.year, view.month, day, 12, 0, 0));
    }
    const totalUsed = leadingBlanks + daysInMonth;
    const trailingBlanks = (7 - (totalUsed % 7)) % 7;
    return { cells: arr, leadingBlanks, trailingBlanks };
  }, [view]);

  const isCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth();
  const canNext = !isCurrentMonth;

  const goPrev = () => {
    const d = new Date(view.year, view.month - 1, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };
  const goNext = () => {
    if (!canNext) return;
    const d = new Date(view.year, view.month + 1, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };
  const goToday = () => setView({ year: today.getFullYear(), month: today.getMonth() });

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="jc-wrap">
      <div className="jc-header">
        <button onClick={goPrev} className="jc-nav" aria-label="Previous month">‹</button>
        <div className="jc-mcenter">
          <span className="jc-mlab">{monthName}</span>
          {!isCurrentMonth && <button onClick={goToday} className="jc-today">Today</button>}
        </div>
        <button onClick={goNext} disabled={!canNext} className="jc-nav" aria-label="Next month">›</button>
      </div>
      <div className="jc-hint">Tap a past day to backfill or unmark</div>
      <div className="jc-weekdays">
        {weekdays.map((w, i) => <div key={i} className="jc-wd">{w}</div>)}
      </div>
      <div className="jc-grid">
        {Array.from({ length: leadingBlanks }).map((_, i) => <div key={'lb' + i} className="jc-blank" />)}
        {cells.map((d, i) => {
          const s = ds(d);
          const isFuture = s > todayStr;
          const isToday = s === todayStr;
          const isChecked = checkedSet.has(s);
          const dayNum = d.getDate();
          const cls = ['jc-cell'];
          if (isChecked) cls.push('on');
          if (isFuture) cls.push('future');
          if (isToday) cls.push('today');
          return (
            <button
              key={i}
              onClick={() => !isFuture && onToggleDate && onToggleDate(s, isChecked)}
              disabled={isFuture}
              title={d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + (isChecked ? ' — logged' : '')}
              className={cls.join(' ')}
            >
              {dayNum}
            </button>
          );
        })}
        {Array.from({ length: trailingBlanks }).map((_, i) => <div key={'tb' + i} className="jc-blank" />)}
      </div>
      <div className="jc-legend">
        <span><span className="jc-sw on" /> Logged</span>
        <span><span className="jc-sw" /> Missed</span>
        <span><span className="jc-sw ring" /> Today</span>
      </div>
    </div>
  );
}

function QuoteCard({ quote, onClose }) {
  return (
    <div className="jq-overlay" onClick={onClose}>
      <div className="jq-box" onClick={e => e.stopPropagation()}>
        <div className="jq-lab">For today</div>
        <blockquote className="jq-text">&ldquo;{quote.text}&rdquo;</blockquote>
        {quote.source && <div className="jq-src">— {quote.source}</div>}
        <button onClick={onClose} className="jq-dismiss">Continue</button>
      </div>
    </div>
  );
}

function NotePrompt({ onSave, onSkip }) {
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  return (
    <div className="jn-overlay" onClick={onSkip}>
      <div className="jn-box" onClick={e => e.stopPropagation()}>
        <div className="jn-title">Add a note for today?</div>
        <p className="jn-desc">Write a quick reflection — what triggered you, how you got through it, a win. Optional, and you can mark it public to share in the community feed.</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's on your mind today?"
          className="jn-ta input"
          maxLength={1000}
          autoFocus
        />
        <div className="jn-charcount">{text.length}/1000</div>
        <div className="jn-row">
          <label>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /> Share publicly in community
          </label>
        </div>
        <div className="jn-actions">
          <button onClick={() => onSave(text, isPublic)} disabled={!text.trim()} className="jn-save">Save note</button>
          <button onClick={onSkip} className="jn-skip">Skip</button>
        </div>
      </div>
    </div>
  );
}

export default function Journey({
  daysClean,
  checkedDates = [],
  onCheckToday,
  isTodayChecked,
  showQuote,
  dismissQuote,
  todayQuote,
  showNotePrompt,
  onSaveNote,
  onSkipNote,
  recentNotes = [],
  onToggleDate,
}) {
  const tier = useMemo(() => getTier(daysClean), [daysClean]);
  const nextTier = useMemo(() => getNextTier(daysClean), [daysClean]);
  const tierIdx = TIERS.indexOf(tier);
  const tierProgress = tier.max === 99999 ? 1 : (daysClean - tier.min) / (tier.max - tier.min + 1);
  const phoenixGrowth = Math.min(1, (tierIdx + tierProgress) / TIERS.length);

  return (
    <>
      <style>{`
        .j-root{margin-top:8px;padding-bottom:40px;}
        .j-header{text-align:center;padding:40px 0 32px;border-top:1px solid var(--line);margin-top:32px;}
        .j-phx{position:relative;width:120px;height:120px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;}
        .j-phx-glow{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle, var(--copper) 0%, transparent 70%);filter:blur(30px);}
        .j-phx img{width:100px;height:100px;position:relative;z-index:1;transition:all .6s ease;background:var(--copper);-webkit-mask:url(/phoenix.png) center/contain no-repeat;mask:url(/phoenix.png) center/contain no-repeat;}
        .j-days{font-size:clamp(72px,15vw,120px);font-weight:800;color:var(--copper);line-height:1;letter-spacing:-0.04em;margin-bottom:12px;}
        .j-days-label{font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--ink-3);margin-bottom:28px;}
        .j-tier-line{width:40px;height:2px;background:var(--copper);margin:20px auto;border-radius:2px;}
        .j-tier-name{font-size:18px;font-weight:800;letter-spacing:6px;color:var(--copper);text-transform:uppercase;}
        .j-tier-brief{font-size:15.5px;font-style:italic;color:var(--ink-2);margin:12px auto 0;max-width:440px;line-height:1.6;}

        .j-checkwrap{text-align:center;padding:8px 0 32px;}
        .j-check{display:inline-block;font-size:13px;font-weight:700;letter-spacing:3px;padding:16px 40px;background:var(--copper);color:var(--card);border:none;border-radius:999px;cursor:pointer;text-transform:uppercase;font-family:inherit;transition:all .2s;}
        .j-check:hover:not(:disabled){background:var(--copper-2,#8a3a1a);transform:translateY(-1px);}
        .j-check:disabled{background:transparent;color:var(--copper);border:1px solid var(--copper);cursor:default;opacity:0.7;}
        .j-check-hint{font-size:13px;color:var(--ink-3);margin-top:14px;font-style:italic;}

        .j-section{padding:36px 0;border-top:1px solid var(--line);}
        .j-slab{font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--ink-3);margin-bottom:20px;}
        .j-brain{font-size:16.5px;line-height:1.8;color:var(--ink-2);margin:0;}

        .j-stats{display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:16px;}
        .j-stat{text-align:center;padding:24px 16px;background:var(--card);border:1px solid var(--line);border-radius:14px;}
        .j-stat-num{font-size:36px;font-weight:800;color:var(--copper);line-height:1;}
        .j-stat-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--ink-3);text-transform:uppercase;margin-top:10px;}

        .j-pw{display:flex;flex-direction:column;gap:14px;margin-bottom:18px;}
        .j-pw-row{display:grid;grid-template-columns:120px 1fr 180px;gap:14px;align-items:center;}
        .j-pw-label{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--ink-2);text-transform:uppercase;}
        .j-pw-bar{height:8px;background:var(--line);border-radius:4px;overflow:hidden;}
        .j-pw-fill{height:100%;transition:width .8s ease;border-radius:4px;}
        .j-pw-hint{font-size:12px;color:var(--ink-3);font-style:italic;}
        .j-pw-cap{font-size:14px;color:var(--ink-2);line-height:1.7;margin:0;}
        @media (max-width:640px){ .j-pw-row{grid-template-columns:1fr;gap:4px;} .j-pw-hint{text-align:left;} }

        .j-ms{display:flex;flex-direction:column;gap:4px;}
        .j-ms-item{display:flex;align-items:center;gap:18px;padding:10px 0;}
        .j-ms-dot{width:14px;height:14px;border-radius:50%;border:1px solid;flex-shrink:0;transition:all .3s;}
        .j-ms-text{display:flex;gap:20px;align-items:baseline;flex-wrap:wrap;}
        .j-ms-day{font-size:12px;font-weight:700;letter-spacing:3px;min-width:80px;text-transform:uppercase;}
        .j-ms-label{font-size:15px;}
        .j-next{font-size:14px;color:var(--ink-3);margin-top:20px;font-style:italic;}
        .j-next b{color:var(--copper);letter-spacing:3px;font-size:13px;text-transform:uppercase;font-weight:800;font-style:normal;}

        .j-jhead{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:8px;}
        .j-jcount{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--ink-3);text-transform:uppercase;}
        .j-jempty{font-size:15px;color:var(--ink-3);font-style:italic;line-height:1.7;margin:0;}
        .j-jlist{display:flex;flex-direction:column;gap:12px;}
        .j-jentry{padding:18px 22px;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;}
        .j-jehead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px;flex-wrap:wrap;}
        .j-jdate{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}
        .j-jbadge{font-size:9.5px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:999px;text-transform:uppercase;}
        .j-jbadge.pub{background:var(--copper);color:var(--card);}
        .j-jbadge.priv{background:transparent;color:var(--ink-3);border:1px solid var(--line-2);}
        .j-jtext{font-size:14.5px;line-height:1.7;color:var(--ink-2);margin:0;font-style:italic;white-space:pre-wrap;}

        /* Calendar */
        .jc-wrap{margin-top:4px;}
        .jc-header{display:grid;grid-template-columns:40px 1fr 40px;align-items:center;margin-bottom:6px;}
        .jc-nav{font-size:20px;background:transparent;color:var(--copper);border:1px solid var(--line);border-radius:8px;cursor:pointer;padding:4px 0;line-height:1;font-family:inherit;}
        .jc-nav:disabled{opacity:0.25;cursor:default;}
        .jc-nav:hover:not(:disabled){background:var(--copper-soft);}
        .jc-mcenter{display:flex;align-items:center;justify-content:center;gap:12px;}
        .jc-mlab{font-size:13px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}
        .jc-today{font-size:10px;font-weight:700;letter-spacing:2px;background:transparent;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;cursor:pointer;padding:3px 10px;text-transform:uppercase;font-family:inherit;}
        .jc-hint{font-size:13px;color:var(--ink-3);font-style:italic;text-align:center;margin-bottom:12px;}
        .jc-weekdays{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px;}
        .jc-wd{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--ink-3);text-align:center;}
        .jc-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;}
        .jc-blank{aspect-ratio:1/1;}
        .jc-cell{aspect-ratio:1/1;font-size:12px;font-weight:600;padding:0;outline:none;transition:all .15s;display:flex;align-items:center;justify-content:center;background:var(--line);color:var(--ink-2);border:1px solid transparent;border-radius:6px;cursor:pointer;font-family:inherit;}
        .jc-cell:hover:not(:disabled){transform:scale(1.08);border-color:var(--copper);}
        .jc-cell.on{background:var(--copper);color:var(--card);border-color:var(--copper);}
        .jc-cell.future{opacity:0.3;cursor:default;background:transparent;border:1px dashed var(--line-2);color:var(--ink-3);}
        .jc-cell.today{box-shadow:0 0 0 2px var(--copper);}
        .jc-legend{display:flex;gap:16px;margin-top:14px;flex-wrap:wrap;font-size:11px;color:var(--ink-3);justify-content:center;}
        .jc-legend > span{display:inline-flex;align-items:center;gap:6px;}
        .jc-sw{width:12px;height:12px;border-radius:3px;display:inline-block;background:var(--line);}
        .jc-sw.on{background:var(--copper);}
        .jc-sw.ring{background:var(--card);box-shadow:0 0 0 2px var(--copper);}

        /* Quote overlay */
        .jq-overlay{position:fixed;inset:0;background:rgba(29,25,21,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;padding:24px;}
        .jq-box{max-width:560px;width:100%;background:var(--card);border:1px solid var(--copper);border-radius:20px;padding:48px 40px;text-align:center;}
        .jq-lab{font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--copper);margin-bottom:20px;}
        .jq-text{font-size:20px;line-height:1.55;font-weight:500;font-style:italic;color:var(--ink);margin:0 0 16px 0;}
        .jq-src{font-size:13px;color:var(--ink-3);margin-bottom:24px;letter-spacing:2px;}
        .jq-dismiss{font-size:12px;font-weight:700;letter-spacing:3px;padding:12px 32px;background:var(--copper);color:var(--card);border:none;border-radius:999px;cursor:pointer;text-transform:uppercase;font-family:inherit;}

        /* Note prompt overlay */
        .jn-overlay{position:fixed;inset:0;background:rgba(29,25,21,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;padding:24px;}
        .jn-box{max-width:560px;width:100%;background:var(--card);border:1px solid var(--copper);border-radius:14px;padding:32px;}
        .jn-title{font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--copper);margin-bottom:12px;text-align:center;}
        .jn-desc{font-size:14.5px;color:var(--ink-2);line-height:1.65;margin-bottom:14px;text-align:center;}
        .jn-ta{width:100%;min-height:140px;resize:vertical;}
        .jn-charcount{font-size:11px;color:var(--ink-3);text-align:right;margin-top:4px;margin-bottom:12px;}
        .jn-row{margin:12px 0;}
        .jn-row label{font-size:13px;color:var(--ink-2);display:flex;align-items:center;gap:8px;cursor:pointer;}
        .jn-actions{display:flex;gap:10px;margin-top:14px;}
        .jn-save{flex:1;font-size:12px;font-weight:700;letter-spacing:3px;padding:12px;background:var(--copper);color:var(--card);border:none;border-radius:8px;cursor:pointer;text-transform:uppercase;font-family:inherit;}
        .jn-save:disabled{opacity:0.3;cursor:default;}
        .jn-skip{font-size:12px;font-weight:700;letter-spacing:3px;padding:12px 20px;background:none;color:var(--ink-3);border:1px solid var(--line-2);border-radius:8px;cursor:pointer;text-transform:uppercase;font-family:inherit;}
      `}</style>
      <div className="j-root">
        {showQuote && todayQuote && <QuoteCard quote={todayQuote} onClose={dismissQuote} />}
        {showNotePrompt && <NotePrompt onSave={onSaveNote} onSkip={onSkipNote} />}

        <div className="j-header">
          <div className="j-phx">
            <div className="j-phx-glow" style={{ opacity: 0.15 + phoenixGrowth * 0.45 }} />
            <img src="/phoenix.png" alt="" style={{ opacity: 0.4 + phoenixGrowth * 0.6 }} />
          </div>
          <div className="j-days">{daysClean}</div>
          <div className="j-days-label">{daysClean === 1 ? 'Day clean' : 'Days clean'}</div>
          <div className="j-tier-line" />
          <div className="j-tier-name">{tier.name}</div>
          <p className="j-tier-brief">{tier.brief}</p>
        </div>

        <div className="j-checkwrap">
          <button onClick={onCheckToday} disabled={isTodayChecked} className="j-check">
            {isTodayChecked ? '✓ Logged today' : 'Log today'}
          </button>
          {!isTodayChecked && <p className="j-check-hint">A new anchor awaits.</p>}
        </div>

        <section className="j-section">
          <div className="j-slab">Recent days</div>
          <MiniCalendar checkedDates={checkedDates} onToggleDate={onToggleDate} />
        </section>

        <section className="j-section">
          <div className="j-slab">What is happening in your brain</div>
          <p className="j-brain">{tier.brain}</p>
        </section>

        <section className="j-section">
          <div className="j-slab">The pathways</div>
          <div className="j-pw">
            <div className="j-pw-row">
              <div className="j-pw-label">Old circuit</div>
              <div className="j-pw-bar">
                <div className="j-pw-fill" style={{ width: `${Math.max(5, 100 - phoenixGrowth * 90)}%`, background: 'var(--line-2)', opacity: 0.6 }} />
              </div>
              <div className="j-pw-hint">Fading with disuse</div>
            </div>
            <div className="j-pw-row">
              <div className="j-pw-label">New circuit</div>
              <div className="j-pw-bar">
                <div className="j-pw-fill" style={{ width: `${10 + phoenixGrowth * 85}%`, background: 'var(--copper)' }} />
              </div>
              <div className="j-pw-hint">Strengthening through action</div>
            </div>
          </div>
          <p className="j-pw-cap">
            Every day clean is a day the old neural pattern goes unused. Every real activity, training, honest conversation, creative work, real bonding, is a signal to your brain that a different pattern is now who you are.
          </p>
        </section>

        <section className="j-section">
          <div className="j-slab">What you have built</div>
          <div className="j-stats">
            <div className="j-stat">
              <div className="j-stat-num">{daysClean}</div>
              <div className="j-stat-label">Days clean</div>
            </div>
            <div className="j-stat">
              <div className="j-stat-num">{checkedDates.length}</div>
              <div className="j-stat-label">Check-ins logged</div>
            </div>
          </div>
        </section>

        <section className="j-section">
          <div className="j-slab">Milestones</div>
          <div className="j-ms">
            {MILESTONES.map((m, i) => {
              const reached = daysClean >= m.day;
              const current = daysClean < m.day && (i === 0 || daysClean >= MILESTONES[i - 1].day);
              return (
                <div key={m.day} className="j-ms-item">
                  <div className="j-ms-dot" style={{
                    background: reached ? 'var(--copper)' : current ? 'var(--card)' : 'var(--line)',
                    borderColor: reached ? 'var(--copper)' : current ? 'var(--copper)' : 'var(--line-2)',
                    boxShadow: current ? '0 0 0 3px rgba(163,70,32,0.2)' : 'none',
                  }} />
                  <div className="j-ms-text">
                    <div className="j-ms-day" style={{ color: reached || current ? 'var(--copper)' : 'var(--ink-3)' }}>Day {m.day}</div>
                    <div className="j-ms-label" style={{ color: reached ? 'var(--ink)' : current ? 'var(--ink-2)' : 'var(--ink-3)', fontWeight: reached ? 600 : 400 }}>{m.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {nextTier && (
            <p className="j-next">
              Next tier: <b>{nextTier.name}</b> at day {nextTier.min}.
            </p>
          )}
        </section>

        <section className="j-section">
          <div className="j-jhead">
            <div className="j-slab" style={{ marginBottom: 0 }}>Your journal</div>
            <span className="j-jcount">{recentNotes.length} {recentNotes.length === 1 ? 'entry' : 'entries'}</span>
          </div>
          {recentNotes.length === 0 ? (
            <p className="j-jempty">
              No entries yet. When you log a day, you can choose to write about it, and optionally share it with the community.
            </p>
          ) : (
            <div className="j-jlist">
              {recentNotes.map((n, i) => (
                <div key={i} className="j-jentry">
                  <div className="j-jehead">
                    <span className="j-jdate">{n.date}</span>
                    <span className={`j-jbadge ${n.isPublic ? 'pub' : 'priv'}`}>
                      {n.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="j-jtext">{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export { getTier, getNextTier, TIERS, MILESTONES, pickDeterministicQuote, pickRandomQuote };
