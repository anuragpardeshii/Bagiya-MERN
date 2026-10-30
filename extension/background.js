importScripts('focus-policy.js');
const { isAllowedUrl } = globalThis.BagiyaFocusPolicy;
const DEFAULT_ORIGIN = 'http://localhost:5179';
const GRACE_MS = 90000;
const ready = chrome.storage.local
  .setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
  .then(async () => {
    if (!(await chrome.alarms.get('bagiya-check')))
      await chrome.alarms.create('bagiya-check', { periodInMinutes: 0.5 });
  });
let queue = Promise.resolve();
function serial(task) {
  const result = queue.then(() => ready).then(task);
  queue = result.catch(() => {});
  return result;
}
async function snapshot() {
  return chrome.storage.local.get(['appOrigin', 'monitor', 'lastStatus']);
}
async function saveMonitor(monitor) {
  await chrome.storage.local.set({ monitor });
}
async function finish(session) {
  await chrome.alarms.clear('bagiya-finish');
  await chrome.storage.local.remove('monitor');
  const lastStatus = session.sessionSuccess
    ? 'Session completed. Your tree has grown.'
    : 'Session interrupted. Return to Bagiya for details.';
  await chrome.storage.local.set({ lastStatus });
  await chrome.action.setBadgeText({
    text: session.sessionSuccess ? '✓' : '!',
  });
}
async function check(observedUrl, force = false) {
  const { monitor: state } = await snapshot();
  if (!state) return;
  const now = Date.now();
  if (now - state.lastCheckAt >= GRACE_MS || now < state.lastCheckAt - 5000)
    state.violation ||= 'monitoring-lost';
  // Persist a detected violation before networking; returning to an allowed tab cannot erase it.
  if (
    observedUrl &&
    !isTransient(observedUrl) &&
    !isAllowedUrl(observedUrl, state.allowedLinks, state.appOrigin)
  )
    state.violation ||= 'outside-allowlist';
  const idle = await chrome.idle.queryState(60);
  if (idle === 'locked') state.violation ||= 'device-locked';
  const window = await chrome.windows.getLastFocused();
  const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
  const currentUrl = tab?.pendingUrl || tab?.url || '';
  if (!window.focused) state.violation ||= 'browser-unfocused';
  if (isTransient(currentUrl) && !state.violation) {
    state.blankSince ||= now;
    await saveMonitor(state);
    if (now - state.blankSince < 3000) {
      setTimeout(() => serial(() => check()).catch(() => {}), 3100);
      return;
    }
  } else delete state.blankSince;
  if (!isAllowedUrl(currentUrl, state.allowedLinks, state.appOrigin))
    state.violation ||= 'outside-allowlist';
  state.lastCheckAt = now;
  await saveMonitor(state);
  if (!force && !state.violation && now - (state.lastSentAt || 0) < 20000)
    return;
  try {
    const response = await fetch(
      `${state.appOrigin}/api/focus-monitor/${state.sessionId}`,
      {
        method: 'POST',
        credentials: 'omit',
        signal: AbortSignal.timeout(10000),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(
          state.violation
            ? { action: 'violation', reason: state.violation }
            : { action: 'heartbeat' },
        ),
      },
    );
    if (response.status === 401) {
      await chrome.storage.local.remove('monitor');
      await chrome.storage.local.set({
        lastStatus:
          'Monitoring disconnected. Return to Bagiya; the session will expire.',
      });
      await chrome.action.setBadgeText({ text: '!' });
      return;
    }
    if (!response.ok) throw new Error('Check-in failed');
    const { session } = await response.json();
    if (!session.active) return finish(session);
    state.lastSentAt = now;
    state.session = session;
    await saveMonitor(state);
    await chrome.action.setBadgeText({ text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ color: '#315a42' });
  } catch {
    await chrome.action.setBadgeText({ text: '?' });
    // No successful check-in means no deadline extension on the server.
  }
}
function isTransient(url) {
  return [
    'about:blank',
    'chrome://newtab/',
    'edge://newtab/',
    'chrome://new-tab-page/',
  ].includes(url);
}
async function messageHandler(message, sender) {
  const saved = await snapshot();
  const appOrigin = saved.appOrigin || DEFAULT_ORIGIN;
  const ownPage = sender.url?.startsWith(chrome.runtime.getURL(''));
  if (ownPage && message.action === 'STATUS')
    return {
      appOrigin,
      active: Boolean(saved.monitor),
      status: saved.monitor
        ? 'Strict focus is running. Stay with your allowed websites.'
        : saved.lastStatus || 'Ready for your next focus session.',
    };
  if (ownPage && message.action === 'CONFIGURE') {
    if (saved.monitor)
      throw new Error(
        'End the current session before changing the connection.',
      );
    const url = new URL(message.origin);
    if (
      url.username ||
      url.password ||
      (url.protocol !== 'https:' &&
        !(
          url.protocol === 'http:' &&
          ['localhost', '127.0.0.1'].includes(url.hostname)
        ))
    )
      throw new Error('Use HTTPS, or HTTP on localhost for development.');
    const pattern = `${url.protocol}//${url.hostname}/*`;
    if (!(await chrome.permissions.contains({ origins: [pattern] })))
      throw new Error('Allow access to your Bagiya site first.');
    await chrome.scripting
      .unregisterContentScripts({ ids: ['bagiya-app'] })
      .catch(() => {});
    await chrome.scripting.registerContentScripts([
      {
        id: 'bagiya-app',
        matches: [pattern],
        js: ['content.js'],
        runAt: 'document_start',
        persistAcrossSessions: true,
      },
    ]);
    await chrome.storage.local.set({ appOrigin: url.origin });
    return { appOrigin: url.origin };
  }
  if (
    !sender.tab ||
    sender.frameId !== 0 ||
    new URL(sender.url).origin !== appOrigin
  )
    throw new Error('Connect the extension to this Bagiya address first.');
  if (message.action === 'PING')
    return { connected: true, version: chrome.runtime.getManifest().version };
  if (message.action !== 'START') throw new Error('Unsupported command');
  if (saved.monitor && saved.monitor.requestId !== message.body?.requestId)
    throw new Error(
      'This extension is already monitoring a session. End it in Bagiya first.',
    );
  const response = await chrome.tabs.sendMessage(sender.tab.id, {
    action: 'API_START',
    body: {
      sessionTime: message.body?.sessionTime,
      requestId: message.body?.requestId,
      strictMode: true,
      allowedLinks: message.body?.allowedLinks || [],
    },
  });
  if (response.error) throw new Error(response.error);
  const { session, monitorToken } = response.data;
  if (!session.active) {
    await finish(session);
    return { session };
  }
  if (!monitorToken || !session.strictMode || session.appOrigin !== appOrigin)
    throw new Error('The server could not connect monitoring.');
  await saveMonitor({
    appOrigin,
    sessionId: session._id,
    requestId: message.body.requestId,
    token: monitorToken,
    allowedLinks: session.allowedLinks,
    lastCheckAt: Date.now(),
    session,
    ...(saved.monitor?.violation ? { violation: saved.monitor.violation } : {}),
  });
  await chrome.alarms.create('bagiya-finish', {
    when: Date.now() + session.remainingMs,
  });
  await check();
  const current = await snapshot();
  return { session: current.monitor?.session || session };
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  serial(() => messageHandler(message, sender)).then(
    (data) => reply({ data }),
    (error) => reply({ error: error.message }),
  );
  return true;
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (['bagiya-check', 'bagiya-finish'].includes(alarm.name))
    serial(() => check(undefined, alarm.name === 'bagiya-finish')).catch(
      () => {},
    );
});
chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (tab.active && (info.url || info.status === 'complete'))
    chrome.windows
      .get(tab.windowId)
      .then((window) => {
        if (window.focused)
          serial(() => check(info.url || tab.url)).catch(() => {});
      })
      .catch(() => {});
});
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs
    .get(tabId)
    .then(async (tab) => {
      const window = await chrome.windows.get(tab.windowId);
      if (window.focused) return serial(() => check(tab.pendingUrl || tab.url));
    })
    .catch(() => {});
});
chrome.windows.onFocusChanged.addListener(() => {
  setTimeout(() => serial(() => check()).catch(() => {}), 700);
});
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'locked')
    serial(async () => {
      const { monitor } = await snapshot();
      if (monitor) {
        monitor.violation ||= 'device-locked';
        await saveMonitor(monitor);
      }
      await check();
    }).catch(() => {});
});
chrome.runtime.onStartup.addListener(() =>
  serial(async () => {
    const { monitor } = await snapshot();
    if (monitor) {
      monitor.violation ||= 'monitoring-lost';
      await saveMonitor(monitor);
      await check();
    }
  }).catch(() => {}),
);
serial(() => check()).catch(() => {});
