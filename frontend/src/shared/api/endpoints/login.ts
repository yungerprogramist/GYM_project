import { client } from '../client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export function login(credentials: LoginCredentials) {
  return client.post('/users/login/', credentials);
}
