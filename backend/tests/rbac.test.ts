import { describe, expect, it } from 'vitest';
import { api, auth, loginAs } from './helpers/http';

describe('RBAC', () => {
  it('allows Super Admin to list plans', async () => {
    const admin = await loginAs('superadmin@saas.local', 'SuperAdmin1!');
    const res = await api().get('/api/v1/plans').set(auth(admin.accessToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('forbids tenant admin from Super Admin plan routes', async () => {
    const tenant = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const res = await api().get('/api/v1/plans').set(auth(tenant.accessToken));
    expect(res.status).toBe(403);
  });

  it('allows tenant admin to list users in own tenant', async () => {
    const tenant = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const res = await api().get('/api/v1/users').set(auth(tenant.accessToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
