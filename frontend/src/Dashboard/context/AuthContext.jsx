import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setError('');
    try {
      const data = await api('/auth/check-auth');
      setUser(data);
      return data;
    } catch (err) {
      if (err.status === 401) setUser(null);
      else setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const clear = () => setUser(null);
    window.addEventListener('bagiya:unauthorized', clear);
    return () => window.removeEventListener('bagiya:unauthorized', clear);
  }, [refresh]);
  const login = async (form) => {
    const data = await api('/auth/login', { method: 'POST', body: form });
    setError('');
    setUser(data.user);
    if (data.dailyReward?.coins)
      toast.success('Welcome back! 10 daily-login coins added.');
  };
  const logout = async () => {
    await api('/auth/logout', { method: 'POST', body: {} });
    setError('');
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, error, refresh, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
