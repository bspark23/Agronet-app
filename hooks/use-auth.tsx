'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { authApi } from '@/lib/api';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  emailVerified: boolean;
  accountStatus: 'pending' | 'active' | 'banned';
  role: 'buyer' | 'farmer' | 'admin';
  farmerApplicationStatus?: 'pending' | 'approved' | 'rejected';
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role?: 'buyer' | 'farmer' | 'admin',
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBuyer: boolean;
  isSeller: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('agronet_token');
        if (!token) return;
        const profile = await authApi.getProfile();
        if (active) setUser(profile as unknown as User);
      } catch (err) {
        // Token invalid/expired
        localStorage.removeItem('agronet_token');
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authApi.login({ email, password });

      if (response?.user && response?.token) {
        console.log('✅ Login successful, storing token');
        localStorage.setItem('agronet_token', response.token);
        // Fetch fresh profile from server to avoid trusting local copy
        try {
          const profile = await authApi.getProfile();
          setUser(profile as unknown as User);
        } catch {
          // if profile fails, still consider login failed
          localStorage.removeItem('agronet_token');
          return false;
        }
        return true;
      }

      console.log('❌ Login failed: Invalid response');
      return false;
    } catch (error) {
      console.error('❌ Error during login:', error);
      return false;
    }
  };

  const register = async (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role: 'buyer' | 'farmer' | 'admin' = 'buyer',
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register({
        firstname,
        lastname,
        email,
        password,
        role,
      });

      if (response?.user && response?.token) {
        localStorage.setItem('agronet_token', response.token);
        try {
          const profile = await authApi.getProfile();
          setUser(profile as unknown as User);
        } catch {
          localStorage.removeItem('agronet_token');
          return { success: false, error: 'Failed to load profile' };
        }
        return { success: true };
      }

      return {
        success: false,
        error: response.message || 'Registration failed',
      };
    } catch (error: any) {
      console.error('Error during registration:', error);
      const errorMessage = error?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agronet_token');
  };

  // Helper functions
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isBuyer = user?.role === 'buyer';
  const isSeller = user?.role === 'farmer';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated,
        isAdmin,
        isBuyer,
        isSeller,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
