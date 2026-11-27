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

- `DATABASE_URL` — Postgres (Neon pooled URL recommended)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `PORT` (default `4000`)
- `CORS_ORIGIN` (frontend origin)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch mode |
| `npm run build` / `npm start` | Production |
| `npm test` | Vitest integration suite |
| `npm run prisma:seed` | Seed plans + demo tenants |
| `npx prisma studio` | DB browser |

## Auth

- Register creates user + tenant + OWNER membership + Free subscription
- Login / refresh / logout with hashed refresh tokens
- `X-Tenant-ID` must match JWT `tenantId` (anti-spoof)
- Roles: platform Super Admin (`isSuperAdmin`); membership `TENANT_ADMIN` / `TENANT_USER`

## Feature gating

Middleware `requireFeature('tasks' | 'projects' | 'file_uploads' | …)` checks the tenant’s active subscription plan. Limits enforced via usage helpers before create.

## API surface

Base path: `/api/v1`

Modules: `auth`, `plans`, `features`, `subscriptions`, `tenants`, `users`, `projects`, `tasks`, `usage`, `invitations`, `audit-logs`, `notifications`, `files`, `billing`.

Interactive docs: `/api/docs`

## Testing

```bash
npm test
```

Uses `NODE_ENV=test` (rate limits skipped). Hits the configured `DATABASE_URL` — prefer a non-prod Neon branch for CI.

Tests cover:

- Health live/ready
- Auth register/login/me/refresh
- RBAC (member cannot manage users)
- Tenant isolation (cross-tenant project access denied)
- Feature gating (Free blocked from tasks; Pro allowed)
