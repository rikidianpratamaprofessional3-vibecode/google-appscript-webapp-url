// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gas-link-worker.rikidianpratama-professional3.workers.dev';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    ME: `${API_BASE_URL}/api/auth/me`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  },
  LINKS: {
    LIST: `${API_BASE_URL}/api/links`,
    CREATE: `${API_BASE_URL}/api/links`,
    GET: (id: string) => `${API_BASE_URL}/api/links/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/links/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/links/${id}`,
  },
};

export const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'https://gas-link-worker.rikidianpratama-professional3.workers.dev';
