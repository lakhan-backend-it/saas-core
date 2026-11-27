# Auth Module

First production module — access + refresh JWT, multi-workspace aware.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Create user + tenant + TENANT_ADMIN membership |
| POST | `/api/v1/auth/login` | — | Login; optional `tenantId` |
| POST | `/api/v1/auth/refresh` | — | Rotate refresh token; new access pair |
| POST | `/api/v1/auth/logout` | — | Revoke refresh token |
| GET | `/api/v1/auth/me` | Bearer | Current user + memberships |
| POST | `/api/v1/auth/switch-tenant` | Bearer | Switch workspace; new token pair |

## Security choices

- Passwords: bcrypt (`BCRYPT_ROUNDS`)
- Access JWT: short-lived, carries `tenantId` + `membershipRole` + `isSuperAdmin`
- Refresh: opaque random token; **only SHA-256 hash** stored
- Refresh **rotation** on every use (old hash revoked)
- Auth routes: stricter rate limit
- Login errors: generic “Invalid email or password” (no enumeration)

## Register body

```json
{
  "email": "owner@example.com",
  "password": "Password1",
  "fullName": "Owner Name",
  "tenantName": "Acme Inc"
}
```

## Login body

```json
{
  "email": "owner@example.com",
  "password": "Password1",
  "tenantId": "optional-cuid"
}
```

## Seed credentials (after migrate + seed)

| Account | Email | Password |
|---------|--------|----------|
| Super Admin | `superadmin@saas.local` | `SuperAdmin1!` |
| Free tenant admin | `admin@acme-free.local` | `TenantAdmin1!` |
| Pro tenant admin | `admin@globex-pro.local` | `TenantAdmin1!` |
