# Architecture

Multi-tenant SaaS core for Softlligence practical task.

## Isolation model

**Shared database, shared schema**, with `tenantId` on every tenant-owned table.

| Layer | How isolation is enforced |
|--------|---------------------------|
| Auth | Access JWT carries `tenantId` + `membershipRole` |
| Middleware | `resolveTenant` loads tenant + plan features; rejects `X-Tenant-ID` spoof |
| Queries | Services always filter by `req.tenant.id` |
| Features | `requireFeature(key)` checks subscription → plan → enabled features |
| Quotas | `PlanFeature.limit` + `UsageRecord` (monthly) |

Future scale path (documented only): schema-per-tenant or Postgres RLS.

## Request pipeline

```text
helmet / cors / rate-limit
  → JSON body (bounded)
  → requestId + access log
  → route: validate (Zod) → authenticate → resolveTenant → requireRoles / requireFeature
  → controller / service
  → success envelope or central error handler
```

## Roles

| Role | Scope |
|------|--------|
| Platform Super Admin (`user.isSuperAdmin`) | Plans, features, tenants, subscription assign, global billing view |
| `TENANT_ADMIN` | Users, invites, billing checkout, tenant resources |
| `TENANT_USER` | Feature-gated product resources (projects/tasks when enabled) |

Membership is **per tenant** (`TenantMembership`). One user can belong to many workspaces; `POST /auth/switch-tenant` rotates tokens.

## Entitlements

```text
Tenant → Subscription (ACTIVE) → Plan → PlanFeature[] → Feature.key + limit
```

Seed plans:

| Plan | Projects | Tasks | Files | Reports |
|------|----------|-------|-------|---------|
| Free | yes (limit 5) | no | no | no |
| Pro | yes (unlimited) | yes | yes (limit 100) | yes |

New registrations attach **Free** automatically.

## Demo product surface

Projects + tasks prove feature gating and quotas. Files / billing / invites / audit / notifications round out a commercial SaaS shape.

## Honest product boundaries

| Area | Current state |
|------|----------------|
| Billing | Simulated checkout (no Stripe webhook) |
| Files | Local disk + public `/uploads` in demo |
| Email | Invite accept URL logged; no SMTP provider wired |
| Sessions | Bearer tokens (FE uses `localStorage`) |

These are intentional for a time-boxed practical task; production upgrades are listed in `SECURITY.md`.
