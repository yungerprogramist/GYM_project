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
    | "already registering"
  >;
  login: (username: string, password: string) => Promise<
    | "successful"
    | "user not found"
    | "incorrect password"
    | "incorrect login or password"
    | "server error"
    | "already loading"
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

const useAuthStore = create<AuthState>((set, get) => {
  let currentRefreshPromise: Promise<"successful" | "refresh token outdated" | "server error"> | null = null;
  let initAuthPromise: Promise<void> | null = null;

  return {
    isAppLoading: true,
    isLoggingIn: false,
    isLoggingOut: false,
    isRegistering: false,
    isAuth: false,
    _accessToken: null,

    registration: async (username, email, password) => {
      if (get().isRegistering) return "already registering";
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
      if (get().isLoggingIn) return "already loading";
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
      if (get().isLoggingOut) return
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
      if (currentRefreshPromise) return currentRefreshPromise;

      currentRefreshPromise = (async () => {
        try {
          console.log("вызов обновления токена")
          const rt = localStorage.getItem(REFRESH_TOKEN_KEY);

          if (!rt) {
            set({ isAuth: false, _accessToken: null });
            return "refresh token outdated";
          }
          const result = await refreshTokens({ refresh: rt });
          switch (result.status) {
            case 200:
              set({ _accessToken: result.data.access, isAuth: true });
              localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refresh);
              return "successful";

            case 401:
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              set({ _accessToken: null, isAuth: false });
              return "refresh token outdated";

            case 500:
              return "server error";
          }
        } finally {
          currentRefreshPromise = null;
        }
      })();
      return currentRefreshPromise;
    },

    _initAuth: async () => {
      if (initAuthPromise) return initAuthPromise;

      initAuthPromise = (async () => {
        console.log("начальная инициализация");
        set({ isAppLoading: true });
        try {
          await get()._refreshToken();
        } catch (error) {
          console.error('Init auth error:', error);
        } finally {
          set({ isAppLoading: false });
          initAuthPromise = null;  // ← сбрасываем, чтобы можно было вызвать снова
          console.log("информация о входе, после init: ", get());
        }
      })();

      return initAuthPromise;
    }
  }
});

export default useAuthStore;
