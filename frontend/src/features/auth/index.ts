import { create } from 'zustand';
import { registerUser } from '../../shared/api/endpoints/registration';
import { loginUser } from '../../shared/api/endpoints/login';
import { refreshTokens } from '../../shared/api/endpoints/refresh';
import { logoutUser } from '../../shared/api/endpoints/logout';

interface AuthState {
  readonly isAppLoading: boolean;
  readonly isLoggingIn: boolean;
  readonly isRegistering: boolean;
  readonly isLoggingOut: boolean;
  readonly isAuth: boolean;
  readonly _accessToken: string | null;
  
  registration: (username: string, email: string, password: string) => Promise<
    | "successful" 
    | "username is taken" 
    | "email is taken"
    | "incorrect password" 
    | "server error"
  >;
  login: (username: string, password: string) => Promise<
    | "successful" 
    | "user not found" 
    | "incorrect password" 
    | "incorrect login or password"
    | "server error"
  >;
  logout: () => Promise<void>;
  _refreshToken: () => Promise<
    | "successful"
    | "refresh token outdated"
    | "server error"
  >;
  _initAuth: () => Promise<void>;
}

const REFRESH_TOKEN_KEY = 'rt';

const useAuthStore = create<AuthState>((set, get) => ({
  isAppLoading: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isRegistering: false,
  isAuth: false,
  _accessToken: null,

  registration: async (username, email, password) => {
    set({ isRegistering: true });
    try {
      const result = await registerUser({ username, email, password });

      if (result.status === 201) {
        localStorage.setItem(REFRESH_TOKEN_KEY, result.data.tokens.refresh);
        set({ 
          _accessToken: result.data.tokens.access, 
          isAuth: true
        });
        return "successful";
      }

      if (result.status === 400) {
        if (result.data.username?.some((msg: string) => msg.includes('taken') || msg.includes('уже существует'))) {
          return "username is taken";
        }
        if (result.data.email?.some((msg: string) => msg.includes('taken') || msg.includes('уже существует'))) {
          return "email is taken";
        }
        if (result.data.password) {
          return "incorrect password";
        }
      }

      return "server error";
    } catch (error) {
      console.error('Registration error:', error);
      return "server error";
    } finally {
      set({ isRegistering: false });
    }
  },

  login: async (username, password) => {
    set({ isLoggingIn: true });
    try {
      const result = await loginUser({ username, password });

      if (result.status === 200) {
        localStorage.setItem(REFRESH_TOKEN_KEY, result.data.tokens.refresh);
        set({ 
          _accessToken: result.data.tokens.access, 
          isAuth: true,
        });
        return "successful";
      }

      if (result.status === 401) {
        return "incorrect login or password";
      }

      return "server error";
    } catch (error) {
      console.error('Login error:', error);
      return "server error";
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (rt) {
        await logoutUser({ refresh: rt });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ _accessToken: null, isAuth: false, isLoggingOut: false });
    }
  },

  _refreshToken: async () => {
      const rt = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!rt) {
        console.log('❌ [Refresh] No refresh token found');
        set({ isAuth: false, _accessToken: null });
        return "refresh token outdated";
      }
      console.log('🔄 [Refresh] Token exists:', rt);

      console.log('🔄 [Refresh] Calling API...');
      const result = await refreshTokens({ refresh: rt });
      console.log('🔄 [Refresh] Response status:', result.status);

      switch (result.status) {
        case 200:
          console.log('✅ [Refresh] Success, new access token received');
          set({ _accessToken: result.data.access, isAuth: true });
          return "successful";

        case 401:
          console.log('❌ [Refresh] Token expired/invalid:', result.data.detail);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          set({ _accessToken: null, isAuth: false });
          return "refresh token outdated";

        case 500:
          console.error('❌ [Refresh] Server error:', result.data.message);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          set({ _accessToken: null, isAuth: false });
          return "server error";
      }
  },

  _initAuth: async () => {
    set({ isAppLoading: true });
    try {
      const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!rt) {
        set({ isAuth: false });
        return;
      }
      await get()._refreshToken();
    } catch (error) {
      console.error('Init auth error:', error);
    } finally {
      set({ isAppLoading: false });
    }
  }
}));

export default useAuthStore;
