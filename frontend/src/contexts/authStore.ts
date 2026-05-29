import { create } from 'zustand';
import { AuthResponse, User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null };
  }

  const rawUser = window.localStorage.getItem('mf_user');
  return {
    user: rawUser ? JSON.parse(rawUser) as User : null,
    accessToken: window.localStorage.getItem('mf_access_token'),
    refreshToken: window.localStorage.getItem('mf_refresh_token'),
  };
};

export const useAuthStore = create<AuthState>((set) => {
  const stored = readStoredAuth();

  return {
    user: stored.user,
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),
    setTokens: (accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('mf_access_token', accessToken);
        window.localStorage.setItem('mf_refresh_token', refreshToken);
      }
      set({ accessToken, refreshToken });
    },
    setAuth: (auth) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('mf_user', JSON.stringify(auth.user));
        window.localStorage.setItem('mf_access_token', auth.accessToken);
        window.localStorage.setItem('mf_refresh_token', auth.refreshToken);
      }
      set({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        error: null,
      });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('mf_user');
        window.localStorage.removeItem('mf_access_token');
        window.localStorage.removeItem('mf_refresh_token');
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    },
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ isLoading: loading }),
  };
});
