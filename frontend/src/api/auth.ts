import { api } from './client';
import { API_ENDPOINTS } from '../config';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

interface MeResponse {
  user: User;
}

export const authApi = {
  signup: async (email: string, password: string, name?: string) => {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
      email,
      password,
      name,
    });
  },

  login: async (email: string, password: string) => {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
  },

  me: async () => {
    return api.get<MeResponse>(API_ENDPOINTS.AUTH.ME);
  },
};
