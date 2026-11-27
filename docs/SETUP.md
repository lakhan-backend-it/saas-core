# Setup & Deploy

## Local

See root `README.md`.

## Production (current)

| Layer | Host | URL |
|--------|------|-----|
| Database | Neon Postgres | (env `DATABASE_URL`) |
| Backend | Render | https://saas-core-api.onrender.com |
| Frontend | Vercel | https://saas-core-web-nine.vercel.app |
| Source | GitHub | https://github.com/lakhan-backend-it/saas-core |

Config files: `render.yaml`, `frontend/vercel.json`.

### Backend (Render)

1. Connect repo `lakhan-backend-it/saas-core`
2. Root directory: `backend`
3. Build: `npm install --include=dev && npm run build`
4. Start: `npm start` (`prisma migrate deploy` then Node)
5. Env: `DATABASE_URL` (Neon pooled + `sslmode=require`), `CORS_ORIGINS` (exact Vercel origin), `APP_URL`, `API_URL`, JWT secrets

Health: `GET /api/v1/health/live` · Ready: `GET /api/v1/health/ready`

### Frontend (Vercel)

1. Root directory: `frontend`
2. Framework: Vite → output `dist`
3. Env: `VITE_API_URL=https://saas-core-api.onrender.com/api/v1`
4. Disable SSO/deployment protection for public demo access

### After both are live

1. Set Render `CORS_ORIGINS` / `APP_URL` to the Vercel origin (no trailing slash)
2. Set `API_URL` to the Render public URL
3. Redeploy API if env changed
4. Seed once (local against Neon or Render shell): `npm run prisma:seed`
