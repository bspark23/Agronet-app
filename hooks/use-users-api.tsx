'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { User, RegisterForm } from '@/lib/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const users = await usersApi.getUsers(100, 0); // Get first 100 users
      setUsers(users || []);
    } catch (err) {
      console.warn('Failed to load users from API:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new user
  const createUser = async (userData: RegisterForm) => {
    try {
      setError(null);
      const response = await usersApi.createUser(userData);

      if (response.data) {
        const newUser = response.data;
        setUsers(prev => [...prev, newUser]);
        return { success: true, user: newUser };
      }

      return {
        success: false,
        error: response.message || 'Failed to create user',
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get user by ID
  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user._id === userId);
  };

  // Get users by role
  const getUsersByRole = (role: 'buyer' | 'farmer' | 'admin') => {
    return users.filter(user => user.role === role);
  };

  // Get verified farmers
  const getVerifiedFarmers = () => {
    return users.filter(
      user =>
        user.role === 'farmer' && user.farmerApplicationStatus === 'approved',
    );
  };

  // Get pending farmer applications
  const getPendingFarmerApplications = () => {
    return users.filter(
      user =>
        user.role === 'farmer' && user.farmerApplicationStatus === 'pending',
    );
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    getUserById,
    getUsersByRole,
    getVerifiedFarmers,
    getPendingFarmerApplications,
  };
}
