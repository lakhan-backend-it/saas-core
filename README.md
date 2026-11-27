# Multi-Tenant SaaS Core

Softlligence Technologies — Back-End Developer Practical Task.

Production-style **multi-tenant SaaS core**: tenant isolation, subscription plans, feature gating, JWT RBAC, usage limits, and a lightweight React admin/tenant UI.

## Stack

| Layer | Tech |
|--------|------|
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon), Zod, JWT, pino |
| Frontend | React, Vite, TypeScript, React Router, Axios, Zod |
| Docs | Swagger UI at `/api/docs` |

## Repo layout

```text
backend/    Express API
frontend/   React app
docs/       Structure, modules, auth notes
```

## Quick start

### 1) Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/docs.json`

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- App: `http://localhost:5173`

## Seed credentials

| Role | Email | Password | Plan |
|------|--------|----------|------|
| Super Admin | `superadmin@saas.local` | `SuperAdmin1!` | — |
| Tenant Admin (Free) | `admin@acme-free.local` | `TenantAdmin1!` | Free |
| Tenant Admin (Pro) | `admin@globex-pro.local` | `TenantAdmin1!` | Pro |

## Schema overview

Core entities: `Tenant`, `User`, `TenantMembership`, `Plan`, `Feature`, `PlanFeature`, `Subscription`, `Project`, `Task`, plus invitations, audit logs, notifications, files, invoices, usage records, refresh tokens.

Isolation model: **shared DB / shared schema** with `tenantId` on tenant-owned rows + middleware scoping. Feature access from subscription → plan → enabled features. Limits via `PlanFeature.limit` + `UsageRecord`.

See `docs/STRUCTURE.md` and `docs/MODULES.md`.

## Testing

```bash
cd backend
npm test
```

Coverage focus:
- Auth (login/register/refresh)
- RBAC
- Cross-tenant isolation
- Feature gating (Free vs Pro)

```bash
cd frontend
npm test
```

## What is demonstrated

1. Multi-tenant data isolation (query-level + spoof header block)
2. Super Admin plan/feature management + subscription assign
3. Feature gating on API and UI (tasks/files)
4. JWT auth + roles (platform Super Admin / `TENANT_ADMIN` / `TENANT_USER`)
5. Usage metering + simulated billing checkout
6. Invitations, audit logs, notifications

## Deploy (out of local checklist)

- Frontend: Vercel / Netlify  
- Backend: Render / Railway  
- DB: Neon (already usable via `DATABASE_URL`)
