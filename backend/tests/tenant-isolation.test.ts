import { describe, expect, it } from 'vitest';
import { api, auth, loginAs } from './helpers/http';

describe('tenant isolation', () => {
  it('prevents Free tenant from reading Pro tenant projects by id', async () => {
    const free = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const pro = await loginAs('admin@globex-pro.local', 'TenantAdmin1!');

    const created = await api()
      .post('/api/v1/projects')
      .set(auth(pro.accessToken))
      .send({ name: `Pro Secret ${Date.now()}`, description: 'isolation check' });

    expect(created.status).toBe(201);
    const projectId = created.body.data.id as string;

    const listFree = await api().get('/api/v1/projects').set(auth(free.accessToken));
    expect(listFree.status).toBe(200);
    const leaked = (listFree.body.data as Array<{ id: string }>).some((p) => p.id === projectId);
    expect(leaked).toBe(false);

    const updateForeign = await api()
      .patch(`/api/v1/projects/${projectId}`)
      .set(auth(free.accessToken))
      .send({ name: 'Hacked' });
    expect(updateForeign.status).toBe(404);
  });

  it('blocks tenant spoofing via X-Tenant-ID mismatch', async () => {
    const free = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const pro = await loginAs('admin@globex-pro.local', 'TenantAdmin1!');

    const res = await api()
      .get('/api/v1/projects')
      .set(auth(free.accessToken))
      .set('X-Tenant-ID', pro.activeTenantId ?? 'spoof');

    expect(res.status).toBe(403);
  });
});
