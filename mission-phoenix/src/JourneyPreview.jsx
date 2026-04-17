import { useState } from 'react';
import Journey from './Journey.jsx';
import { pickDeterministicQuote } from './quotes.js';

// Preview wrapper. Simulates a user with fake data so the Journey view can
// be viewed without Supabase auth. The slider at top lets you scrub
// through different day counts to see how the view evolves.
export default function JourneyPreview() {
  const [daysClean, setDaysClean] = useState(47);
  const [isTodayChecked, setIsTodayChecked] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [todayQuote, setTodayQuote] = useState(null);
  const [showNotePrompt, setShowNotePrompt] = useState(false);
  // Let the preview scrub around missed days: store real checked dates so the
  // mini calendar renders gaps you can click.
  const [extraChecks, setExtraChecks] = useState(new Set());
  const [removedChecks, setRemovedChecks] = useState(new Set());

  const [recentNotes, setRecentNotes] = useState([
    { date: '15 APR', text: 'Slept badly last night. Felt restless but walked it off. Training in the evening helped a lot.', isPublic: true },
    { date: '13 APR', text: 'Long day at work. Had a brief urge scrolling through instagram on the couch. Closed the app, went outside instead.', isPublic: true },
    { date: '11 APR', text: "Great day. Met with Erik for coffee, had a real conversation about the mission. Feeling anchored.", isPublic: false },
  ]);

  const checkedDates = (() => {
    const base = Array.from({ length: daysClean }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const set = new Set(base);
    extraChecks.forEach(d => set.add(d));
    removedChecks.forEach(d => set.delete(d));
    return Array.from(set);
  })();

  const handleToggleDate = (dateStr, isChecked) => {
    if (isChecked) {
      setRemovedChecks(new Set([...removedChecks, dateStr]));
      setExtraChecks(new Set([...extraChecks].filter(d => d !== dateStr)));
    } else {
      setExtraChecks(new Set([...extraChecks, dateStr]));
      setRemovedChecks(new Set([...removedChecks].filter(d => d !== dateStr)));
    }
  };

  const handleCheckToday = () => {
    setIsTodayChecked(true);
    setDaysClean(daysClean + 1);
    const todayKey = new Date().toISOString().slice(0, 10);
    setTodayQuote(pickDeterministicQuote(todayKey + '_' + Math.random()));
    setShowQuote(true);
  };

  const dismissQuote = () => {
    setShowQuote(false);
    setShowNotePrompt(true);
  };

  const handleSaveNote = (text, isPublic) => {
    const today = new Date();
    const dateLabel = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
    setRecentNotes([{ date: dateLabel, text, isPublic }, ...recentNotes]);
    setShowNotePrompt(false);
  };

  const handleSkipNote = () => setShowNotePrompt(false);

  const reset = () => {
    setIsTodayChecked(false);
    setShowQuote(false);
    setTodayQuote(null);
    setShowNotePrompt(false);
  };

  return (
    <div>
      {/* Preview controls */}
      <div style={c.bar}>
        <div style={c.label}>PREVIEW SCRUB</div>
        <input
          type="range"
          min="0"
          max="800"
          value={daysClean}
          onChange={e => { setDaysClean(parseInt(e.target.value)); setIsTodayChecked(false); }}
          style={c.slider}
        />
        <div style={c.dayDisplay}>Day {daysClean}</div>
        <button onClick={reset} style={c.resetBtn}>RESET STATE</button>
      </div>

      <Journey
        daysClean={daysClean}
        checkedDates={checkedDates}
        onCheckToday={handleCheckToday}
        isTodayChecked={isTodayChecked}
        showQuote={showQuote}
        dismissQuote={dismissQuote}
        todayQuote={todayQuote}
        showNotePrompt={showNotePrompt}
        onSaveNote={handleSaveNote}
        onSkipNote={handleSkipNote}
        recentNotes={recentNotes}
        onToggleDate={handleToggleDate}
      />
    </div>
  );
}

const c = {
  bar: { position: 'sticky', top: '52px', zIndex: 50, background: 'rgba(26,21,18,0.95)', borderBottom: '1px solid #2a2a2a', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  label: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '3px', color: '#c45a2a' },
  slider: { flex: 1, minWidth: '200px', accentColor: '#c45a2a' },
  dayDisplay: { fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '2px', color: '#e8e4dc', minWidth: '80px' },
  resetBtn: { fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px', background: 'transparent', color: '#888', border: '1px solid #333', padding: '6px 12px', cursor: 'pointer' },
};
