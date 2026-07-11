import { HISTORY } from '../coachingContent.js';
import { addDaysISO, daysBetween, fmtNice } from './portalUtils.js';
import UrgeChart from './UrgeChart.jsx';

// Calendar of the program, urge trend and past check-ins with coach replies.
export default function PortalHistory({ client, checkins, replies, triggers, todayISO }) {
  const byDate = new Map(checkins.map((c) => [c.checkin_date, c]));
  const replyByCheckin = new Map(replies.map((r) => [r.checkin_id, r]));
  const trigLabel = new Map(triggers.map((t) => [t.id, t.label]));

  const total = daysBetween(client.start_date, client.end_date) + 1;
  const days = [];
  for (let i = 0; i < total; i++) {
    const d = addDaysISO(client.start_date, i);
    let cls = 'future';
    if (byDate.has(d)) cls = 'done';
    else if (d < todayISO) cls = 'missed';
    else if (d > todayISO) cls = 'future';
    else cls = 'open';
    if (d === todayISO) cls += ' today';
    days.push({ d, n: i + 1, cls });
  }

  const points = checkins.map((c) => ({ date: c.checkin_date, urge: c.urge_intensity, acted: c.acted_out }));
  const past = [...checkins].sort((a, b) => (a.checkin_date < b.checkin_date ? 1 : -1));

  return (
    <div>
      <div className="card pt-block">
        <div className="pt-q">{HISTORY.title}</div>
        <div className="pt-cal">
          {days.map((x) => (
            <div key={x.d} className={'pt-cell ' + x.cls} title={x.d}>{x.n}</div>
          ))}
        </div>
        <div className="pt-legend">
          <span><i className="pt-dot done"></i>{HISTORY.legendDone}</span>
          <span><i className="pt-dot missed"></i>{HISTORY.legendMissed}</span>
          <span><i className="pt-dot today"></i>{HISTORY.legendToday}</span>
        </div>
      </div>

      {points.length > 0 && (
        <div className="card pt-block">
          <div className="pt-q">{HISTORY.urgeChartTitle}</div>
          <UrgeChart points={points} />
        </div>
      )}

      {past.length === 0 && <p className="muted">{HISTORY.noCheckins}</p>}
      {past.map((c) => {
        const reply = replyByCheckin.get(c.id);
        const trigs = c.trigger_ids.map((id) => trigLabel.get(id)).filter(Boolean);
        return (
          <div key={c.id} className="card pt-block pt-past">
            <div className="pt-past-head">
              <strong>{fmtNice(c.checkin_date)}</strong>
              <span className="pt-tag">urge {c.urge_intensity}/10</span>
              {c.acted_out && <span className="pt-tag red">{HISTORY.actedOutTag}</span>}
              {c.moved && <span className="pt-tag">{HISTORY.movedTag}</span>}
              {c.sleep_hours != null && <span className="pt-tag">{HISTORY.sleepTag(c.sleep_hours)}</span>}
            </div>
            {(trigs.length > 0 || c.trigger_other) && (
              <p className="pt-past-line">{[...trigs, c.trigger_other].filter(Boolean).join(' · ')}</p>
            )}
            {c.win && <p className="pt-past-line"><em>Win:</em> {c.win}</p>}
            {c.tomorrow_focus && <p className="pt-past-line"><em>Tomorrow:</em> {c.tomorrow_focus}</p>}
            {reply && reply.body && (
              <div className="pt-reply">
                <span className="pt-reply-who">{HISTORY.coachReplyLabel}</span> {reply.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
