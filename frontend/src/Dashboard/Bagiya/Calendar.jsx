import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useResource } from '../../hooks/useResource';
import { Resource } from '../../components/UI';
import { useAuth } from '../context/AuthContext';
import { TreeGlyph } from '../../components/PlantGrowth';

function DayBed({ completed, cancelled }) {
  return (
    <svg
      className="day-bed"
      viewBox="0 0 160 180"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <path d="M0 139L80 119L160 139V180H0Z" fill="#936b46" />
      <path d="M0 150Q42 143 80 154T160 150V180H0Z" fill="#745038" />
      <path d="M0 170Q40 160 80 171T160 168V180H0Z" fill="#5d412e" />
      <path d="M0 139L80 119L160 139L80 159Z" fill="#b59a62" />
      <path
        d="M0 139L80 119L160 139L80 152Z"
        fill={completed ? '#a4ae69' : '#b5a278'}
      />
      <g fill="#d0b482" opacity=".6">
        <ellipse cx="24" cy="162" rx="3" ry="2" />
        <ellipse cx="124" cy="169" rx="4" ry="2" />
        <ellipse cx="57" cy="174" rx="2" ry="2" />
        <ellipse cx="142" cy="155" rx="2" ry="2" />
      </g>
      {(completed > 0 || cancelled > 0) && (
        <g className={`day-plant ${completed ? 'healthy' : 'withered'}`}>
          <ellipse
            cx="80"
            cy="140"
            rx="25"
            ry="5"
            fill="#57422e"
            opacity=".2"
          />
          <g transform="translate(26.4 -1) scale(.67)">
            <TreeGlyph
              stage={Math.min(5, completed + 1)}
              withered={!completed}
            />
          </g>
        </g>
      )}
    </svg>
  );
}

export default function Calendar() {
  const today = new Date().toISOString().slice(0, 10);
  const [month, setMonth] = useState(today.slice(0, 7));
  const { user } = useAuth();
  const resource = useResource(`/sessions/activity?month=${month}`, {
    revalidateOnFocus: true,
  });
  const first = new Date(`${month}-01T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const monthLabel = first.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const move = (delta) => {
    const date = new Date(first);
    date.setUTCMonth(date.getUTCMonth() + delta);
    setMonth(date.toISOString().slice(0, 7));
  };
  return (
    <section className="panel nursery-panel" aria-labelledby="nursery-heading">
      <div className="panel-heading">
        <div>
          <h3 id="nursery-heading">Days that took root</h3>
          <p className="muted">
            One day, one little plot. Every completed session helps it grow.
          </p>
        </div>
        <div className="month-controls">
          <button
            className="icon-button"
            aria-label="Previous month"
            disabled={month <= user.createdAt.slice(0, 7)}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>{monthLabel}</span>
          <button
            className="icon-button"
            aria-label="Next month"
            disabled={month >= today.slice(0, 7)}
            onClick={() => move(1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <Resource resource={resource}>
        {(data) => {
          const activity = new Map(data.days.map((day) => [day._id, day]));
          return (
            <div
              className="calendar-nursery"
              role="group"
              aria-label={`${monthLabel} focus calendar`}
            >
              <div className="calendar-weekdays" aria-hidden="true">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  ),
                )}
              </div>
              <div className="calendar-grid" key={month}>
                {Array.from({ length: offset }, (_, i) => (
                  <div
                    className="calendar-spacer"
                    key={`space-${i}`}
                    aria-hidden="true"
                  />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const date = `${month}-${String(i + 1).padStart(2, '0')}`;
                  const {
                    completed = 0,
                    cancelled = 0,
                    minutes = 0,
                  } = activity.get(date) || {};
                  const description = `${date}: ${completed} completed, ${cancelled} ended early, ${minutes} focus minutes${completed ? '. Healthy plant' : cancelled ? '. Withered trunk' : '. Unplanted soil'}`;
                  return (
                    <div
                      className={`calendar-day ${date === today ? 'today' : ''} ${date > today ? 'future' : ''}`}
                      key={date}
                      data-date={date}
                      role="img"
                      aria-label={description}
                      title={description}
                      tabIndex={completed || cancelled ? 0 : undefined}
                      aria-current={date === today ? 'date' : undefined}
                      style={{ '--day-delay': `${i * 20}ms` }}
                    >
                      <span className="calendar-date" aria-hidden="true">
                        {i + 1}
                      </span>
                      <DayBed completed={completed} cancelled={cancelled} />
                    </div>
                  );
                })}
              </div>
              <p className="calendar-note">Your daily garden · UTC</p>
            </div>
          );
        }}
      </Resource>
    </section>
  );
}
