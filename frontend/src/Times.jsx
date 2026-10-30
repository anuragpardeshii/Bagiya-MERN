import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Coins,
  VolumeX,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useResource } from './hooks/useResource';
import { api, number } from './lib/api';
import { PageHeading, Resource } from './components/UI';
import PlantGrowth, { growthStage } from './components/PlantGrowth';
import StrictFocus from './components/StrictFocus';
import { focusExtension } from './lib/focusExtension';
import { useAuth } from './Dashboard/context/AuthContext';
export default function Timer() {
  const { user, refresh } = useAuth();
  const resource = useResource('/sessions/active');
  const [duration, setDuration] = useState(25),
    [active, setActive] = useState(null),
    [remaining, setRemaining] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [confirm, setConfirm] = useState(false),
    [completed, setCompleted] = useState(null),
    [withered, setWithered] = useState(false),
    [strictMode, setStrictMode] = useState(false),
    [extensionConnected, setExtensionConnected] = useState(false),
    [allowedLinks, setAllowedLinks] = useState(''),
    [interruption, setInterruption] = useState('');
  const busyRef = useRef(false),
    attempted = useRef(null),
    deadline = useRef(0),
    dialog = useRef(null);
  const applySession = useCallback((s) => {
    setActive(s?.active ? s : null);
    setRemaining(s?.remainingMs || 0);
    deadline.current = Date.now() + (s?.remainingMs || 0);
    if (s && !s.active) {
      setCompleted(s.sessionSuccess ? s : null);
      setWithered(!s.sessionSuccess);
      setInterruption(s.interruptionReason || '');
    }
  }, []);
  useEffect(() => {
    if (resource.data)
      applySession(resource.data.session || resource.data.lastSession);
  }, [resource.data, applySession]);
  const strictId = active?.strictMode ? active._id : null;
  useEffect(() => {
    if (!strictId) return;
    const controller = new AbortController();
    let pending = false;
    const check = async () => {
      if (pending || document.visibilityState !== 'visible') return;
      pending = true;
      try {
        const data = await api('/sessions/active', {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          applySession(data.session || data.lastSession);
          if (!data.session) refresh();
        }
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
      } finally {
        pending = false;
      }
    };
    const interval = setInterval(check, 5000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [strictId, applySession, refresh]);
  useEffect(() => {
    if (!active || active.status !== 'running') return;
    const tick = () => setRemaining(Math.max(0, deadline.current - Date.now()));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [active]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);
  async function perform(action) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const key = `bagiya:start:${user.id}`;
      let response;
      if (action === 'start') {
        let saved;
        try {
          saved = JSON.parse(sessionStorage.getItem(key));
        } catch {
          saved = null;
        }
        const links = allowedLinks
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean);
        const policy = JSON.stringify({
          strictMode,
          links: strictMode ? links : [],
        });
        if (!saved || saved.duration !== duration || saved.policy !== policy) {
          saved = { requestId: crypto.randomUUID(), duration, policy };
          sessionStorage.setItem(key, JSON.stringify(saved));
        }
        response = strictMode
          ? await focusExtension('START', {
              sessionTime: duration,
              requestId: saved.requestId,
              allowedLinks: links,
            })
          : await api('/sessions/start', {
              method: 'POST',
              body: { sessionTime: duration, requestId: saved.requestId },
            });
        sessionStorage.removeItem(key);
        setCompleted(null);
        setWithered(false);
        setInterruption('');
        attempted.current = null;
      } else
        response = await api(`/sessions/${active._id}/action`, {
          method: 'POST',
          body: { action },
        });
      const s = response.session;
      applySession(s);
      if (!s.active) {
        toast.success(
          s.sessionSuccess
            ? 'A little more growth. Well done.'
            : 'Session saved. You can begin again whenever you’re ready.',
        );
        refresh();
      }
      setConfirm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const performRef = useRef(perform);
  performRef.current = perform;
  useEffect(() => {
    if (
      active?.status === 'running' &&
      !active.strictMode &&
      remaining === 0 &&
      attempted.current !== active._id &&
      !busyRef.current
    ) {
      attempted.current = active._id;
      performRef.current('complete');
    }
  }, [remaining, active]);
  const time = active ? remaining : duration * 60000;
  const progress = active
    ? Math.min(1, Math.max(0, 1 - remaining / (active.sessionTime * 60000)))
    : 1;
  const stage = growthStage(progress);
  const seconds = Math.ceil(time / 1000),
    display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <>
      <PageHeading
        eyebrow="ONE THING AT A TIME"
        title="A moment to focus."
        description="Settle in. Let everything else wait a little."
      />
      <Resource resource={resource}>
        {() => (
          <div className="focus-layout">
            <section className="focus-panel">
              <span className="pill">
                <span className="online-dot" />
                {active
                  ? active.status === 'paused'
                    ? 'TAKING A BREATH'
                    : 'FOCUS IS TAKING ROOT'
                  : 'YOUR QUIET GROWING SPACE'}
              </span>
              <div className="timer-art">
                <PlantGrowth
                  stage={stage}
                  withered={withered}
                  paused={active?.status === 'paused' || !active}
                />
              </div>
              <div
                className="timer-digits"
                role="timer"
                aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}
              >
                {display}
              </div>
              <p className="timer-caption">
                {active
                  ? 'A little presence goes a long way.'
                  : 'Choose your time. Find your rhythm.'}
              </p>
              {!active && (
                <div className="duration-options" aria-label="Focus duration">
                  {[15, 25, 45, 60].map((v) => (
                    <button
                      key={v}
                      aria-pressed={duration === v}
                      className={duration === v ? 'selected' : ''}
                      onClick={() => setDuration(v)}
                      disabled={busy}
                    >
                      {v} min
                    </button>
                  ))}
                  <label className="custom-duration">
                    Custom
                    <input
                      aria-label="Custom duration in minutes"
                      type="number"
                      min={5}
                      max={180}
                      step={5}
                      value={duration}
                      disabled={busy}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                  </label>
                </div>
              )}
              {!active && (
                <StrictFocus
                  enabled={strictMode}
                  onChange={setStrictMode}
                  links={allowedLinks}
                  onLinksChange={setAllowedLinks}
                  connected={extensionConnected}
                  onConnection={setExtensionConnected}
                  disabled={busy}
                />
              )}
              {active?.strictMode && (
                <div className="strict-running">
                  <strong>Strict focus is on</strong>
                  <p>
                    Stay with these websites. Leaving the browser or losing
                    monitoring interrupts the session.
                  </p>
                  <div className="allowed-shortcuts">
                    <a href="/timer">Bagiya</a>
                    {active.allowedLinks.map((link) => (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {interruption && (
                <p className="form-error" role="status">
                  {
                    {
                      'outside-allowlist':
                        'An unapproved website interrupted your session.',
                      'device-locked':
                        'Locking your screen interrupted your session.',
                      'browser-unfocused':
                        'Leaving the browser interrupted your session.',
                      'monitoring-lost':
                        'Monitoring stopped for too long. Your session ended without coins.',
                    }[interruption]
                  }{' '}
                  Your tree has withered.
                </p>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="timer-actions">
                {!active ? (
                  <button
                    className="button"
                    disabled={
                      busy ||
                      (strictMode && !extensionConnected) ||
                      duration < 5 ||
                      duration > 180 ||
                      duration % 5 !== 0
                    }
                    onClick={() => perform('start')}
                  >
                    <Play size={17} />
                    {busy ? 'Starting…' : 'Start focusing'}
                  </button>
                ) : (
                  <>
                    {active.strictMode ? (
                      <span className="strict-timer-status">
                        {remaining === 0
                          ? 'Verifying focus with the extension…'
                          : 'A little commitment. Keep growing.'}
                      </span>
                    ) : remaining === 0 ? (
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => perform('complete')}
                      >
                        <CheckCircle2 size={18} />
                        {busy ? 'Saving…' : 'Save completed session'}
                      </button>
                    ) : (
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() =>
                          perform(
                            active.status === 'paused' ? 'resume' : 'pause',
                          )
                        }
                      >
                        {active.status === 'paused' ? (
                          <Play size={17} />
                        ) : (
                          <Pause size={17} />
                        )}{' '}
                        {busy
                          ? 'Saving…'
                          : active.status === 'paused'
                            ? 'Resume focus'
                            : 'Take a breath'}
                      </button>
                    )}
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => setConfirm(true)}
                    >
                      <Square size={16} />
                      End early
                    </button>
                  </>
                )}
              </div>
              <span className="timer-reward">
                <Coins size={16} />
                {number((active?.sessionTime || duration) * 100)} coins when you
                complete this session
              </span>
              {completed && (
                <div className="completion-note" role="status">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>
                      You made room for {completed.sessionTime} minutes.
                    </strong>
                    <p>
                      {number(completed.reward)} coins added to your garden.
                    </p>
                  </div>
                </div>
              )}
            </section>
            <aside className="focus-aside">
              <p className="eyebrow">MAKE YOURSELF AT HOME</p>
              <h2>
                A softer way
                <br />
                to get things done.
              </h2>
              <div className="focus-tip">
                <VolumeX />
                <div>
                  <h3>Turn down the noise</h3>
                  <p>
                    Silence notifications and keep just what you need nearby.
                  </p>
                </div>
              </div>
              <div className="focus-tip">
                <Play />
                <div>
                  <h3>Give one thing your attention</h3>
                  <p>A page, a project, a small beginning. It all counts.</p>
                </div>
              </div>
              <div className="focus-tip">
                <RotateCcw />
                <div>
                  <h3>Come back gently</h3>
                  <p>
                    {active?.strictMode || strictMode
                      ? 'Strict focus keeps running without pauses. Choose End early if you need to stop.'
                      : 'Pause when you need a breath. Your timer is saved, even if you refresh.'}
                  </p>
                </div>
              </div>
              <blockquote>
                “Nature does not hurry,
                <br />
                yet everything is accomplished.”<cite>— Lao Tzu</cite>
              </blockquote>
            </aside>
          </div>
        )}
      </Resource>
      <dialog
        ref={dialog}
        className="confirm-dialog"
        aria-labelledby="end-session-title"
        onCancel={() => setConfirm(false)}
      >
        <h2 id="end-session-title">Leave a little early?</h2>
        <p>
          Your session will be saved as incomplete. You won’t earn coins this
          time. Your tree will wither and appear in your calendar. You can plant
          a fresh seed whenever you’re ready.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button
            className="button secondary"
            autoFocus
            disabled={busy}
            onClick={() => setConfirm(false)}
          >
            Keep focusing
          </button>
          <button
            className="button"
            disabled={busy}
            onClick={() => perform('cancel')}
          >
            {busy ? 'Saving…' : 'End session'}
          </button>
        </div>
      </dialog>
    </>
  );
}
