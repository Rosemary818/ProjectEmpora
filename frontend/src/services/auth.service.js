import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

export const authService = {
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const token = localStorage.getItem('accessToken');

      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch (error) {
      console.warn('Backend logout call error:', error);
    } finally {
      // Clear all stored credentials and auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOtp');
    }
  }
};

export default authService;
