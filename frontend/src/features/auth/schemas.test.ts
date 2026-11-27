import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './schemas';

describe('auth schemas', () => {
  it('accepts valid login', () => {
    const parsed = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'x',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid login email', () => {
    const parsed = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'x',
    });
    expect(parsed.success).toBe(false);
  });

  it('requires letter + number in register password', () => {
    const weak = registerSchema.safeParse({
      fullName: 'Ada Lovelace',
      tenantName: 'Analytical',
      email: 'ada@example.com',
      password: 'password',
    });
    expect(weak.success).toBe(false);

    const ok = registerSchema.safeParse({
      fullName: 'Ada Lovelace',
      tenantName: 'Analytical',
      email: 'ada@example.com',
      password: 'Password1',
    });
    expect(ok.success).toBe(true);
  });
});
