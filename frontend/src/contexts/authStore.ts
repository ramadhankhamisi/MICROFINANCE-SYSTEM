import { create } from 'zustand';
import { User, AuthResponse } from '@/types';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setAuth: (auth) => set({
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    error: null,
  }),
  logout: () => set({
    user: null,
    accessToken: null,
    refreshToken: null,
  }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
