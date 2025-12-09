// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
  LINKS: {
    LIST: `${API_BASE_URL}/api/links`,
    CREATE: `${API_BASE_URL}/api/links`,
    GET: (id: string) => `${API_BASE_URL}/api/links/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/links/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/links/${id}`,
  },
};

export const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:8787';
