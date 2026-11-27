import { describe, expect, it } from 'vitest';
import { api } from './helpers/http';

describe('health', () => {
  it('GET /api/v1/health/live returns ok', async () => {
    const res = await api().get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/v1/health/ready checks database', async () => {
    const res = await api().get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.db).toBe('up');
  });
});
