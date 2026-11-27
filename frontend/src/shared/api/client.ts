import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../helpers/storage';
import type { ApiErrorBody, ApiSuccess, AuthSession } from '../types/auth';

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<ApiSuccess<AuthSession>>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    tokenStorage.set(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const next = await refreshPromise;
      if (next) {
        original.headers.Authorization = `Bearer ${next}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
