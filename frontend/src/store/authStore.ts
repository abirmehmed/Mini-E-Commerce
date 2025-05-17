import { create } from 'zustand';
import axios, { AxiosInstance } from 'axios';

interface User {
  id: number;
  email: string;
  fullName?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  phone?: string;
  role?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  authAxios: AxiosInstance;
  initializeAuth: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, formData: Partial<User>) => Promise<void>;
  signOut: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthStore>((set, get) => {
  // Create axios instance with interceptor
  const authAxios = axios.create({
    baseURL: 'http://localhost:5000',
  });

  // Initialize function
  const initializeAuth = () => {
    authAxios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    authAxios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && !error.config._retry) {
          try {
            error.config._retry = true;
            await get().refreshToken();
            return authAxios(error.config);
          } catch (refreshError) {
            get().signOut();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  };

  return {
    user: null,
    loading: false,
    error: null,
    authAxios,
    initializeAuth,

    signIn: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await authAxios.post('/api/auth/signin', { email, password });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        set({ user, loading: false });
      } catch (error: any) {
        set({ 
          error: error.response?.data?.error || 'Login failed', 
          loading: false 
        });
        throw error;
      }
    },

    signUp: async (email, password, formData) => {
      set({ loading: true, error: null });
      try {
        const response = await authAxios.post('/api/auth/signup', { 
          email, 
          password, 
          ...formData 
        });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        set({ user, loading: false });
      } catch (error: any) {
        set({ 
          error: error.response?.data?.error || 'Registration failed', 
          loading: false 
        });
        throw error;
      }
    },

    signOut: () => {
      localStorage.removeItem('token');
      set({ user: null, error: null });
    },

    refreshToken: async () => {
      try {
        const response = await authAxios.post('/api/auth/refresh');
        const { token } = response.data;
        localStorage.setItem('token', token);
      } catch (error) {
        throw error;
      }
    },

    clearError: () => set({ error: null })
  };
});