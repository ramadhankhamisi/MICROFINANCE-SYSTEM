import { useCallback } from 'react';
import { useAuthStore } from '@/contexts/authStore';
import { api } from '@/utils/api';
import { AuthResponse } from '@/types';

export const useAuth = () => {
  const { user, accessToken, isLoading, error, setAuth, logout, setError, setLoading } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/auth/login', { email, password });
        setAuth(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setError, setLoading]
  );

  const register = useCallback(
    async (userData: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/auth/register', userData);
        setAuth(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setError, setLoading]
  );

  const handleLogout = useCallback(
    async (refreshToken?: string) => {
      try {
        if (refreshToken) {
          await api.post('/auth/logout', { refreshToken });
        }
      } finally {
        logout();
      }
    },
    [logout]
  );

  return {
    user,
    accessToken,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    isAuthenticated: !!accessToken,
  };
};
