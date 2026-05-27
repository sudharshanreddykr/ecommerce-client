import { useState, useCallback, useEffect } from 'react';
import { ApiResponse } from '@/types';
import { getErrorMessage } from '@/utils/validation';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      apiCall: () => Promise<ApiResponse<T>>,
      onSuccess?: (data: T) => void,
      onError?: (error: string) => void
    ) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiCall();
        if (response.data) {
          setState({ data: response.data, loading: false, error: null });
          onSuccess?.(response.data);
          return response.data;
        } else {
          const errorMsg = response.message || 'Unknown error occurred';
          setState({ data: null, loading: false, error: errorMsg });
          onError?.(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setState({ data: null, loading: false, error: errorMsg });
        onError?.(errorMsg);
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};

export const useAsyncData = <T>(asyncFn: () => Promise<T>, deps?: React.DependencyList) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, deps || []);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};
