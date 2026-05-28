import { client } from '../client';

export interface LogoutCredentials {
  refreshToken: string;
  accessToken?: string;
}

export function logout(credentials: LogoutCredentials) {
  return client.post('/users/logout/', credentials);
}
