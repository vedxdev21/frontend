'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * useAPI - Custom hook for API calls with loading/error states
 * @param {string} endpoint - API endpoint (e.g., '/user/profile')
 * @param {object} options - Configuration options
 */
export function useAPI(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (method = 'GET', body = null, customEndpoint = endpoint) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (method === 'GET') {
          response = await api.get(customEndpoint);
        } else if (method === 'POST') {
          response = await api.post(customEndpoint, body);
        } else if (method === 'PUT') {
          response = await api.put(customEndpoint, body);
        } else if (method === 'DELETE') {
          response = await api.delete(customEndpoint);
        }

        const payload = response.data?.data ?? response.data;
        setData(payload);
        if (!options.silent && response.data?.message) {
          toast.success(response.data.message);
        }
        return payload;
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'An error occurred';
        setError(message);
        if (!options.silent) {
          toast.error(message);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options]
  );

  // Auto-fetch on mount if autoFetch is true
  const fetch = useCallback(
    async (customEndpoint = endpoint) => {
      return execute('GET', null, customEndpoint);
    },
    [execute, endpoint]
  );

  return {
    data,
    loading,
    error,
    execute,
    fetch,
    setData,
  };
}

/**
 * useFetch - Automatically fetch data on mount
 */
export function useFetch(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api_fetch = useCallback(async () => {
    try {
      const response = await api.get(endpoint);
      setData(response.data?.data ?? response.data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch';
      setError(message);
      if (!options.silent) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  // Auto fetch effect can be added here
  useEffect(() => {
    api_fetch();
  }, [api_fetch]);

  return { data, loading, error, refetch: api_fetch };
}

/**
 * useUpload - Handle file uploads with progress
 */
export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (endpoint, file, additionalData = {}) => {
    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Append additional data
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      const payload = response.data?.data ?? response.data;
      toast.success(response.data?.message || 'Upload successful');
      return payload;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Upload failed';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, []);

  return { upload, loading, progress };
}
