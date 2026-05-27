import { apiClient } from '@/utils/apiClient';
import { PaginatedApiResponse, User } from '@/types';

export const userService = {
  fetchUsers(page = 1, limit = 100, search = '') {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) {
      params.set('search', search);
    }

    return apiClient.get<User[], PaginatedApiResponse<User>>(`/users?${params.toString()}`);
  },
};
