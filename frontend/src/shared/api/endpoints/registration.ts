import { client } from '../client';

export interface RegisterCredentials {
  username: string;
  password: string;
}

export function registration(credentials: RegisterCredentials) {
  return client.post('/users/registration/', credentials);
}
