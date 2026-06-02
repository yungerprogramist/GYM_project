import { create } from 'zustand';
import { registerUser } from '../../shared/api/endpoints/registration';
import { loginUser } from '../../shared/api/endpoints/login';
import { refreshTokens } from '../../shared/api/endpoints/refresh';
import { logoutUser } from '../../shared/api/endpoints/logout';


// пример:
// const login = useAuthStore((state) => state.login);
// const isLoading = useAuthStore((state) => state.isLoading);

// const handleSubmit = async () => {
//   const result = await login(username, password);
  
//   switch (result) {
//     case "successful":
//       router.push('/dashboard');
//       break;
//     case "user not found":
//       setError("Такого пользователя нет");
//       break;
//     case "incorrect password":
//       setError("Неверный пароль");
//       break;
//     case "server error":
//       setError("Проблема с сервером, попробуйте позже");
//       break;
//   }
// };


interface AuthState {
  readonly isLoading: boolean;
  readonly isAuth: boolean;
  readonly _accessToken: string | null;
  
  registration: (username: string, email: string, password: string) => Promise<

    | "successful" 
    | "username is taken" 
    | "email is taken"

    | "incorrect password" // скорее всего короче 6 символов
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
  // Метод для начальной загрузки приложения (проверка авторизации при F5)
  _initAuth: () => Promise<void>;
}

const REFRESH_TOKEN_KEY = 'rt';

const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: true, // Изначально true, пока идет первая проверка initAuth
  isAuth: false,
  _accessToken: null,

  registration: async (username, email, password) => {
    // Включаем лоадер только если не авторизованы
    if (!get().isAuth) set({ isLoading: true });

    const result = await registerUser({ username, email, password });

    if (result.status === 201) {
      localStorage.setItem(REFRESH_TOKEN_KEY, result.data.tokens.refresh);
      set({ 
        _accessToken: result.data.tokens.access, 
        isAuth: true, 
        isLoading: false 
      });
      return "successful";
    }

    set({ isLoading: false });

    if (result.status === 400) {
      if (result.data.username?.some(msg => msg.includes('taken') || msg.includes('уже существует'))) {
        return "username is taken";
      }
      if (result.data.email?.some(msg => msg.includes('taken') || msg.includes('уже существует'))) {
        return "email is taken";
      }
      if (result.data.password) {
        return "incorrect password";
      }
    }

    return "server error";
  },

  login: async (username, password) => {
    if (!get().isAuth) set({ isLoading: true });

    const result = await loginUser({ username, password });

    if (result.status === 200) {
      localStorage.setItem(REFRESH_TOKEN_KEY, result.data.tokens.refresh);
      set({ 
        _accessToken: result.data.tokens.access, 
        isAuth: true, 
        isLoading: false 
      });
      return "successful";
    }

    set({ isLoading: false });

    if (result.status === 401) {
      // Если бэкенд возвращает ошибку, можно смотреть на текст или код.
      // Предположим, если пользователя нет или пароль неверный:
      // if (result.data.error.includes('найден')) return "user not found";
      return "incorrect login or password";
    }

    return "server error";
  },

  logout: async () => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (rt) {
      // logoutUser сам сходит через authClient
      await logoutUser({ refresh: rt });
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ _accessToken: null, isAuth: false, isLoading: false });
  },

  _refreshToken: async () => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!rt) {
      set({ isAuth: false, isLoading: false, _accessToken: null });
      return "refresh token outdated";
    }

    const result = await refreshTokens({ refresh: rt });

    if (result.status === 200) {
      set({ _accessToken: result.data.access, isAuth: true, isLoading: false });
      return "successful";
    }

    // Если 401 (токен протух) или 500 (упал сервер)
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ _accessToken: null, isAuth: false, isLoading: false });

    if (result.status === 401) return "refresh token outdated";
    return "server error";
  },

  _initAuth: async () => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!rt) {
      set({ isLoading: false, isAuth: false });
      return;
    }
    // Пробуем тихо обновить токен при старте страницы
    await get()._refreshToken();
  }
}));

export default useAuthStore;
