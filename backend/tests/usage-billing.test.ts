import { describe, expect, it } from 'vitest';
import { api, auth, loginAs } from './helpers/http';

describe('usage + billing', () => {
  it('returns usage summary for tenant admin', async () => {
    const session = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const res = await api().get('/api/v1/usage').set(auth(session.accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
  });

  it('lists invoices for tenant', async () => {
    const session = await loginAs('admin@globex-pro.local', 'TenantAdmin1!');
    const res = await api()
      .get('/api/v1/billing/invoices')
      .set(auth(session.accessToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('simulates checkout to change plan', async () => {
    const stamp = Date.now();
    const reg = await api()
      .post('/api/v1/auth/register')
      .send({
        email: `bill_${stamp}@example.com`,
        password: 'Password1',
        fullName: 'Bill User',
        tenantName: `Bill WS ${stamp}`,
      });
    expect(reg.status).toBe(201);
    const token = reg.body.data.accessToken as string;

    const catalog = await api().get('/api/v1/plans/catalog').set(auth(token));
    expect(catalog.status).toBe(200);
    const pro = (catalog.body.data as Array<{ id: string; code: string }>).find(
      (p) => p.code === 'pro'
    );
    expect(pro).toBeTruthy();

    const checkout = await api()
      .post('/api/v1/billing/checkout')
      .set(auth(token))
      .send({ planId: pro!.id });
    expect([200, 201]).toContain(checkout.status);
  });
});
