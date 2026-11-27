# Project Structure

Multi-Tenant SaaS Core — Softlligence Technologies practical task  
**(Full SaaS scope — core + commercial gaps included).**

Naming: feature modules, shared middleware/helpers/schemas — no separate `guards/` or `dto/` folders.

For the full module catalogue and build phases, see [MODULES.md](./MODULES.md).

---

## Tech stack (locked)

| Layer | Choice |
|--------|--------|
| Runtime | Node.js LTS |
| Language | TypeScript |
| API | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT access + refresh, bcrypt |
| Logging | pino |
| Security | helmet, cors, rate-limit |
| Billing | Stripe (test mode) |
| Email | SMTP / provider adapter (invites) |
| Files | S3-compatible or local disk (dev) |
| API docs | Swagger / OpenAPI |
| Frontend | React + Vite + TypeScript |
| Hosting | Backend: Railway / Render · Frontend: Vercel · DB: Neon / Railway |

---

## Repository layout

```text
project/
├── docs/                 # STRUCTURE.md, MODULES.md, …
├── backend/              # Express + Prisma API
└── frontend/             # React + Vite UI
```

---

## Backend structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── routes.ts
│   ├── config/
│   │   └── env.ts
│   ├── lib/
│   │   ├── logger/
│   │   ├── prisma/
│   │   └── cache/
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── validate.ts
│   │   │   ├── authenticate.ts
│   │   │   ├── require-roles.ts
│   │   │   ├── resolve-tenant.ts      # header / slug / custom domain
│   │   │   ├── require-feature.ts
│   │   │   ├── require-limit.ts      # plan quota check
│   │   │   ├── request-id.ts
│   │   │   ├── request-logger.ts
│   │   │   ├── audit.ts              # optional write helper hook
│   │   │   ├── error-handler.ts
│   │   │   ├── not-found.ts
│   │   │   └── async-handler.ts
│   │   ├── schemas/
│   │   ├── helpers/
│   │   ├── errors/
│   │   ├── http/
│   │   ├── constants/
│   │   └── types/
│   ├── infrastructure/
│   │   ├── security/                 # rate-limit
│   │   ├── email/                    # invite / magic-link mailer
│   │   ├── storage/                  # file uploads
│   │   └── billing/                  # Stripe client
│   ├── docs/
│   ├── jobs/
│   └── modules/
│       ├── health/
│       ├── auth/                     # login, refresh, logout, me
│       ├── tenants/                  # + settings, domain, soft delete
│       ├── memberships/              # multi-workspace switch
│       ├── users/
│       ├── invitations/
│       ├── plans/
│       ├── features/
│       ├── subscriptions/
│       ├── usage/                    # metering / quotas
│       ├── billing/                  # checkout, webhooks, invoices
│       ├── audit-logs/
│       ├── notifications/
│       ├── files/
│       ├── projects/                 # + plan limits, soft delete
│       └── tasks/                    # feature-gated + soft delete
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

Each module: `schemas/` · `routes/` · `controllers/` · `services/` · optional `helpers/`.

---

## Frontend structure

```text
frontend/
├── public/
└── src/
    ├── app/
    ├── pages/
    │   ├── auth/                     # login, accept invite
    │   ├── super-admin/              # plans, tenants, billing, audit
    │   └── tenant/                   # workspace UI
    ├── features/
    │   ├── auth/
    │   ├── plans/
    │   ├── tenants/
    │   ├── memberships/
    │   ├── invitations/
    │   ├── billing/
    │   ├── usage/
    │   ├── notifications/
    │   ├── files/
    │   ├── audit-logs/
    │   └── projects/
    ├── shared/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── helpers/
    │   ├── schemas/
    │   └── types/
    └── styles/
```

---

## Naming conventions

| Kind | Rule | Example |
|------|------|---------|
| Files | kebab-case + role suffix | `error-handler.ts`, `auth.routes.ts` |
| Folders | kebab-case / plural modules | `modules/audit-logs` |
| Classes | PascalCase | `AppError` |
| Functions | camelCase | `requireFeature`, `tenantWhere` |
| Constants / env | SCREAMING_SNAKE | `FEATURES.TASKS`, `STRIPE_SECRET_KEY` |
| Validation | `schemas/` (not `dto/`) | `create-project.schema.ts` |
| Access control | `middleware/` (not `guards/`) | `authenticate.ts` |
| Pure logic | `helpers/` only | `jwt.helper.ts` |

### API paths

- Versioned: `/api/v1/...`
- Plural resources
- Docs: `/api/docs`
- Stripe webhook: `/api/v1/billing/webhooks/stripe` (raw body)

---

## Request pipeline

```text
helmet → cors → rateLimit → compression
→ body parser (except Stripe webhook raw)
→ requestId → requestLogger
→ validate → authenticate → requireRoles
→ resolveTenant → requireFeature → requireLimit
→ controller → service → Prisma (+ audit write)
→ notFound → errorHandler
```

---

## Cross-cutting

### Security
- Helmet, CORS, rate limits, bcrypt, access + refresh tokens
- Tenant from membership / JWT — no spoof via header alone
- Feature + **quota** gating
- Soft-deleted rows excluded from default queries

### Errors / logs
- `AppError` + central handler; `requestId` on every response
- pino with secret redaction

### Optimization
- Prisma singleton, compression, indexes on `tenantId`, pagination
- Usage counters for limit checks (avoid full table counts where possible)

---

## Roles

- `SUPER_ADMIN` — platform (flag on `User`)
- `TENANT_ADMIN` / `TENANT_USER` — per **membership** (multi-workspace)

---

## Out of scope (still)

- NestJS / microservices / Kafka
- Separate `guards/` + `dto/` folders
- Both `utils/` and `helpers/` — use **`helpers/` only**

---

## Related docs

- [MODULES.md](./MODULES.md) — full module list + phases P0→P3
- `SCHEMA.md` — ERD (add when migrating)
- `SETUP.md` — local + deploy
- `API.md` — or live Swagger
