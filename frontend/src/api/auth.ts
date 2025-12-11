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

interface UpdateProfileResponse {
  message: string;
  user: User;
}

interface ChangePasswordResponse {
  message: string;
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

  updateProfile: async (data: { name?: string; email?: string }) => {
    return api.put<UpdateProfileResponse>(API_ENDPOINTS.AUTH.PROFILE, data);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return api.post<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },
};

// Backward compatibility exports
export const updateProfile = authApi.updateProfile;
export const changePassword = authApi.changePassword;
