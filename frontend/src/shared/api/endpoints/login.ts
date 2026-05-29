import { client } from '../client';

// Входные данные
export interface LoginRequest {
  username: string;
  password: string;
}

// Монолитный тип ответа
export type LoginResponse =

  | {
      status: 200;
      data: {
        message: string;
        user: {
          id: number;
          username: string;
          email: string;
          first_name: string;
          last_name: string;
          profile: {
            id: number;
            language: string;
            theme: string;
          };
        };
        tokens: {
          refresh: string;
          access: string;
        };
      };
    }
  | {
      status: 401;
      data: {
        error: string; // "Неверный логин или пароль"
      };
    }

  | {
      status: 500;
      data: {
        message: string;
      };
    };

export async function loginUser(body: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await client.post<any>(
      'users/login/',
      body,
      {
        // Пропускаем 200 и 401 как штатные бизнес-ответы
        validateStatus: (status) => status === 200 || status === 401,
      }
    );

    return {
      status: response.status,
      data: response.data,
    } as LoginResponse;

  } catch (error) {
    console.error('Критическая ошибка при авторизации пользователя:', error);
    return {
      status: 500,
      data: { message: 'Произошла непредвиденная ошибка сети или инфраструктуры' },
    };
  }
}
