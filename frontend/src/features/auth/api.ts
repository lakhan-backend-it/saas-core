import { api } from '@/shared/api/client';
import type { ApiSuccess, AuthSession, MeResponse } from '@/shared/types/auth';

export async function loginRequest(payload: {
  email: string;
  password: string;
  tenantId?: string;
}) {
  const { data } = await api.post<ApiSuccess<AuthSession>>('/auth/login', payload);
  return data.data;
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  fullName: string;
  tenantName: string;
}) {
  const { data } = await api.post<ApiSuccess<AuthSession>>('/auth/register', payload);
  return data.data;
}

export async function meRequest() {
  const { data } = await api.get<ApiSuccess<MeResponse>>('/auth/me');
  return data.data;
}

export async function logoutRequest(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken });
}

export async function switchTenantRequest(tenantId: string) {
  const { data } = await api.post<ApiSuccess<AuthSession>>('/auth/switch-tenant', {
    tenantId,
  });
  return data.data;
}
