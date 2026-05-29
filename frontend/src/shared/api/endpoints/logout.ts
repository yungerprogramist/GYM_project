// src/shared/api/endpoints/logout.ts
import { authClient } from '../authClient'; // Импортируем авторизованный клиент

export interface LogoutRequest {
  refresh: string;
}

export type LogoutResponse =

  | { status: 205; data: { message: string } }
  | { status: 400; data: { error: string } }
  | { status: 500; data: { message: string } };

export async function logoutUser(body: LogoutRequest): Promise<LogoutResponse> {
  try {
    const response = await authClient.post<any>('users/logout/', body, {
      // Axios пропустит 205 и 400. 
      // Если прилетит 401 — сработает интерцептор в authClient, обновит токен и повторит этот запрос!
      validateStatus: (status) => status === 205 || status === 400,
    });

    return { status: response.status, data: response.data } as LogoutResponse;
  } catch (error) {
    console.error('Критическая ошибка при выходе:', error);
    return { status: 500, data: { message: 'Ошибка сети' } };
  }
}
