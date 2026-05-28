import { create } from 'zustand';
import { registration as apiRegister } from '../../shared/api/endpoints/registration';
import { login as apiLogin } from '../../shared/api/endpoints/login';
import { refresh as apiRefresh } from '../../shared/api/endpoints/refresh';
import { logout as apiLogout } from '../../shared/api/endpoints/logout';
import type { AxiosError } from '../../shared/api/client';

interface AuthState {
  readonly isInitializing: boolean,
  readonly isAuth: boolean;
  readonly _accessToken: string | null;
  registration: (username: string, password: string) => Promise<
    | "successful" 
    | "username is taken" 
    | "incorrect password" 
    | "server error"
  >;
  login: (username: string, password: string) => Promise<
    | "successful" 
    | "user not found" 
    | "incorrect password" 
    | "server error"
  >;
  logout: () => Promise<void>;
  _refreshToken: () => Promise<
    | "successful"
    | "refresh token outdated"
    | "server error"
  >;
}

const REFRESH_TOKEN_KEY = 'rt';

const useAuthStore = create<AuthState>((set, get) => ({
  isInitializing: true, // Изначально всегда true, пока идет первая проверка
  isAuth: false,
  _accessToken: null,

  registration: async (username, password) => {
    await get().logout();

    try {
      await apiRegister({ username, password });
      return "successful";
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) return "username is taken";
      if (axiosError.response?.status === 422) return "incorrect password";
      return "server error";
    }
  },

  login: async (username, password) => {
    await get().logout();

    try {
      const response = await apiLogin({ username, password });
      const { accessToken, refreshToken } = response.data as { accessToken: string; refreshToken: string };

      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      set({
        isAuth: true,
        _accessToken: accessToken,
      });
      return "successful";
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) return "user not found";
      if (axiosError.response?.status === 401) return "incorrect password";
      return "server error";
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const accessToken = get()._accessToken;

    if (refreshToken || accessToken) {
      try {
        await apiLogout({
          refreshToken: refreshToken ?? '',
          accessToken: accessToken ?? undefined,
        });
      } catch (error) {
        console.error('Failed to blacklist tokens on backend:', error);
      }
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({
      isAuth: false,
      _accessToken: null,
    });
  },

  _refreshToken: async () => {
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!currentRefreshToken) return "refresh token outdated";

    try {
      const response = await apiRefresh({ refreshToken: currentRefreshToken });
      const { accessToken, refreshToken } = response.data as { accessToken: string; refreshToken: string };

      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      set({
        isAuth: true,
        _accessToken: accessToken,
      });
      return "successful";
    } catch (error) {
      const axiosError = error as AxiosError;
      
      await get().logout();

      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        return "refresh token outdated";
      }
      return "server error";
    }
  },

  initAuth: async () => {
    const hasToken = !!localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (hasToken) {
      try {
        await get()._refreshToken();
      } catch {
        // Ошибки сброса состояния обработаны внутри _refreshToken
      } finally {
        set({ isInitializing: false }); // Гарантированно выключаем лоадер
      }
    } else {
      set({ 
        isAuth: false, 
        isInitializing: false 
      });
    }
  }
}));

export default useAuthStore
