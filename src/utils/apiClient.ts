import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor(
    baseURL: string = ((import.meta as any).env?.VITE_API_BASE_URL as string) ||
      'http://localhost:3000/api/v1'
  ) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Crucial for sending and receiving cookies
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Trigger refresh token API on auth token expire (401 error)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // refreshToken is now handled by HTTP-only cookie, 
            // so we don't need to pass it in the body.
            const response = await this.client.post('/users/refresh-token');

            const { accessToken } = response.data;
            this.setAccessToken(accessToken);
            this.processQueue(null, accessToken);
            
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private handleLogout() {
    this.removeAccessToken();
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  async get<T, R = ApiResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    const response = await this.client.get<R>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  removeAccessToken() {
    localStorage.removeItem('accessToken');
    delete this.client.defaults.headers.common['Authorization'];
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
