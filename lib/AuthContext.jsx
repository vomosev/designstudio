'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      const nextUser = data && data.user ? data.user : null;
      if (!mountedRef.current) return nextUser;
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'anonymous');
      setError(null);
      return nextUser;
    } catch (err) {
      if (!mountedRef.current) return null;
      setUser(null);
      setStatus('anonymous');
      // A 401 simply means nobody is signed in — that is not a surfaced error.
      if (err && err.status && err.status !== 401) {
        setError(err.message || 'Unable to verify your session.');
      } else {
        setError(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    // Runtime-only session check; never runs during the build.
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await apiLogin({ email, password });
      const nextUser = data && data.user ? data.user : null;
      if (mountedRef.current) {
        setUser(nextUser);
        setStatus(nextUser ? 'authenticated' : 'anonymous');
      }
      return nextUser;
    } catch (err) {
      const message = (err && err.message) || 'Unable to sign in right now.';
      if (mountedRef.current) {
        setError(message);
        setStatus('anonymous');
      }
      throw err;
    }
  }, []);

  const signUp = useCallback(async (payload) => {
    setError(null);
    try {
      const data = await apiSignup(payload);
      const nextUser = data && data.user ? data.user : null;
      if (mountedRef.current) {
        setUser(nextUser);
        setStatus(nextUser ? 'authenticated' : 'anonymous');
      }
      return nextUser;
    } catch (err) {
      const message = (err && err.message) || 'Unable to create that account.';
      if (mountedRef.current) {
        setError(message);
        setStatus('anonymous');
      }
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      // Even if the network call fails we clear local state so the UI is consistent.
      if (mountedRef.current && err && err.status && err.status >= 500) {
        setError(err.message || 'Signed out locally, but the studio API did not respond.');
      }
    } finally {
      if (mountedRef.current) {
        setUser(null);
        setStatus('anonymous');
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      signIn,
      signUp,
      signOut,
      refresh,
      clearError: () => setError(null),
    }),
    [user, status, error, signIn, signUp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export default AuthContext;