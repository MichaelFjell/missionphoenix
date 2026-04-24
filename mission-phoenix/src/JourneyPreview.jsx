import { useState } from 'react';
import Journey from './Journey.jsx';
import { pickDeterministicQuote } from './quotes.js';

// Preview wrapper. Simulates a user with fake data so the Journey view can
// be viewed without Supabase auth.
export default function JourneyPreview() {
  const [daysClean, setDaysClean] = useState(47);
  const [isTodayChecked, setIsTodayChecked] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [todayQuote, setTodayQuote] = useState(null);
  const [showNotePrompt, setShowNotePrompt] = useState(false);
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
    <>
      <style>{`
        .jp-bar{position:sticky;top:64px;z-index:15;background:rgba(251,245,232,0.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:12px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
        .jp-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--copper);text-transform:uppercase;}
        .jp-slider{flex:1;min-width:200px;accent-color:var(--copper);}
        .jp-day{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--ink);min-width:80px;text-transform:uppercase;}
        .jp-reset{font-size:10px;font-weight:700;letter-spacing:2px;background:transparent;color:var(--ink-3);border:1px solid var(--line-2);border-radius:999px;padding:6px 12px;cursor:pointer;font-family:inherit;text-transform:uppercase;}
        .jp-reset:hover{border-color:var(--copper);color:var(--copper);}
      `}</style>
      <div>
        <div className="jp-bar">
          <div className="jp-label">Preview scrub</div>
          <input
            type="range"
            min="0"
            max="800"
            value={daysClean}
            onChange={e => { setDaysClean(parseInt(e.target.value)); setIsTodayChecked(false); }}
            className="jp-slider"
          />
          <div className="jp-day">Day {daysClean}</div>
          <button onClick={reset} className="jp-reset">Reset state</button>
        </div>

        <main className="page narrow" style={{ maxWidth: '760px' }}>
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
        </main>
      </div>
    </>
  );
}
