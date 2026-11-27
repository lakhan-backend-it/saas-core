# Setup & Deploy

## Local

See root `README.md`.

## Production (plan)

| Layer | Host |
|--------|------|
| Database | Neon (Postgres) |
| Backend | Render (`render.yaml`) |
| Frontend | Vercel (`frontend/vercel.json`) |

### Backend (Render)

1. Connect the GitHub repo to Render (Blueprint or Web Service).
2. Root directory: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start` (runs `prisma migrate deploy` then Node)
5. Set env: `DATABASE_URL` (Neon pooled + `sslmode=require`), `CORS_ORIGINS` (Vercel URL), `APP_URL`, `API_URL`, JWT secrets.

Health: `GET /api/v1/health/live`

### Frontend (Vercel)

1. Root directory: `frontend`
2. Framework: Vite
3. Env: `VITE_API_URL=https://<render-service>.onrender.com/api/v1`

### After both are live

1. Update Render `CORS_ORIGINS` to the exact Vercel origin (no trailing slash).
2. Update `APP_URL` / `API_URL`.
3. Redeploy or restart API.
4. Seed once if needed: Render shell → `npm run prisma:seed`
