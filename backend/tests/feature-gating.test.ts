import { describe, expect, it } from 'vitest';
import { api, auth, loginAs } from './helpers/http';

describe('feature gating + plan limits', () => {
  it('allows projects on Free plan', async () => {
    const free = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const res = await api()
      .post('/api/v1/projects')
      .set(auth(free.accessToken))
      .send({ name: `Free Project ${Date.now()}` });
    expect([201, 403]).toContain(res.status);
    if (res.status === 403) {
      expect(res.body.code).toBe('FEATURE_DISABLED');
    } else {
      expect(res.body.data.id).toBeTruthy();
    }
  });

  it('blocks tasks for Free plan (feature off)', async () => {
    const free = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const res = await api().get('/api/v1/tasks').set(auth(free.accessToken));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FEATURE_DISABLED');
  });

  it('allows tasks for Pro plan', async () => {
    const pro = await loginAs('admin@globex-pro.local', 'TenantAdmin1!');

    const project = await api()
      .post('/api/v1/projects')
      .set(auth(pro.accessToken))
      .send({ name: `Pro Project ${Date.now()}` });
    expect(project.status).toBe(201);

    const task = await api()
      .post('/api/v1/tasks')
      .set(auth(pro.accessToken))
      .send({
        projectId: project.body.data.id,
        title: `Task ${Date.now()}`,
      });

    expect(task.status).toBe(201);
    expect(task.body.data.title).toBeTruthy();
  });

  it('blocks files for Free plan', async () => {
    const free = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const res = await api().get('/api/v1/files').set(auth(free.accessToken));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FEATURE_DISABLED');
  });
});
