import request from 'supertest';
import { createApp } from '../../src/app';

export const app = createApp();

export function api() {
  return request(app);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Neon pooled connections can briefly refuse after scale-to-zero; retry login. */
export async function loginAs(email: string, password: string, attempts = 4) {
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    const res = await api().post('/api/v1/auth/login').send({ email, password });
    if (res.status === 200) {
      return res.body.data as {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; isSuperAdmin: boolean };
        activeTenantId: string | null;
      };
    }

    lastError = new Error(
      `Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`
    );

    const transient =
      res.status >= 500 ||
      String(res.body?.message ?? '').toLowerCase().includes('database');
    if (!transient || i === attempts - 1) break;
    await sleep(1500 * (i + 1));
  }

  throw lastError ?? new Error(`Login failed for ${email}`);
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}
