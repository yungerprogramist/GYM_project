// Сохранение токенов
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

// Получение токенов
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

// Удаление токенов (выход)
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Обновление access токена
export const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/users/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      clearTokens();
      return null;
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};

// Функция для авторизованных запросов
export const authFetch = async (url: string, options: RequestInit = {}) => {
  let accessToken = getAccessToken();
  
  const makeRequest = async (token: string | null) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    return fetch(url, { ...options, headers });
  };
  
  let response = await makeRequest(accessToken);
  
  // Если токен просрочен (401), пробуем обновить
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }
  
  return response;
};

// Функция выхода
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();
  
  if (refreshToken && accessToken) {
    try {
      await fetch('http://127.0.0.1:8000/api/users/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearTokens();
};

// Получение профиля пользователя
export const getUserProfile = async () => {
  const response = await authFetch('http://127.0.0.1:8000/api/users/profile/');
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch profile');
};