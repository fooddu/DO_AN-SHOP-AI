import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import client from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Register
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await client.post('/users/register', { name, email, password });

      if (data.success) {
        await AsyncStorage.setItem('token', data.data?.id || 'token');
        set({ 
          user: data.data, 
          isLoggedIn: true, 
          loading: false,
          error: null 
        });
        return { success: true, data: data.data };
      } else {
        const errorMsg = data.message || 'Registration failed';
        set({ error: errorMsg, loading: false });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || 'An error occurred';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Check auth status
  checkAuth: async () => {
    set({ loading: true });
    try {
      const token = await AsyncStorage.getItem('user');
      if (token) {
        set({ isLoggedIn: true, loading: false });
      } else {
        set({ isLoggedIn: false, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Login
  login: async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
      set({ isLoggedIn: true });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      set({ user: null, isLoggedIn: false });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const data = await client.post('/users/forgot-password', { email });
      set({ loading: false });
      if (data.success) {
        return { success: true };
      } else {
        set({ error: data.error || 'Error' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const data = await client.post('/users/verify-otp', { email, otp });
      set({ loading: false });
      if (data.success) {
        return { success: true };
      } else {
        set({ error: data.error || 'Error' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Set New Password
  setNewPassword: async (email, otp, newPassword) => {
    set({ loading: true, error: null });
    try {
      const data = await client.post('/users/set-new-password', { email, otp, newPassword });
      set({ loading: false });
      if (data.success) {
        return { success: true };
      } else {
        set({ error: data.error || 'Error' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },
}));

export default useAuthStore;

