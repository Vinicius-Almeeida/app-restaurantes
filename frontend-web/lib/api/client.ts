import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Get auth tokens from Zustand store
 * NOTE: These functions will be set by the auth store
 */
let getAccessTokenFromStore: (() => string | null) | null = null;
let getRefreshTokenFromStore: (() => string | null) | null = null;
let updateTokensInStore: ((accessToken: string, refreshToken: string) => void) | null = null;
let clearAuthInStore: (() => void) | null = null;

export function setAuthStoreHooks(
  getAccessToken: () => string | null,
  getRefreshToken: () => string | null,
  updateTokens: (accessToken: string, refreshToken: string) => void,
  clearAuth: () => void
) {
  getAccessTokenFromStore = getAccessToken;
  getRefreshTokenFromStore = getRefreshToken;
  updateTokensInStore = updateTokens;
  clearAuthInStore = clearAuth;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token from Zustand store
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined' && getAccessTokenFromStore) {
          const token = getAccessTokenFromStore();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token from Zustand store
          if (getRefreshTokenFromStore && updateTokensInStore && clearAuthInStore) {
            const refreshToken = getRefreshTokenFromStore();

            if (refreshToken) {
              try {
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                  refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Update tokens in Zustand store
                updateTokensInStore(accessToken, newRefreshToken);

                // Retry original request with new token
                if (error.config.headers) {
                  error.config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return this.client.request(error.config);
              } catch (refreshError) {
                // Refresh failed, clear auth and redirect
                clearAuthInStore();
                if (typeof window !== 'undefined') {
                  window.location.href = '/login';
                }
              }
            } else {
              // No refresh token, redirect to login
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
