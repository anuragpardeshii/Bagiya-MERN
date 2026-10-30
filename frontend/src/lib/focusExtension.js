export function focusExtension(action, body, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const finish = () => {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
    };
    const receive = (event) => {
      if (
        event.source !== window ||
        event.origin !== location.origin ||
        event.data?.channel !== 'bagiya-focus-response' ||
        event.data.id !== id
      )
        return;
      finish();
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.data);
    };
    const timer = setTimeout(() => {
      finish();
      reject(new Error('Connect the Bagiya extension, then reload this page.'));
    }, timeout);
    window.addEventListener('message', receive);
    window.postMessage(
      { channel: 'bagiya-focus-request', action, body, id },
      location.origin,
    );
  });
}
