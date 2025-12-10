import { useAuthStore } from '../store/authStore';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with options.headers if provided
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.error || 'An error occurred'
    );
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => fetchApi<T>(url, { method: 'GET' }),
  post: <T>(url: string, data: any) =>
    fetchApi<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data: any) =>
    fetchApi<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) => fetchApi<T>(url, { method: 'DELETE' }),
};
