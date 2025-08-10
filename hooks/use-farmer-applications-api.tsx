'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/api-config';

export interface FarmerApplication {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessDescription: string;
  certifications: string;
  experience: string;
  products: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmerApplicationData {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessDescription: string;
  certifications?: string;
  experience?: string;
  products?: string;
}

export interface UpdateFarmerApplicationStatusData {
  status: 'approved' | 'rejected';
}

export const useFarmerApplicationsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new farmer application
  const createApplication = useCallback(
    async (
      data: CreateFarmerApplicationData,
    ): Promise<FarmerApplication | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<FarmerApplication>(
          API_CONFIG.FARMER_APPLICATIONS.CREATE,
          data,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to create farmer application';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Get all farmer applications (admin only)
  const getApplications = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }): Promise<{
      applications: FarmerApplication[];
      total: number;
      page: number;
      limit: number;
    } | null> => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const url = `${API_CONFIG.FARMER_APPLICATIONS.LIST}${
          queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`;
        const response = await apiClient.get(url);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to fetch farmer applications';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Get a specific farmer application by ID
  const getApplicationById = useCallback(
    async (id: string): Promise<FarmerApplication | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<FarmerApplication>(
          API_CONFIG.FARMER_APPLICATIONS.BY_ID(id),
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to fetch farmer application';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update farmer application status (admin only)
  const updateApplicationStatus = useCallback(
    async (
      id: string,
      data: UpdateFarmerApplicationStatusData,
    ): Promise<FarmerApplication | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.patch<FarmerApplication>(
          API_CONFIG.FARMER_APPLICATIONS.UPDATE_STATUS(id),
          data,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to update application status';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete a farmer application (admin only)
  const deleteApplication = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await apiClient.delete(API_CONFIG.FARMER_APPLICATIONS.DELETE(id));
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to delete farmer application';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    createApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
  };
};
