import { client } from '../client';

export interface RefreshCredentials {
  refreshToken: string;
}

export function refresh(credentials: RefreshCredentials) {
  return client.post('/users/refresh/', credentials);
}
