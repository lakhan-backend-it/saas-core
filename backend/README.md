# Backend — Multi-Tenant SaaS Core API

Express + TypeScript + Prisma + Zod + JWT.

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Required env (see `.env.example`):

- `DATABASE_URL` — Postgres (Neon pooled URL + `sslmode=require`)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (min 32 chars)
- `PORT` (default `4000`)
- `CORS_ORIGINS` — comma-separated frontend origins

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch mode |
| `npm run build` / `npm start` | Production (`start` runs migrate deploy) |
| `npm test` | Vitest integration suite |
| `npm run prisma:seed` | Seed plans + demo tenants |
| `npx prisma studio` | DB browser |

## Auth

- Register → user + tenant + `TENANT_ADMIN` + **Free** subscription
- Login / refresh / logout with hashed refresh tokens (rotation)
- `X-Tenant-ID` must match JWT `tenantId` (anti-spoof)
- Roles: platform Super Admin (`isSuperAdmin`); membership `TENANT_ADMIN` / `TENANT_USER`

## Feature gating

`requireFeature('tasks' | 'projects' | 'file_uploads' | …)` after `resolveTenant`.  
Limits via `assertWithinLimit` + usage records on create.

## API surface

Base: `/api/v1` — see [docs/API.md](../docs/API.md)  
Swagger: `/api/docs`

## Testing

```bash
npm test
```

`NODE_ENV=test` skips rate limits. Prefer a non-prod Neon branch for CI.

Covers: health, auth/refresh, RBAC, tenant isolation, Free vs Pro gates, invitations, usage/billing.
