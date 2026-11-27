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

Live: https://saas-core-web-nine.vercel.app

## Built screens

### Auth
- `/login`, `/register`, `/accept-invite`

### Super Admin (`/admin`)
- Overview, Plans (+ feature toggles), Features, Tenants, Subscriptions, Audit, Billing invoices

### Tenant (`/app`)
- Home, Projects, Tasks (API feature-gated), Users, Invitations, Usage, Files (API feature-gated), Notifications, Billing checkout (simulated)

## Client behaviour

- Axios interceptor attaches Bearer access token
- Single-flight refresh on 401; logout if refresh fails
- `X-Tenant-ID` sent from active workspace in auth context
- Tasks/Files surfaces show plan restriction messages when API returns `FEATURE_DISABLED`
