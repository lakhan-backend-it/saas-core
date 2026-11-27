# Frontend — Multi-Tenant SaaS UI

Vite + React + TypeScript + React Router + Axios + Zod.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

`.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm test` | Vitest unit tests |

## App areas

- **Auth** — Login / Register
- **Super Admin** — Plans, Features, Subscriptions, Tenants
- **Tenant** — Dashboard, Projects, Tasks (gated), Users, Invites, Usage, Billing, Files (gated), Audit, Notifications

API client attaches Bearer token + `X-Tenant-ID` from auth context. Feature flags from `/auth/me` drive menu + route access.

## Seed logins

Use backend seed users (`superadmin@saas.local`, Free/Pro tenant admins) — see root `README.md`.
