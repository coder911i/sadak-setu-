import { SadakSetuSdk } from '@sadak-setu/frontend-client';

// Initialize SDK with environment-based configuration
const getApiBaseUrl = () => {
  // Try Vite env var first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to Next.js env var
  if (import.meta.env.NEXT_PUBLIC_API_URL) {
    return import.meta.env.NEXT_PUBLIC_API_URL;
  }
  // Default to localhost
  return 'http://localhost:5000/api/v1';
};

const apiBaseUrl = getApiBaseUrl();

// Create SDK instance
const sdk = new SadakSetuSdk({
  baseUrl: apiBaseUrl,
  getToken: () => localStorage.getItem('sadak_setu_token'),
  setToken: (token) => localStorage.setItem('sadak_setu_token', token),
  onUnauthorized: () => {
    // Handle unauthorized - redirect to login or clear auth
    localStorage.removeItem('sadak_setu_token');
    window.location.href = '/login';
  }
});

export const apiService = sdk;

// Authentication helpers
export const authService = {
  login: async (email, password) => {
    const result = await sdk.auth.login({ email, password });
    localStorage.setItem('sadak_setu_token', result.accessToken);
    localStorage.setItem('sadak_setu_refresh_token', result.refreshToken);
    localStorage.setItem('sadak_setu_user', JSON.stringify(result.user));
    return result;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('sadak_setu_refresh_token');
    try {
      await sdk.auth.logout(refreshToken);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sadak_setu_token');
      localStorage.removeItem('sadak_setu_refresh_token');
      localStorage.removeItem('sadak_setu_user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('sadak_setu_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('sadak_setu_token');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('sadak_setu_refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const result = await sdk.auth.refresh(refreshToken);
    localStorage.setItem('sadak_setu_token', result.accessToken);
    localStorage.setItem('sadak_setu_refresh_token', result.refreshToken);
    return result;
  }
};

export default apiService;