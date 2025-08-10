'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import type { User, LoginForm, RegisterForm } from '@/lib/types';

export function useAuthApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authApi.getProfile();
      return user;
    } catch (err: any) {
      setError(err.message || 'Failed to get profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    getProfile,
    isLoading,
    error,
  };
}
