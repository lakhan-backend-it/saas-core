# Frontend — Multi-Tenant SaaS UI

Vite + React + TypeScript + React Router + Axios + Zod.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

```env
VITE_API_URL=http://localhost:4000/api/v1
```

Production: `VITE_API_URL=https://saas-core-api.onrender.com/api/v1`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm test` | Vitest (auth schemas) |
| `npm run lint` | Typecheck |

## App areas

- **Auth** — Login / Register / Accept invite
- **Super Admin** — Plans, Features, Subscriptions, Tenants, Audit, Billing overview
- **Tenant** — Dashboard, Projects, Tasks, Users, Invites, Usage, Billing, Files, Audit, Notifications

API client attaches Bearer token + `X-Tenant-ID`. Feature-disabled routes show API 403 copy (Tasks/Files).

## Seed logins

See root `README.md` (`superadmin@saas.local`, Free/Pro tenant admins).

## Live

https://saas-core-web-nine.vercel.app
