import { describe, expect, it } from 'vitest';
import { api, auth, loginAs } from './helpers/http';

describe('auth', () => {
  it('logs in super admin and returns /me', async () => {
    const session = await loginAs('superadmin@saas.local', 'SuperAdmin1!');
    expect(session.accessToken).toBeTruthy();
    expect(session.user.isSuperAdmin).toBe(true);

    const me = await api().get('/api/v1/auth/me').set(auth(session.accessToken));
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('superadmin@saas.local');
  });

  it('rejects invalid credentials without leaking user existence', async () => {
    const res = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@saas.local', password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('registers a new workspace and issues tokens', async () => {
    const stamp = Date.now();
    const res = await api()
      .post('/api/v1/auth/register')
      .send({
        email: `owner_${stamp}@example.com`,
        password: 'Password1',
        fullName: 'Owner Test',
        tenantName: `Workspace ${stamp}`,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.tenant.slug).toBeTruthy();
    expect(res.body.data.memberships).toHaveLength(1);
  });

  it('refreshes and rotates refresh token', async () => {
    const session = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const refreshed = await api()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });

    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
    expect(refreshed.body.data.refreshToken).not.toBe(session.refreshToken);

    const reuse = await api()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });
    expect(reuse.status).toBe(401);
  });
});
