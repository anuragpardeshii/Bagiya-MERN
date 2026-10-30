import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  ArrowUpRight,
  Crown,
  Medal,
  RefreshCw,
  Sprout,
} from 'lucide-react';
import { useResource } from '../../hooks/useResource';
import { useAuth } from '../context/AuthContext';
import { PageHeading, Resource, Pagination } from '../../components/UI';
import toast from 'react-hot-toast';
import { api, minutes, number } from '../../lib/api';
function Champions({ rankings }) {
  const top = [0, 1, 2].map((index) => rankings[index] || { rank: index + 1 }),
    maximum = top[0]?.minutes || 1;
  return (
    <section className="champions" aria-label="Focus champions">
      <div className="champions-heading">
        <span className="champion-seal">
          <Trophy size={24} />
        </span>
        <p className="eyebrow">TIME WELL SPENT</p>
        <h2>Meet the champions.</h2>
        <p>Small moments of focus. Remarkable growth.</p>
      </div>
      <div
        className="podium"
        role="list"
        aria-label="Top three by completed focus minutes"
      >
        {top.map((member) => (
          <div
            className={`podium-member place-${member.rank} ${member._id ? '' : 'podium-vacant'}`}
            key={member.rank}
            role="listitem"
            aria-label={
              member._id
                ? `${member.rank === 1 ? 'Champion' : `Place ${member.rank}`}: ${member.name}, ${member.minutes} focus minutes`
                : `Place ${member.rank} is unclaimed`
            }
          >
            <div className="podium-person">
              {member.rank === 1 ? (
                <Crown className="winner-crown" size={26} />
              ) : (
                <Medal size={20} />
              )}
              <span className="avatar">
                {member.name?.charAt(0) || <Sprout size={22} />}
              </span>
              <strong>{member.name || 'Room to grow'}</strong>
              <small>
                {member.username ? `@${member.username}` : 'An open place'}
              </small>
              <span className="podium-score">
                {member._id ? minutes(member.minutes) : 'Unclaimed'}
              </span>
            </div>
            <div className="podium-track">
              <div
                className="podium-bar"
                style={{
                  height: `${((member.minutes || 0) / maximum) * 100}%`,
                }}
              >
                <span>{String(member.rank).padStart(2, '0')}</span>
              </div>
            </div>
            <span className="podium-caption">
              {member.rank === 1
                ? 'Champion'
                : member.rank === 2
                  ? 'Second place'
                  : 'Third place'}
            </span>
          </div>
        ))}
      </div>
      <p className="chart-note">
        {rankings.length
          ? 'Bar heights reflect completed focus minutes in the selected period.'
          : 'Join the leaderboard and complete a session to take the first place.'}
      </p>
    </section>
  );
}
export default function Rankings() {
  const [period, setPeriod] = useState('week'),
    [page, setPage] = useState(1);
  const resource = useResource(
    `/social/rankings?period=${period}&page=${page}`,
    { revalidateOnFocus: true },
  );
  const { user, setUser } = useAuth();
  const [joining, setJoining] = useState(false);
  async function join() {
    setJoining(true);
    try {
      const data = await api('/social/rankings/preference', {
        method: 'PATCH',
        body: { rankingOptIn: true },
      });
      setUser(data.user);
      setPage(1);
      resource.reload();
      toast.success('You have joined the leaderboard.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setJoining(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="INSPIRED BY EACH OTHER"
        title="A community in bloom."
        description="Celebrating time well spent. Every beginning belongs here."
      >
        <select
          aria-label="Leaderboard period"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setPage(1);
          }}
        >
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="all">All time</option>
        </select>
      </PageHeading>
      {!user.rankingOptIn && (
        <div className="notice">
          <Trophy size={24} />
          <div>
            <strong>Grow quietly, or grow together.</strong>
            <p>
              Your progress is private. Joining shares your name, username and
              focus totals. You can leave at any time in your profile.
            </p>
          </div>
          <div className="leaderboard-actions">
            <button className="button" disabled={joining} onClick={join}>
              {joining ? 'Joining…' : 'Join leaderboard'}
            </button>
            <Link className="text-link" to="/dashboard/profile">
              My preferences <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>The growing community</h3>
            <p className="muted">Completed focus sessions · periods use UTC</p>
          </div>
          <button
            className="icon-button"
            aria-label="Refresh leaderboard"
            disabled={resource.loading}
            onClick={resource.reload}
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <Resource resource={resource}>
          {(data) => (
            <>
              {page === 1 && <Champions rankings={data.rankings} />}
              {data.rankings.length > 0 && (
                <>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Member</th>
                          <th>Focus time</th>
                          <th>Sessions</th>
                          <th>Trees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rankings.map((r) => (
                          <tr
                            key={r._id}
                            className={r._id === user.id ? 'own-row' : ''}
                          >
                            <td>
                              <span className="rank">
                                {String(r.rank).padStart(2, '0')}
                              </span>
                            </td>
                            <td>
                              <span className="table-label">
                                <span className="avatar">
                                  {r.name.charAt(0)}
                                </span>
                                <span>
                                  <strong>{r.name}</strong>
                                  <small>@{r.username}</small>
                                </span>
                              </span>
                            </td>
                            <td>{minutes(r.minutes)}</td>
                            <td>{number(r.sessions)}</td>
                            <td>{number(r.trees)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={page}
                    pages={data.pages}
                    onChange={setPage}
                  />
                </>
              )}
            </>
          )}
        </Resource>
      </section>
    </>
  );
}
