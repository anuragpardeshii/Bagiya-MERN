import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
export function useResource(path, { revalidateOnFocus = false } = {}) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!revalidateOnFocus) return;
    let lastRefresh = Date.now();
    const refreshVisible = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastRefresh > 10000
      ) {
        lastRefresh = Date.now();
        reload();
      }
    };
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      window.removeEventListener('focus', refreshVisible);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [revalidateOnFocus, reload]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api(path, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, version]);
  return { data, setData, error, loading, reload };
}
