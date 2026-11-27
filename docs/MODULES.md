# Domain Modules (Full SaaS Scope)

Locked module list after expanding core + commercial SaaS gaps.
Build in phases so the Softlligence task is never blocked by extras.

---

## Phase map

| Phase | Goal | Modules |
|-------|------|---------|
| **P0 — Task must-pass** | Isolation, plans, RBAC, demo CRUD, deploy | `health`, `auth`, `tenants`, `users`, `plans`, `features`, `subscriptions`, `projects`, `tasks` |
| **P1 — Impressive core** | Limits, settings, soft delete, refresh/logout | plan limits in services, tenant settings, soft delete fields, auth refresh |
| **P2 — Enterprise feel** | Audit, invites, usage | `audit-logs`, `invitations`, `usage` |
| **P3 — Full SaaS** | Billing, files, notifications, multi-workspace, domains | `billing`, `files`, `notifications`, memberships, tenant domain resolution |

---

## Complete module list

### Platform & access

| Module | Responsibility |
|--------|----------------|
| `health` | Liveness / readiness probes |
| `auth` | Register, login, **access + refresh JWT**, logout/revoke, `/me`, password hash |
| `tenants` | Create/list tenants (Super Admin), **tenant settings** (name/slug), activate/deactivate, soft delete |
| `users` | Users inside a tenant; roles; soft deactivate |
| `memberships` | **Multi-workspace**: one user → many tenants; switch active tenant |

### Entitlements & commercial

| Module | Responsibility |
|--------|----------------|
| `plans` | Plan CRUD (Super Admin) |
| `features` | Feature catalog keys |
| `subscriptions` | Tenant ↔ plan assign/change |
| `usage` | **Metering / quotas**: counters per tenant+feature; enforce with plan `limit` |
| `billing` | **Stripe-ready**: checkout session, webhook, invoices list (test mode OK) |

### Collaboration & ops

| Module | Responsibility |
|--------|----------------|
| `invitations` | Email invite + token accept (magic-link style accept URL) |
| `audit-logs` | Who did what (plan change, user add, billing, etc.) |
| `notifications` | In-app notification list / mark read |
| `files` | Upload metadata + storage key (S3/R2 or local disk in dev) |

### Demo product (feature-gated)

| Module | Responsibility |
|--------|----------------|
| `projects` | Tenant CRUD; **plan limit** (e.g. Free = 5); soft delete |
| `tasks` | Feature-gated CRUD; soft delete |

### Cross-cutting (not always a route module)

| Concern | Where |
|---------|--------|
| Soft delete / `isActive` | Schema + services consistently filter |
| Plan limit enforce | `common/helpers` + `usage` + create hooks in projects/tasks |
| Subdomain / custom domain | `resolve-tenant` middleware (slug / `Host` / `X-Tenant-ID`) |
| Email send | `infrastructure/email` (invites, magic link) |
| Object storage | `infrastructure/storage` |

---

## Roles

| Role | Scope |
|------|--------|
| `SUPER_ADMIN` | Platform: tenants, plans, features, subscriptions, billing overview |
| `TENANT_ADMIN` | Tenant settings, users, invites, projects/tasks, billing portal (tenant) |
| `TENANT_USER` | Limited tenant ops on allowed features |

With **memberships**, role is per tenant (except platform Super Admin).

---

## Data concepts added

- `TenantMembership` — multi-workspace
- `RefreshToken` — logout / revoke
- `Invitation` — email invite flow
- `AuditLog` — enterprise trail
- `Notification` — in-app alerts
- `FileObject` — uploads
- `Invoice` — billing records
- `UsageRecord` — quota metering
- `Tenant.customDomain` / slug — domain routing
- `deletedAt` — soft delete on tenant resources

---

## API surface (high level)

```text
/api/v1/health
/api/v1/auth                login, refresh, logout, me
/api/v1/tenants             + settings
/api/v1/memberships         list/switch workspaces
/api/v1/users
/api/v1/invitations
/api/v1/plans
/api/v1/features
/api/v1/subscriptions
/api/v1/usage
/api/v1/billing             checkout (simulated), invoices
/api/v1/audit-logs
/api/v1/notifications
/api/v1/files
/api/v1/projects
/api/v1/tasks
```

---

## Frontend pages (expanded)

- Auth: login, accept invite, refresh-aware session
- Super Admin: plans, features, tenants, subscriptions, billing overview, audit
- Tenant: switch workspace, settings, users/invites, projects/tasks, usage meters, invoices, notifications, files

---

## Build rule

Ship **P0 live + credentials + Swagger** first.  
Then P1 → P2 → P3. Never leave P0 half-broken for P3.
