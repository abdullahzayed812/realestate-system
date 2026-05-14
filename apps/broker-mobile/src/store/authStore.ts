import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
  preferredLang: 'ar' | 'en';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, tokens) => {
    await AsyncStorage.multiSet([
      ['access_token', tokens.accessToken],
      ['refresh_token', tokens.refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('access_token');
      if (userStr && token) {
        set({ user: JSON.parse(userStr) as User, isAuthenticated: true });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
