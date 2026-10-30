(() => {
  if (globalThis.bagiyaBridgeInstalled || window !== window.top) return;
  globalThis.bagiyaBridgeInstalled = true;
  window.addEventListener('message', async (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    const message = event.data;
    if (
      message?.channel !== 'bagiya-focus-request' ||
      !['PING', 'START'].includes(message.action) ||
      typeof message.id !== 'string'
    )
      return;
    try {
      const result = await chrome.runtime.sendMessage({
        action: message.action,
        body: message.body,
      });
      window.postMessage(
        { channel: 'bagiya-focus-response', id: message.id, ...result },
        location.origin,
      );
    } catch {
      window.postMessage(
        {
          channel: 'bagiya-focus-response',
          id: message.id,
          error: 'Reload this page after connecting or updating the extension.',
        },
        location.origin,
      );
    }
  });
  // Only the extension service worker can request this cookie-authenticated, same-origin operation.
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (sender.id !== chrome.runtime.id || message.action !== 'API_START')
      return;
    (async () => {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        credentials: 'same-origin',
        signal: AbortSignal.timeout(15000),
        headers: {
          'Content-Type': 'application/json',
          'X-Bagiya-Request': '1',
        },
        body: JSON.stringify(message.body),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.fields
            ? Object.values(data.fields).flat().join('. ')
            : data.message || 'Unable to start Strict focus',
        );
      reply({ data });
    })().catch((error) => reply({ error: error.message }));
    return true;
  });
})();
