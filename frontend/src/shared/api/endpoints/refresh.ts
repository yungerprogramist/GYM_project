import { client } from '../client';

// Входные данные
export interface RefreshRequest {
  refresh: string;
}

// Монолитный тип ответа
export type RefreshResponse =
  | {
    status: 200;
    data: {
      access: string;
      refresh: string;
    };
  }
  | {
    status: 401;
    data: {
      detail: string; // "Token is invalid or expired"
      code: string;   // "token_not_valid"
    };
  }

  | {
    status: 500;
    data: {
      message: string;
    };
  };

export async function refreshTokens(body: RefreshRequest): Promise<RefreshResponse> {
  try {
    const response = await client.post<any>(
      'users/refresh/',
      body,
      {
        // Пропускаем 200 и 401
        validateStatus: (status) => status === 200 || status === 401,
      }
    );

    return {
      status: response.status,
      data: response.data,
    } as RefreshResponse;

  } catch (error) {
    console.error('Критическая ошибка при обновлении токена:', error);
    return {
      status: 500,
      data: { message: 'Произошла непредвиденная ошибка сети или инфраструктуры' },
    };
  }
}
