# Security notes

## Implemented

- Passwords hashed with bcrypt (`BCRYPT_ROUNDS`)
- Short-lived access JWT + opaque refresh tokens (**SHA-256 hash only** in DB)
- Refresh **rotation** (reuse of old refresh → 401)
- Auth route rate limit (skipped only when `NODE_ENV=test`)
- Helmet, CORS allowlist, bounded JSON body
- Generic login errors (no email enumeration)
- Tenant spoof block: `X-Tenant-ID` must match JWT tenant
- RBAC via `requireRoles` on admin/tenant-admin routes
- Feature gating via `requireFeature`
- Soft delete filters on tenant resources
- Central error handler (no stack traces in production)
- Integration tests: isolation, RBAC, feature gates, refresh rotation

## Threat model (practical)

| Threat | Mitigation |
|--------|------------|
| Cross-tenant IDOR | JWT tenant + query `tenantId` filter; tests assert denial |
| Header spoof | Mismatch → 403 |
| Brute-force login | Auth rate limit |
| Stolen refresh | Rotation; hash-at-rest |
| Plan bypass | Middleware feature gate + usage assert on create |

## Known gaps (not production-hardened)

Documented for honesty — expected follow-ups for a real SaaS:

1. Revalidate membership/`isActive` on each request (or shorter access TTL + cache)
2. HttpOnly Secure cookies instead of `localStorage` for refresh
3. Private object storage / signed download URLs (remove public static uploads)
4. Real Stripe Checkout + signed webhooks before marking invoices paid
5. Redis-backed rate limits for multi-instance
6. Pagination on all list endpoints
7. MFA / password reset / email verification

## Secrets

Never commit `.env`. Production JWT secrets are generated on Render; Neon `DATABASE_URL` is injected as an env var.
