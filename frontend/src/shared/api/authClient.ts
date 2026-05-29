import axios from 'axios';
import useAuthStore from '../../features/auth';

export const authClient = axios.create({
  baseURL: '/api/',
  headers: { 'Content-Type': 'application/json' },
});

// Интерцептор запроса, добавление токена к каждому запросу
authClient.interceptors.request.use((config) => {
  // Достаем приватный токен из стейта Zustand (работает лениво)
  const token = useAuthStore.getState()._accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Интерцептор ответа, автоматическое обновление при 401
authClient.interceptors.response.use(
  (response) => response, // Если всё хорошо, просто возвращаем ответ
  async (error) => {
    const originalRequest = error.config;

    // Проверяем: это 401 ошибка и мы еще НЕ пытались обновиться в рамках этого запроса?
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Ставим флаг, чтобы не уйти в бесконечный цикл

      const refreshResult = await useAuthStore.getState()._refreshToken();

      if (refreshResult === 'successful') {
        const newToken = useAuthStore.getState()._accessToken;
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return authClient(originalRequest);
      } else {
        console.warn('Сессия полностью истекла');
        // можно еще что-то добавить
      }
    }

    // Если ошибка не связана с 401 или рефреш не удался, прокидываем её дальше в catch компонента
    return Promise.reject(error);
  }
);
