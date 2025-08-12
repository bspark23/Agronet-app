'use client';

import { useEffect, useState } from 'react';
import { farmerApplicationsApi } from '@/lib/api';
import type {
  FarmerApplication,
  CreateFarmerApplicationForm,
} from '@/lib/types';

export function useFarmerApplications() {
  const [applications, setApplications] = useState<FarmerApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await farmerApplicationsApi.getApplications();
      setApplications(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load applications';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getApplication = async (id: string) => {
    try {
      setError(null);
      return await farmerApplicationsApi.getApplication(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get application';
      setError(message);
      throw err;
    }
  };

  const createApplication = async (payload: CreateFarmerApplicationForm) => {
    try {
      setError(null);
      const res = await farmerApplicationsApi.createApplication(payload);
      // Backend now returns { success: boolean, data?: T, message?: string, error?: string }
      if (res.success && res.data) {
        setApplications(prev => [...prev, res.data!]);
        return { success: true, application: res.data } as const;
      }
      return {
        success: false,
        error: res.error || 'Failed to create application',
      } as const;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create application';
      setError(message);
      return { success: false, error: message } as const;
    }
  };

  const updateApplication = async (
    id: string,
    updates: Partial<CreateFarmerApplicationForm>,
  ) => {
    try {
      setError(null);
      const res = await farmerApplicationsApi.updateApplication(id, updates);
      // Backend now returns { success: boolean, data?: T, message?: string, error?: string }
      if (res.success && res.data) {
        setApplications(prev => prev.map(a => (a._id === id ? res.data! : a)));
        return { success: true, application: res.data } as const;
      }
      return {
        success: false,
        error: res.error || 'Failed to update application',
      } as const;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update application';
      setError(message);
      return { success: false, error: message } as const;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      setError(null);
      await farmerApplicationsApi.deleteApplication(id);
      // If no error thrown, assume success
      setApplications(prev => prev.filter(a => a._id !== id));
      return { success: true } as const;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete application';
      setError(message);
      return { success: false, error: message } as const;
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    loadApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
  };
}
