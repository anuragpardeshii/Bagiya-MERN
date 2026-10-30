import { useEffect } from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import { focusExtension } from '../lib/focusExtension';
export default function StrictFocus({
  enabled,
  onChange,
  links,
  onLinksChange,
  connected,
  onConnection,
  disabled,
}) {
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const check = () =>
      focusExtension('PING', undefined, 2500)
        .then(() => {
          if (!disposed) onConnection(true);
        })
        .catch(() => {
          if (!disposed) onConnection(false);
        });
    check();
    const interval = setInterval(check, 10000);
    window.addEventListener('focus', check);
    return () => {
      disposed = true;
      clearInterval(interval);
      window.removeEventListener('focus', check);
    };
  }, [enabled, onConnection]);
  return (
    <section className="strict-focus" aria-label="Strict focus settings">
      <label className="strict-toggle">
        <ShieldCheck size={20} />
        <span>
          <strong>Strict focus</strong>
          <small>Make room for just what you need.</small>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
      </label>
      {enabled && (
        <div className="strict-settings">
          <p className="small-text">
            Stay on your allowed websites and Bagiya during this session. Other
            websites, locking the screen or leaving the browser end it without
            coins. Strict sessions cannot be paused.
          </p>
          <label htmlFor="allowed-links">Allowed websites</label>
          <textarea
            id="allowed-links"
            rows={3}
            maxLength={62000}
            value={links}
            disabled={disabled}
            onChange={(event) => onLinksChange(event.target.value)}
            placeholder={'https://docs.python.org\nhttps://example.com/lesson'}
          />
          <p className="small-text muted">
            One per line, up to 30. A domain allows that site; a URL with a path
            allows only that page. Subdomains are separate. Leave empty to focus
            only in Bagiya.
          </p>
          <p
            className={`extension-status ${connected ? 'connected' : ''}`}
            role="status"
          >
            {connected
              ? 'Extension connected · ready to focus'
              : 'Connect the desktop extension to start'}
          </p>
          {!connected && (
            <details>
              <summary>Set up the Chrome / Edge extension</summary>
              <a
                className="text-link"
                href="/downloads/bagiya-focus-extension.zip"
                download
              >
                <Download size={16} />
                Download extension
              </a>
              <ol>
                <li>Extract the downloaded ZIP into a folder.</li>
                <li>
                  Open <code>chrome://extensions</code> (or{' '}
                  <code>edge://extensions</code>), enable Developer mode, choose
                  Load unpacked, and select that folder.
                </li>
                <li>
                  Open the Bagiya extension, enter{' '}
                  <strong>{location.origin}</strong>, and select Connect to
                  Bagiya.
                </li>
                <li>
                  Return here, enable Strict focus and choose your allowed
                  links.
                </li>
              </ol>
            </details>
          )}
          <p className="small-text muted">
            Requires desktop Chrome or Edge. If monitoring stops for 90
            seconds—including sleep or lost internet—the session ends. Very
            brief sleep may fall within that grace period.
          </p>
        </div>
      )}
    </section>
  );
}
