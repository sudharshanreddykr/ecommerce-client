import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, logout, updateProfile } from '@/store/slices/authSlice';
import { apiClient } from '@/utils/apiClient';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>('/users/login', credentials);
      if (response.data) {
        apiClient.setAccessToken(response.data.accessToken);
        dispatch(login(response.data));
        return response.data;
      }
      throw new Error(response.message || 'Unable to login');
    },
    [dispatch]
  );

  const handleRegister = useCallback(async (data: RegisterRequest) => {
    const response = await apiClient.post<User>('/users/register', data);
    if (response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Unable to register');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.post('/users/logout');
    } catch (err) {
      console.error('Logout failed on server', err);
    } finally {
      apiClient.removeAccessToken();
      dispatch(logout());
    }
  }, [dispatch]);

  const initializeAuth = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      apiClient.setAccessToken(accessToken);
    }
  }, []);

  const handleProfileUpdate = useCallback(
    (updatedUser: User) => {
      dispatch(updateProfile(updatedUser));
    },
    [dispatch]
  );

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    initializeAuth,
    updateProfile: handleProfileUpdate,
  };
};
