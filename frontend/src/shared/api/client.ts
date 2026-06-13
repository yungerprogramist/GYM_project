import axios from 'axios';

export const client = axios.create({
  baseURL: '/api/v1/',
  headers: { 'Content-Type': 'application/json' },
});

export type { AxiosInstance, AxiosError } from 'axios';
