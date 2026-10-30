import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export function useUsernameAvailability(value, enabled = true) {
  const username = value.trim().toLowerCase();
  const cache = useRef(new Map());
  const [result, setResult] = useState(null);
  const valid = /^[a-z0-9_]{3,30}$/.test(username);
  useEffect(() => {
    if (!enabled || !valid) return;
    const saved = cache.current.get(username);
    if (saved && saved.expires > Date.now()) {
      setResult(saved);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await api(
          `/auth/username-availability?username=${encodeURIComponent(username)}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        const next = {
          username,
          state: data.available ? 'available' : 'taken',
          expires: Date.now() + 30000,
        };
        if (cache.current.size >= 50)
          cache.current.delete(cache.current.keys().next().value);
        cache.current.set(username, next);
        setResult(next);
      } catch {
        if (!controller.signal.aborted) setResult({ username, state: 'error' });
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, enabled, valid]);
  if (!enabled || !username) return 'idle';
  if (!valid) return 'invalid';
  return result?.username === username ? result.state : 'checking';
}
