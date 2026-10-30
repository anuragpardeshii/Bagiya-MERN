import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Timer,
  Trees,
  Coins,
  Target,
  ArrowRight,
  CheckCircle2,
  MinusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../../hooks/useResource';
import {
  PageHeading,
  Resource,
  PlantArt,
  Empty,
  Pagination,
} from '../../components/UI';
import { number, minutes, dateTime } from '../../lib/api';
export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly'),
    [page, setPage] = useState(1);
  const summary = useResource(`/sessions/summary?period=${period}`),
    history = useResource(`/sessions/user/${user.id}?page=${page}&limit=5`);
  return (
    <>
      <PageHeading
        eyebrow="A FRESH MOMENT TO BEGIN"
        title={`Hello, ${user.name.split(' ')[0]}.`}
        description="Every small moment of focus is a little growth."
      >
        <Link className="button" to="/timer">
          <Timer size={17} />
          Start focusing
        </Link>
      </PageHeading>
      <section className="welcome-card">
        <div>
          <span className="pill">GROW AT YOUR OWN PACE</span>
          <h2>
            Good things take
            <br />
            <em>a little focus.</em>
          </h2>
          <p>
            Clear a little space in your day.
            <br />
            Your next chapter begins with one session.
          </p>
          <Link className="text-link" to="/timer">
            Plant a moment of focus <ArrowUpRight size={18} />
          </Link>
        </div>
        <PlantArt />
      </section>
      <Resource resource={summary}>
        {(data) => (
          <>
            <section className="stats-grid" aria-label="Your progress">
              {[
                [
                  Timer,
                  'Total focus',
                  minutes(data.totalMinutes),
                  'Time well spent',
                ],
                [
                  Target,
                  'Sessions completed',
                  number(data.successfulSessions),
                  `${data.totalSessions ? Math.round((data.successfulSessions / data.totalSessions) * 100) : 0}% completion rate`,
                ],
                [
                  Trees,
                  'Trees planted',
                  number(data.wallet.trees),
                  'Your virtual garden',
                ],
                [
                  Coins,
                  'Coin balance',
                  number(data.wallet.balance),
                  '2,500 coins plants a tree',
                ],
              ].map(([Icon, label, value, note]) => (
                <article className="stat-card" key={label}>
                  <div>
                    <span>{label}</span>
                    <Icon size={19} />
                  </div>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </article>
              ))}
            </section>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Your focus, over time</h3>
                    <p className="muted">
                      Small efforts add up. All chart times are UTC.
                    </p>
                  </div>
                  <select
                    aria-label="Chart period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="hourly">Today</option>
                    <option value="weekly">This week</option>
                    <option value="monthly">Past year</option>
                  </select>
                </div>
                <div
                  className={`bar-chart ${period === 'hourly' ? 'hours' : ''}`}
                  role="img"
                  aria-label={`Focus minutes: ${data.chart.map((b) => `${b.label} ${b.timeInvested}`).join(', ')}`}
                >
                  {data.chart.map((b) => (
                    <div className="bar-column" key={b.key}>
                      <span className="bar-value">{b.timeInvested || ''}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.max(2, (b.timeInvested / Math.max(30, ...data.chart.map((v) => v.timeInvested))) * 100)}%`,
                          }}
                        />
                      </div>
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
                {!data.chart.some((b) => b.timeInvested > 0) && (
                  <p className="chart-note">
                    Your first completed session will bring this chart to life.
                  </p>
                )}
              </section>
              <section className="garden-note">
                <span className="round-icon">
                  <Trees size={25} />
                </span>
                <p className="eyebrow">YOUR LITTLE CORNER OF GREEN</p>
                <h3>
                  One session.
                  <br />
                  One step closer.
                </h3>
                <p>Turn your focus coins into something that grows with you.</p>
                <Link className="button secondary" to="/dashboard/bagiya">
                  Visit my garden <ArrowUpRight size={16} />
                </Link>
              </section>
            </div>
          </>
        )}
      </Resource>
      <section className="panel history-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent moments of focus</h3>
            <p className="muted">A record of showing up for yourself.</p>
          </div>
          <Link className="text-link" to="/timer">
            Make another moment <ArrowRight size={15} />
          </Link>
        </div>
        <Resource resource={history}>
          {(data) =>
            data.sessions.length ? (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Started</th>
                        <th>Duration</th>
                        <th>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sessions.map((s) => (
                        <tr key={s._id}>
                          <td>
                            <span className="table-label">
                              <Timer size={17} />
                              Mindful focus
                            </span>
                          </td>
                          <td>{dateTime(s.startTime)}</td>
                          <td>{s.sessionTime} min</td>
                          <td>
                            <span
                              className={`status-pill ${s.sessionSuccess ? 'success' : 'neutral'}`}
                            >
                              {s.sessionSuccess ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <MinusCircle size={13} />
                              )}{' '}
                              {s.sessionSuccess ? 'Completed' : 'Ended early'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pages={data.pages} onChange={setPage} />
              </>
            ) : (
              <Empty title="A fresh start looks good on you." link="/timer">
                Your sessions will appear here when you finish your first one.
              </Empty>
            )
          }
        </Resource>
      </section>
    </>
  );
}
