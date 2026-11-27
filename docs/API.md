# API overview

Base URL: `/api/v1`  
Interactive: `/api/docs` · OpenAPI JSON: `/api/docs.json`

Auth header: `Authorization: Bearer <accessToken>`  
Optional: `X-Tenant-ID` (must equal JWT tenant for non–Super Admin)

## Modules

| Prefix | Auth | Notes |
|--------|------|--------|
| `/health/live` | — | Liveness |
| `/health/ready` | — | DB readiness |
| `/auth/*` | mixed | register, login, refresh, logout, me, switch-tenant |
| `/plans` | Super Admin | CRUD; `/plans/catalog` any authenticated |
| `/features` | Super Admin | Feature catalog |
| `/subscriptions` | Super Admin | List / assign plan to tenant |
| `/tenants` | Super Admin | List / create / update |
| `/users` | Tenant Admin+ | Tenant members |
| `/invitations` | Tenant Admin+ | Create/list; `/accept` public |
| `/projects` | Member + feature `projects` | CRUD, soft delete, quota |
| `/tasks` | Member + feature `tasks` | CRUD, soft delete |
| `/usage` | Tenant | Features, limits, usage records |
| `/files` | Member + feature `file_uploads` | Base64 upload metadata |
| `/billing/invoices` | Tenant | List |
| `/billing/checkout` | Tenant Admin | Simulated plan change + PAID invoice |
| `/billing/admin/invoices` | Super Admin | Cross-tenant invoices |
| `/audit-logs` | Tenant Admin / Super Admin | Recent actions |
| `/notifications` | Authenticated | In-app list / mark read |

## Response envelope

Success:

```json
{ "success": true, "data": {}, "requestId": "…" }
```

Error:

```json
{ "success": false, "code": "FEATURE_DISABLED", "message": "…", "requestId": "…" }
```

Stable codes live in `backend/src/common/errors/error-codes.ts`.

## Demo credentials

See root `README.md` (seed users after `npm run prisma:seed`).
