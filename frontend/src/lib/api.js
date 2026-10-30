export async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  try {
    const response = await fetch(`/api${path}`, {
      ...options,
      signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Bagiya-Request': '1',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401)
        window.dispatchEvent(new Event('bagiya:unauthorized'));
      const details = data.fields
        ? Object.values(data.fields).flat().join('. ')
        : '';
      const error = new Error(
        details || data.message || 'The request could not be completed',
      );
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError' && !options.signal?.aborted)
      throw new Error('The request timed out. Please retry.');
    if (error instanceof TypeError)
      throw new Error(
        'Unable to connect. Check your connection and try again.',
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export const number = (value = 0) => new Intl.NumberFormat('en').format(value);
export const minutes = (value = 0) =>
  value >= 60 ? `${Math.floor(value / 60)}h ${value % 60}m` : `${value}m`;
export const dateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
