# Multi-Tenant SaaS Core

Softlligence Technologies — Back-End Developer Practical Task.

Production-style **multi-tenant SaaS core**: tenant isolation, plans & feature gating, JWT RBAC, usage limits, invites/audit/notifications, and a React admin/tenant UI.

## Live (deployed)

| Layer | URL |
|--------|-----|
| Frontend | https://saas-core-web-nine.vercel.app |
| API | https://saas-core-api.onrender.com/api/v1 |
| Swagger | https://saas-core-api.onrender.com/api/docs |
| GitHub | https://github.com/lakhan-backend-it/saas-core |

> Free Render instances may cold-start (~30–60s) on first request.

## Stack

| Layer | Tech |
|--------|------|
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon), Zod, JWT, pino |
| Frontend | React, Vite, TypeScript, React Router, Axios, Zod |
| Docs | Swagger UI + `docs/` |

## Repo layout

```text
backend/    Express API
frontend/   React app
docs/       Architecture, security, API, modules, setup
```

## Documentation map

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Isolation, roles, entitlements, request pipeline |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth/RBAC/threats + honest production gaps |
| [docs/API.md](docs/API.md) | Endpoint map + envelopes |
| [docs/MODULES.md](docs/MODULES.md) | Full module catalogue + phases |
| [docs/AUTH.md](docs/AUTH.md) | Auth endpoints & security choices |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Folder layout |
| [docs/SETUP.md](docs/SETUP.md) | Local + Render/Vercel deploy |
| [docs/FRONTEND.md](docs/FRONTEND.md) | UI routes & screens |

## Quick start (local)

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL (Neon pooled + sslmode=require)
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api/docs`

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api/v1
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

## Schema & isolation (short)

Entities: `Tenant`, `User`, `TenantMembership`, `Plan`, `Feature`, `PlanFeature`, `Subscription`, `Project`, `Task`, invitations, audit logs, notifications, files, invoices, usage records, refresh tokens.

**Isolation:** shared DB/schema + `tenantId` on tenant rows + JWT tenant context + middleware spoof block.  
**Entitlements:** subscription → plan → features/limits. New signups get **Free** automatically.

## Testing

```bash
cd backend && npm test
cd frontend && npm test
```

Backend suite covers health, auth/refresh rotation, RBAC, cross-tenant isolation, Free vs Pro feature gates, invitations, usage/billing.

## What this demonstrates

1. Multi-tenant data isolation (query + header spoof tests)
2. Super Admin plans/features + subscription assign
3. Feature gating (tasks/files) and project quotas
4. JWT RBAC (platform Super Admin / `TENANT_ADMIN` / `TENANT_USER`)
5. Usage metering + simulated billing checkout
6. Invitations, audit logs, notifications

## Product boundaries (intentional for task scope)

- Billing checkout is **simulated** (no live Stripe webhook)
- File storage is **local disk** for the demo
- Invite emails are logged as accept URLs (SMTP adapter optional)

See [docs/SECURITY.md](docs/SECURITY.md) for production hardening checklist.
