import { client } from '../client';

// Входные данные
export interface RegisterRequest {
  username: string;
  email: string;
  password: string; // min_length: 6
}

// Для каждого кода ошибки свой тип возвращаемых данных
export type RegisterResponse =

  | { 
      status: 201; 
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
      status: 400; 
      data: {
        username?: string[];
        password?: string[];
        email?: string[];
      };
    }

  | { 
      status: 500; 
      data: {
        message: string;
      };
    };

export async function registerUser(body: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await client.post<any>(
      'users/register/', 
      body, 
      {
        validateStatus: (status) => status === 201 || status === 400,
      }
    );

    return {
      status: response.status,
      data: response.data,
    } as RegisterResponse;

  } catch (error) {
    // Сюда код упадет при аварии: нет сети, статус 500, 502, 403 и т.д.
    console.error('Критическая ошибка при регистрации пользователя:', error);

    // Безопасно возвращаем 500 статус с предсказуемой структурой данных
    return {
      status: 500,
      data: { message: 'Произошла непредвиденная ошибка сети или инфраструктуры' },
    };
  }
}
