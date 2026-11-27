import { describe, expect, it } from 'vitest';
import { api, auth, loginAs } from './helpers/http';

function tokenFromAcceptUrl(acceptUrl: string) {
  const url = new URL(acceptUrl);
  const token = url.searchParams.get('token');
  if (!token) throw new Error(`No token in acceptUrl: ${acceptUrl}`);
  return token;
}

describe('invitations', () => {
  it('owner can create and list invitations', async () => {
    const session = await loginAs('admin@acme-free.local', 'TenantAdmin1!');
    const email = `invitee_${Date.now()}@example.com`;

    const created = await api()
      .post('/api/v1/invitations')
      .set(auth(session.accessToken))
      .send({ email, role: 'TENANT_USER' });

    expect(created.status).toBe(201);
    expect(created.body.data.invitation.email).toBe(email);
    expect(created.body.data.acceptUrl).toContain('token=');

    const list = await api().get('/api/v1/invitations').set(auth(session.accessToken));
    expect(list.status).toBe(200);
    expect(
      (list.body.data as Array<{ email: string }>).some((i) => i.email === email)
    ).toBe(true);
  });

  it('accepts invitation and joins tenant', async () => {
    const owner = await loginAs('admin@globex-pro.local', 'TenantAdmin1!');
    const email = `join_${Date.now()}@example.com`;

    const invite = await api()
      .post('/api/v1/invitations')
      .set(auth(owner.accessToken))
      .send({ email, role: 'TENANT_USER' });
    expect(invite.status).toBe(201);

    const token = tokenFromAcceptUrl(invite.body.data.acceptUrl as string);

    const accepted = await api().post('/api/v1/invitations/accept').send({
      token,
      fullName: 'Joined User',
      password: 'Password1',
    });
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.email).toBe(email);
    expect(accepted.body.data.tenantId).toBeTruthy();
  });
});
