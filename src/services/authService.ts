import { apiClient } from '@/utils/apiClient';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  User,
} from '@/types';

export const authService = {
  login(credentials: LoginRequest) {
    return apiClient.post<LoginResponse>('/users/login', credentials);
  },

  register(payload: RegisterRequest) {
    return apiClient.post<ApiResponse<User>>('/users/register', payload);
  },

  getProfile() {
    return apiClient.get<User>('/users/profile');
  },

  updateProfile(userId: string, updates: UpdateUserRequest) {
    return apiClient.put<User>(`/users/${userId}`, updates);
  },
};
