import { useState, useMemo } from 'react';
import { pickDeterministicQuote, pickRandomQuote } from './quotes.js';

// ==== TIERS ====
// Each tier: {days, name, brain description}
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

// Milestones are the tier boundaries plus a couple extras.
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

// Mini calendar: one month at a time with prev/next navigation.
// Click a past unchecked day to backfill it. Click a past checked day to unmark.
// Today is a direct check-in (same as the big button). Future days are disabled.
function MiniCalendar({ checkedDates, onToggleDate }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; }, []);
  const todayStr = ds(today);
  const checkedSet = useMemo(() => new Set(checkedDates), [checkedDates]);

  // Viewed month state
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const monthName = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();

  // Build the cells for this month, Monday-first.
  const { cells, leadingBlanks, trailingBlanks } = useMemo(() => {
    const firstOfMonth = new Date(view.year, view.month, 1);
    const lastOfMonth = new Date(view.year, view.month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    // JS getDay(): 0=Sun..6=Sat. We want Mon=0..Sun=6.
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
  // Don't let you navigate past the current month (nothing to show)
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
    <div style={cal.wrap}>
      <div style={cal.header}>
        <button onClick={goPrev} style={cal.navBtn} aria-label="Previous month">&lsaquo;</button>
        <div style={cal.monthCenter}>
          <span style={cal.monthLabel}>{monthName}</span>
          {!isCurrentMonth && <button onClick={goToday} style={cal.todayBtn}>TODAY</button>}
        </div>
        <button onClick={goNext} disabled={!canNext} style={{ ...cal.navBtn, opacity: canNext ? 1 : 0.25, cursor: canNext ? 'pointer' : 'default' }} aria-label="Next month">&rsaquo;</button>
      </div>
      <div style={cal.hint}>Tap a past day to backfill or unmark</div>
      <div style={cal.weekdays}>
        {weekdays.map((w, i) => <div key={i} style={cal.weekday}>{w}</div>)}
      </div>
      <div style={cal.grid}>
        {Array.from({ length: leadingBlanks }).map((_, i) => <div key={'lb' + i} style={cal.blank} />)}
        {cells.map((d, i) => {
          const s = ds(d);
          const isFuture = s > todayStr;
          const isToday = s === todayStr;
          const isChecked = checkedSet.has(s);
          const dayNum = d.getDate();
          let bg = 'transparent';
          let color = '#3a3a3a';
          let border = '1px solid #1a1a1a';
          if (isFuture) {
            bg = 'transparent'; color = '#242424'; border = '1px dashed #1a1a1a';
          } else if (isChecked) {
            bg = '#c45a2a'; color = '#0a0a0a'; border = '1px solid #c45a2a';
          } else {
            bg = 'rgba(20,20,20,0.6)'; color = '#555'; border = '1px solid #222';
          }
          if (isToday) {
            border = `2px solid ${isChecked ? '#e8e4dc' : '#c45a2a'}`;
          }
          return (
            <button
              key={i}
              onClick={() => !isFuture && onToggleDate && onToggleDate(s, isChecked)}
              disabled={isFuture}
              title={d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + (isChecked ? ' \u2014 logged' : '')}
              style={{ ...cal.cell, background: bg, color, border, cursor: isFuture ? 'default' : 'pointer' }}
            >
              {dayNum}
            </button>
          );
        })}
        {Array.from({ length: trailingBlanks }).map((_, i) => <div key={'tb' + i} style={cal.blank} />)}
      </div>
      <div style={cal.legend}>
        <span style={cal.legendItem}><span style={{ ...cal.legendSwatch, background: '#c45a2a', borderColor: '#c45a2a' }} /> Logged</span>
        <span style={cal.legendItem}><span style={{ ...cal.legendSwatch, background: 'rgba(20,20,20,0.6)', borderColor: '#222' }} /> Missed</span>
        <span style={cal.legendItem}><span style={{ ...cal.legendSwatch, background: 'transparent', borderColor: '#c45a2a' }} /> Today</span>
      </div>
    </div>
  );
}

const cal = {
  wrap: { marginTop: '4px' },
  header: { display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center', marginBottom: '4px' },
  navBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '22px', background: 'transparent', color: '#c45a2a', border: '1px solid #2a2a2a', cursor: 'pointer', padding: '4px 0', lineHeight: 1 },
  monthCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
  monthLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '4px', color: '#c45a2a' },
  todayBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '9px', letterSpacing: '2px', background: 'transparent', color: '#888', border: '1px solid #333', cursor: 'pointer', padding: '3px 8px' },
  hint: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '13px', color: '#555', fontStyle: 'italic', textAlign: 'center', marginBottom: '14px' },
  weekdays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' },
  weekday: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#444', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' },
  blank: { aspectRatio: '1 / 1' },
  cell: { aspectRatio: '1 / 1', fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '1px', padding: 0, outline: 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  legend: { display: 'flex', gap: '18px', marginTop: '14px', flexWrap: 'wrap', fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#666', justifyContent: 'center' },
  legendItem: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
  legendSwatch: { display: 'inline-block', width: '10px', height: '10px', border: '1px solid' },
};

function QuoteCard({ quote, onClose }) {
  return (
    <div style={qs.overlay} onClick={onClose}>
      <div style={qs.card} onClick={e => e.stopPropagation()}>
        <div style={qs.mark}>TODAY'S ANCHOR</div>
        <blockquote style={qs.text}>&ldquo;{quote.text}&rdquo;</blockquote>
        {quote.source ? <div style={qs.source}>{quote.source}</div> : <div style={qs.sourceBlank} />}
        <button onClick={onClose} style={qs.close}>CONTINUE</button>
      </div>
    </div>
  );
}

function NotePrompt({ onSave, onSkip }) {
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  return (
    <div style={ns.overlay} onClick={onSkip}>
      <div style={ns.card} onClick={e => e.stopPropagation()}>
        <div style={ns.mark}>TODAY'S ENTRY</div>
        <p style={ns.prompt}>How did today feel? Any urges? Anything else you want to record.</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write as much or as little as you want. It is your entry."
          style={ns.textarea}
          maxLength={1000}
          autoFocus
        />
        <div style={ns.charCount}>{text.length}/1000</div>
        <div style={ns.shareRow}>
          <button onClick={() => setIsPublic(!isPublic)} style={{ ...ns.toggle, background: isPublic ? '#c45a2a' : '#222', color: isPublic ? '#0a0a0a' : '#888' }}>
            {isPublic ? 'PUBLIC' : 'PRIVATE'}
          </button>
          <span style={ns.shareLabel}>
            {isPublic ? 'Shared anonymously in the community journal' : 'Only visible to you'}
          </span>
        </div>
        <div style={ns.actions}>
          <button onClick={() => onSave(text, isPublic)} disabled={!text.trim()} style={{ ...ns.save, opacity: text.trim() ? 1 : 0.3, cursor: text.trim() ? 'pointer' : 'default' }}>SAVE ENTRY</button>
          <button onClick={onSkip} style={ns.skip}>SKIP</button>
        </div>
      </div>
    </div>
  );
}

const qs = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeIn 0.3s ease' },
  card: { maxWidth: '560px', width: '100%', background: 'linear-gradient(180deg, rgba(30,22,18,0.98), rgba(20,15,12,0.98))', border: '1px solid #c45a2a55', padding: '48px 40px 40px', textAlign: 'center', boxShadow: '0 0 60px rgba(196,90,42,0.15)' },
  mark: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '5px', color: '#c45a2a', marginBottom: '28px' },
  text: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '22px', lineHeight: 1.6, color: '#e8e4dc', margin: '0 0 20px 0', fontStyle: 'italic' },
  source: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '3px', color: '#888', marginBottom: '36px' },
  sourceBlank: { marginBottom: '36px' },
  close: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', padding: '12px 32px', background: 'transparent', color: '#c45a2a', border: '1px solid #c45a2a', cursor: 'pointer' },
};

const ns = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card: { maxWidth: '560px', width: '100%', background: 'linear-gradient(180deg, rgba(30,22,18,0.98), rgba(20,15,12,0.98))', border: '1px solid #c45a2a55', padding: '40px' },
  mark: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '5px', color: '#c45a2a', marginBottom: '16px', textAlign: 'center' },
  prompt: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '17px', lineHeight: 1.6, color: '#b8b3ab', margin: '0 0 20px 0', fontStyle: 'italic', textAlign: 'center' },
  textarea: { width: '100%', fontFamily: "'EB Garamond', Georgia, serif", fontSize: '16px', padding: '16px', background: 'rgba(10,10,10,0.6)', color: '#d4d0c8', border: '1px solid #2a2a2a', outline: 'none', resize: 'vertical', minHeight: '140px', lineHeight: 1.6, boxSizing: 'border-box' },
  charCount: { fontSize: '11px', color: '#333', textAlign: 'right', marginTop: '4px', marginBottom: '16px' },
  shareRow: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' },
  toggle: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', padding: '6px 14px', border: 'none', cursor: 'pointer', minWidth: '80px', fontWeight: 500 },
  shareLabel: { fontSize: '12px', color: '#666' },
  actions: { display: 'flex', gap: '10px' },
  save: { flex: 1, fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '4px', padding: '13px 24px', background: 'transparent', color: '#c45a2a', border: '1px solid #c45a2a' },
  skip: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', padding: '13px 20px', background: 'transparent', color: '#555', border: '1px solid #2a2a2a', cursor: 'pointer' },
};

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

  // Phoenix growth: a value 0..1 mapping tier progression to visual intensity
  const phoenixGrowth = Math.min(1, (tierIdx + tierProgress) / TIERS.length);

  return (
    <div style={js.root}>
      {showQuote && todayQuote && <QuoteCard quote={todayQuote} onClose={dismissQuote} />}
      {showNotePrompt && <NotePrompt onSave={onSaveNote} onSkip={onSkipNote} />}

      {/* Hero: phoenix + day count + tier */}
      <div style={js.hero}>
        <div style={js.phoenixWrap}>
          <div style={{ ...js.phoenixGlow, opacity: 0.15 + phoenixGrowth * 0.45 }} />
          <img src="/phoenix.png" alt="" style={{ ...js.phoenixImg, opacity: 0.4 + phoenixGrowth * 0.6, filter: `brightness(${0.7 + phoenixGrowth * 0.6}) saturate(${0.6 + phoenixGrowth})` }} />
        </div>
        <div style={js.dayNum}>{daysClean}</div>
        <div style={js.daysLabel}>{daysClean === 1 ? 'DAY CLEAN' : 'DAYS CLEAN'}</div>
        <div style={js.tierLine} />
        <div style={js.tierName}>{tier.name}</div>
        <p style={js.tierBrief}>{tier.brief}</p>
      </div>

      {/* Check-in */}
      <div style={js.checkinWrap}>
        <button
          onClick={onCheckToday}
          disabled={isTodayChecked}
          style={{ ...js.checkinBtn, opacity: isTodayChecked ? 0.4 : 1, cursor: isTodayChecked ? 'default' : 'pointer' }}
        >
          {isTodayChecked ? "\u2713  TODAY LOGGED" : 'LOG TODAY'}
        </button>
        {!isTodayChecked && <p style={js.checkinHint}>A new anchor awaits.</p>}
      </div>

      {/* Mini calendar: last 6 weeks, with backfill */}
      <section style={js.section}>
        <div style={js.sectionLabel}>RECENT DAYS</div>
        <MiniCalendar checkedDates={checkedDates} onToggleDate={onToggleDate} />
      </section>

      {/* Brain narrative */}
      <section style={js.section}>
        <div style={js.sectionLabel}>WHAT IS HAPPENING IN YOUR BRAIN</div>
        <p style={js.brainText}>{tier.brain}</p>
      </section>

      {/* Neural pathways visual */}
      <section style={js.section}>
        <div style={js.sectionLabel}>THE PATHWAYS</div>
        <div style={js.pathways}>
          <div style={js.pathwayRow}>
            <div style={js.pathwayLabel}>Old circuit</div>
            <div style={js.pathwayBarWrap}>
              <div style={{ ...js.pathwayBarFill, width: `${Math.max(5, 100 - phoenixGrowth * 90)}%`, background: '#554035', opacity: 0.5 }} />
            </div>
            <div style={js.pathwayHint}>Fading with disuse</div>
          </div>
          <div style={js.pathwayRow}>
            <div style={js.pathwayLabel}>New circuit</div>
            <div style={js.pathwayBarWrap}>
              <div style={{ ...js.pathwayBarFill, width: `${10 + phoenixGrowth * 85}%`, background: '#c45a2a' }} />
            </div>
            <div style={js.pathwayHint}>Strengthening through action</div>
          </div>
        </div>
        <p style={js.pathwayCaption}>
          Every day clean is a day the old neural pattern goes unused. Every real activity, training, honest conversation, creative work, real bonding, is a signal to your brain that a different pattern is now who you are.
        </p>
      </section>

      {/* Stats */}
      <section style={js.section}>
        <div style={js.sectionLabel}>WHAT YOU HAVE BUILT</div>
        <div style={js.stats}>
          <div style={js.stat}>
            <div style={js.statNum}>{daysClean}</div>
            <div style={js.statLabel}>days clean</div>
          </div>
          <div style={js.stat}>
            <div style={js.statNum}>{checkedDates.length}</div>
            <div style={js.statLabel}>check-ins logged</div>
          </div>
        </div>
      </section>

      {/* Milestone timeline */}
      <section style={js.section}>
        <div style={js.sectionLabel}>MILESTONES</div>
        <div style={js.milestones}>
          {MILESTONES.map((m, i) => {
            const reached = daysClean >= m.day;
            const current = daysClean < m.day && (i === 0 || daysClean >= MILESTONES[i - 1].day);
            return (
              <div key={m.day} style={js.milestone}>
                <div style={{ ...js.milestoneDot, background: reached ? '#c45a2a' : current ? '#2a2a2a' : '#141414', borderColor: reached ? '#c45a2a' : current ? '#c45a2a88' : '#222', boxShadow: current ? '0 0 0 3px rgba(196,90,42,0.2)' : 'none' }} />
                <div style={js.milestoneText}>
                  <div style={{ ...js.milestoneDay, color: reached ? '#c45a2a' : current ? '#c45a2a' : '#444' }}>Day {m.day}</div>
                  <div style={{ ...js.milestoneLabel, color: reached ? '#e8e4dc' : current ? '#888' : '#444' }}>{m.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        {nextTier && (
          <p style={js.nextTierText}>
            Next tier: <span style={{ color: '#c45a2a', letterSpacing: '3px', fontFamily: "'Oswald', sans-serif", fontSize: '13px' }}>{nextTier.name}</span> at day {nextTier.min}.
          </p>
        )}
      </section>

      {/* Journal */}
      <section style={js.section}>
        <div style={js.journalHeader}>
          <div style={js.sectionLabel}>YOUR JOURNAL</div>
          <span style={js.journalCount}>{recentNotes.length} {recentNotes.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        {recentNotes.length === 0 ? (
          <p style={js.journalEmpty}>
            No entries yet. When you log a day, you can choose to write about it, and optionally share it with the community.
          </p>
        ) : (
          <div style={js.journalList}>
            {recentNotes.map((n, i) => (
              <div key={i} style={js.journalEntry}>
                <div style={js.journalEntryHeader}>
                  <span style={js.journalDate}>{n.date}</span>
                  <span style={{ ...js.journalBadge, background: n.isPublic ? '#c45a2a' : 'transparent', color: n.isPublic ? '#0a0a0a' : '#555', border: n.isPublic ? 'none' : '1px solid #2a2a2a' }}>
                    {n.isPublic ? 'PUBLIC' : 'PRIVATE'}
                  </span>
                </div>
                <p style={js.journalText}>{n.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const js = {
  root: { maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' },

  hero: { textAlign: 'center', padding: '40px 0 24px', position: 'relative' },
  phoenixWrap: { position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  phoenixGlow: { position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, #c45a2a 0%, transparent 70%)', filter: 'blur(30px)' },
  phoenixImg: { width: '100px', height: 'auto', position: 'relative', zIndex: 1, transition: 'all 0.6s ease' },

  dayNum: { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(72px, 14vw, 120px)', fontWeight: 300, color: '#e8e4dc', lineHeight: 1, letterSpacing: '-2px' },
  daysLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '6px', color: '#888', marginTop: '8px' },
  tierLine: { width: '40px', height: '1px', background: '#c45a2a', margin: '28px auto 20px' },
  tierName: { fontFamily: "'Oswald', sans-serif", fontSize: '18px', letterSpacing: '8px', color: '#c45a2a', fontWeight: 400 },
  tierBrief: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '16px', fontStyle: 'italic', color: '#888', margin: '12px 0 0 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 },

  checkinWrap: { textAlign: 'center', padding: '36px 0' },
  checkinBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '5px', padding: '18px 56px', background: 'transparent', color: '#c45a2a', border: '1px solid #c45a2a', transition: 'all 0.3s' },
  checkinHint: { fontSize: '13px', color: '#555', marginTop: '14px', fontStyle: 'italic' },

  section: { padding: '40px 0', borderTop: '1px solid #1a1a1a' },
  sectionLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '5px', color: '#666', marginBottom: '24px' },

  brainText: { fontSize: '17px', lineHeight: 1.8, color: '#b8b3ab', margin: 0, fontFamily: "'EB Garamond', Georgia, serif" },

  pathways: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  pathwayRow: { display: 'grid', gridTemplateColumns: '120px 1fr 180px', gap: '16px', alignItems: 'center' },
  pathwayLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#999' },
  pathwayBarWrap: { height: '8px', background: 'rgba(20,20,20,0.8)', border: '1px solid #1a1a1a', overflow: 'hidden', position: 'relative' },
  pathwayBarFill: { height: '100%', transition: 'width 0.8s ease' },
  pathwayHint: { fontSize: '12px', color: '#555', fontStyle: 'italic' },
  pathwayCaption: { fontSize: '14px', color: '#777', lineHeight: 1.7, margin: 0, fontFamily: "'EB Garamond', Georgia, serif" },

  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' },
  stat: { textAlign: 'center', padding: '24px 16px', border: '1px solid #1a1a1a', background: 'rgba(15,15,15,0.4)' },
  statNum: { fontFamily: "'Oswald', sans-serif", fontSize: '36px', fontWeight: 300, color: '#c45a2a', lineHeight: 1 },
  statLabel: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '3px', color: '#777', marginTop: '10px' },

  milestones: { display: 'flex', flexDirection: 'column', gap: '4px' },
  milestone: { display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 0' },
  milestoneDot: { width: '14px', height: '14px', borderRadius: '50%', border: '1px solid', flexShrink: 0, transition: 'all 0.3s' },
  milestoneText: { display: 'flex', gap: '20px', alignItems: 'baseline' },
  milestoneDay: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '3px', minWidth: '80px' },
  milestoneLabel: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: '15px' },
  nextTierText: { fontSize: '14px', color: '#666', marginTop: '20px', fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic' },

  journalHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' },
  journalCount: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '2px', color: '#555' },
  journalEmpty: { fontSize: '15px', color: '#666', fontStyle: 'italic', fontFamily: "'EB Garamond', Georgia, serif", lineHeight: 1.7, margin: 0 },
  journalList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  journalEntry: { padding: '20px 22px', background: 'rgba(15,15,15,0.4)', borderLeft: '2px solid #c45a2a33' },
  journalEntryHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  journalDate: { fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#c45a2a' },
  journalBadge: { fontFamily: "'Oswald', sans-serif", fontSize: '9px', letterSpacing: '2px', padding: '3px 10px' },
  journalText: { fontSize: '15px', lineHeight: 1.7, color: '#b8b3ab', margin: 0, fontFamily: "'EB Garamond', Georgia, serif", whiteSpace: 'pre-wrap' },
};

// Export helpers for the main Tracker to wire into real Supabase data
export { getTier, getNextTier, TIERS, MILESTONES, pickDeterministicQuote, pickRandomQuote };
