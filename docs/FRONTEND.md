# Frontend

React + Vite + TypeScript UI for the multi-tenant SaaS core.

## Run

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173  
API: `VITE_API_URL` (default `http://localhost:4000/api/v1`)

## Built screens

### Auth
- `/login`, `/register`, `/accept-invite`

### Super Admin (`/admin`)
- Overview, Plans (+ feature toggles), Features, Tenants, Subscriptions, Audit, Billing invoices

### Tenant (`/app`)
- Home, Projects, Tasks (feature-gated), Users, Invitations, Usage, Files (feature-gated), Notifications, Billing checkout (simulated)

## Notes
- Axios client auto-refreshes access tokens
- 403 from feature gates surfaces as error copy on Tasks/Files
