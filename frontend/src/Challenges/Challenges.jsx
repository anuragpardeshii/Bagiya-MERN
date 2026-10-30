import { useState, useRef, useEffect } from 'react';
import { Trophy, Check, ArrowUpRight, Coins, Sprout, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResource } from '../hooks/useResource';
import { api, number } from '../lib/api';
import { PageHeading, Resource, Empty } from '../components/UI';
import { useAuth } from '../Dashboard/context/AuthContext';
export default function Challenges() {
  const resource = useResource('/challenges', { revalidateOnFocus: true });
  const [busy, setBusy] = useState(null);
  const guard = useRef(false);
  const { refresh } = useAuth();
  const resetsAt = resource.data?.challenges.find(
    (item) => item.recurring,
  )?.resetsAt;
  const reload = resource.reload;
  useEffect(() => {
    if (!resetsAt) return;
    const timeout = setTimeout(
      reload,
      Math.max(1000, Date.parse(resetsAt) - Date.now() + 1000),
    );
    return () => clearTimeout(timeout);
  }, [resetsAt, reload]);
  async function redeem(id) {
    if (guard.current) return;
    guard.current = true;
    setBusy(id);
    try {
      const result = await api(`/challenges/redeem/${id}`, {
        method: 'POST',
        body: {},
      });
      toast.success(
        result.replayed
          ? 'Already collected. Come back tomorrow!'
          : 'A little progress, rewarded. Coins added!',
      );
      resource.reload();
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      guard.current = false;
      setBusy(null);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="LITTLE MILESTONES, LASTING HABITS"
        title="Something to grow toward."
        description="Gentle encouragement for your everyday focus."
      >
        <Link className="button secondary" to="/timer">
          Make some progress <ArrowUpRight size={17} />
        </Link>
      </PageHeading>
      <div className="challenge-banner">
        <Trophy size={36} />
        <div>
          <h2>Progress deserves a little celebration.</h2>
          <p>Complete a milestone, collect your coins, and keep on growing.</p>
        </div>
      </div>
      <Resource resource={resource}>
        {(data) => (
          <div className="challenge-grid">
            {!data.challenges.length && (
              <Empty title="New milestones will take root here." link="/timer">
                Keep making time for yourself. Your available challenges will
                appear here.
              </Empty>
            )}
            {data.challenges.map((c, i) => {
              const goal = c.requiredMinutes || c.requiredSessions || 0,
                progress = c.requiredMinutes
                  ? data.stats.totalMinutes
                  : data.stats.successfulSessions;
              return (
                <article
                  className={`challenge-card ${c.recurring ? 'daily-challenge' : ''}`}
                  key={c._id}
                >
                  <div className="challenge-top">
                    <span className="round-icon">
                      {c.isRedeemed ? (
                        <Check />
                      ) : c.recurring ? (
                        <Sun />
                      ) : (
                        <Sprout />
                      )}
                    </span>
                    <span className="eyebrow">
                      {c.recurring
                        ? 'A DAILY RITUAL'
                        : `MILESTONE ${String(i).padStart(2, '0')}`}
                    </span>
                  </div>
                  <h3>{c.title}</h3>
                  <p className="muted">{c.description}</p>
                  {c.recurring ? (
                    <div className="daily-reward-status">
                      <span>
                        {c.isRedeemed
                          ? 'Today’s visit has been rewarded.'
                          : 'You’re here. Your daily reward is ready.'}
                      </span>
                      <small>A fresh reward every day at 00:00 UTC.</small>
                    </div>
                  ) : goal > 0 ? (
                    <>
                      <progress
                        max={goal}
                        value={Math.min(goal, progress)}
                        aria-label={c.title}
                      />
                      <span className="progress-caption">
                        {Math.min(goal, progress)} / {goal}{' '}
                        {c.requiredMinutes ? 'minutes' : 'sessions'}
                      </span>
                    </>
                  ) : (
                    <p className="small-text muted">
                      Legacy challenge · eligibility needs review
                    </p>
                  )}
                  <div className="challenge-bottom">
                    <span>
                      <Coins size={17} />
                      {number(c.coins)} coins
                    </span>
                    <button
                      className={`button ${c.isRedeemed ? 'secondary' : ''}`}
                      disabled={busy !== null || !c.eligible || c.isRedeemed}
                      onClick={() => redeem(c._id)}
                    >
                      {busy === c._id
                        ? 'Collecting…'
                        : c.isRedeemed
                          ? c.recurring
                            ? 'Collected today'
                            : 'Collected'
                          : c.eligible
                            ? c.recurring
                              ? 'Collect 10 coins'
                              : 'Collect reward'
                            : 'In progress'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Resource>
    </>
  );
}
