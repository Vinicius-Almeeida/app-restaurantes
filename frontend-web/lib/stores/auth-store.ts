import { create } from 'zustand';
import { apiClient, setAuthStoreHooks } from '../api/client';
import { socketManager } from '../socket';
import type { User, AuthResponse } from '../types';

/**
 * Login context type - defines which login portal is being used
 * This is validated by the backend for role isolation
 */
export type LoginContext = 'customer' | 'restaurant' | 'admin';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  login: (email: string, password: string, context?: LoginContext) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  refreshToken: null,

  /**
   * Login with context-aware role validation
   *
   * @param email - User email
   * @param password - User password
   * @param context - Login context for role validation (customer, restaurant, admin)
   *
   * SECURITY: The context is validated by the backend to ensure users
   * can only login from their designated portal
   */
  login: async (email: string, password: string, context: LoginContext = 'customer') => {
    try {
      // Use context-aware login endpoint for role isolation
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/login/context', {
        email,
        password,
        context,
      });

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in memory (Zustand) - NEVER localStorage
      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true
      });

      // Update socket authentication
      socketManager.updateAuth(accessToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in memory (Zustand) - NEVER localStorage
      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true
      });

      // Update socket authentication
      socketManager.updateAuth(accessToken);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: () => {
    // Clear tokens from memory
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    });

    // Disconnect socket
    socketManager.disconnect();
  },

  checkAuth: async () => {
    const { accessToken } = get();

    if (!accessToken) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await apiClient.get<{ data: User }>('/auth/profile');
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Clear tokens on auth failure
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      });
      socketManager.disconnect();
    }
  },

  updateTokens: (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshToken });
    socketManager.updateAuth(accessToken);
  },

  getAccessToken: () => {
    return get().accessToken;
  },

  getRefreshToken: () => {
    return get().refreshToken;
  },
}));

// Register auth store hooks with API client
// This allows API client to access tokens from Zustand store
if (typeof window !== 'undefined') {
  setAuthStoreHooks(
    () => useAuthStore.getState().getAccessToken(),
    () => useAuthStore.getState().getRefreshToken(),
    (accessToken: string, refreshToken: string) => useAuthStore.getState().updateTokens(accessToken, refreshToken),
    () => useAuthStore.getState().logout()
  );
}
