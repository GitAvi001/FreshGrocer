# FreshGrocer — Vercel Deployment Guide (Development / Preview / Production)

This repo contains:

- **Frontend**: Next.js app in `apps/web` (runs on Vercel very well)
- **Backend**: NestJS API Gateway + TCP microservices in `apps/gateway`, `apps/auth-service`, `apps/inventory-service`, `apps/order-service`

## Important: backend architecture vs Vercel

Backend services communicate via **TCP on localhost**:

- Gateway → Auth service: `127.0.0.1:3001`
- Gateway → Inventory service: `127.0.0.1:3002`
- Gateway → Order service: `127.0.0.1:3003`

This requires the gateway + microservices to run **together on the same machine/container/network namespace**.

Vercel’s standard hosting model is **serverless** and does **not** run a long-lived multi-process container for you. So the practical production setup is:

- **Deploy `apps/web` on Vercel**
- **Deploy the backend elsewhere** (a container/VM platform), then point the frontend at it with `NEXT_PUBLIC_API_URL`

If you later refactor gateway ↔ services to use HTTP or externally reachable hosts instead of `127.0.0.1`, you can deploy services independently.

---

## Create the Vercel Project (Frontend: `apps/web`)

In the Vercel Dashboard:

- **New Project** → Import your Git repo
- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js (auto-detect)
- **Install Command**: `npm ci`
- **Build Command**: `npm run build`
- **Output Directory**: (leave default / auto)

### Local env file for frontend

For localhost development, this repo now includes:

- `apps/web/.env.local`

It should contain:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Environment Variables (what each app expects)

### Frontend (`apps/web`)

The frontend reads:

- `NEXT_PUBLIC_API_URL` (client-side) from `apps/web/src/lib/api.ts`

This must be the **base URL of the gateway** (no trailing slash preferred), for example:

- `http://localhost:3000`
- `https://api.yourdomain.com`

### Backend (Gateway + services)

The backend uses these environment variables (from your `.env` and Nest modules):

- **Database**
  - `POSTGRES_HOST`
  - `POSTGRES_PORT`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`
- **JWT**
  - `JWT_SECRET`
  - `JWT_EXPIRATION` (optional; defaults to `24h` in code)
- **CORS**
  - `FRONTEND_URL` (allowed origin for browser requests)

> Note: `FRONTEND_URL` is used by the gateway in `apps/gateway/src/main.ts`.

---

## Vercel Environment Setup (Development / Preview / Production)

In Vercel Dashboard → **Project** → **Settings** → **Environment Variables**,
add `NEXT_PUBLIC_API_URL` for each environment.

### Development (Vercel “Development” env)

Use this only if you use `vercel dev` locally.

- `NEXT_PUBLIC_API_URL`: `http://localhost:3000`

### Preview (every PR / preview deployment)

Point preview frontend to a **staging backend**.

- `NEXT_PUBLIC_API_URL`: `https://<your-staging-backend-domain>`

Recommended: create a staging gateway URL like(example):

- `https://freshgrocer-api-staging.yourdomain.com`

### Production (main branch / production deployment)

Point production frontend to the **production backend**.

- `NEXT_PUBLIC_API_URL`: `https://<your-production-backend-domain>`

Recommended: use a stable domain like:

- `https://api.freshgrocer.yourdomain.com`

---

## Backend environment values per environment (staging vs production)

These are **not** set in Vercel (unless you also try to run backend on Vercel), but you should align them with your frontend environment.

### Development (localhost)

Example `.env` values:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=fresh_grocer

JWT_SECRET=change-me
JWT_EXPIRATION=24h

FRONTEND_URL=http://localhost:3004
```

### Preview/Staging

Example staging values:

```bash
POSTGRES_HOST=<staging-db-host>
POSTGRES_PORT=5432
POSTGRES_USER=<staging-user>
POSTGRES_PASSWORD=<staging-password>
POSTGRES_DB=<staging-db>

JWT_SECRET=<staging-secret>
JWT_EXPIRATION=24h

FRONTEND_URL=https://<your-vercel-preview-domain>
```

### Production

Example production values:

```bash
POSTGRES_HOST=<prod-db-host>
POSTGRES_PORT=5432
POSTGRES_USER=<prod-user>
POSTGRES_PASSWORD=<prod-password>
POSTGRES_DB=<prod-db>

JWT_SECRET=<prod-secret>
JWT_EXPIRATION=24h

FRONTEND_URL=https://<your-production-frontend-domain>
```

---

## Common pitfalls

### 1) “Frontend works locally, but fails on Vercel”

- Ensure `NEXT_PUBLIC_API_URL` is set in Vercel **Preview** and **Production**
- Ensure your backend allows the Vercel domain via `FRONTEND_URL` (CORS)

### 2) CORS errors in the browser

Your gateway enables CORS using one origin (`FRONTEND_URL`).
Set `FRONTEND_URL` to:

- Preview: the preview URL for that deploy (or a wildcard-capable proxy in front of gateway)
- Production: `https://<your-vercel-production-domain>` (or your custom domain)

If you want to support multiple origins (preview + prod), adjust gateway CORS config to allow a list/pattern.

### 3) Backend cannot run “as-is” on Vercel

Because gateway ↔ services are TCP `127.0.0.1`, the backend expects co-located processes.
Use a container host for backend, or refactor to HTTP/service discovery.

---

## Deployment checklist

- **Frontend (Vercel)**
  - Root Directory: `apps/web`
  - Env vars:
    - Preview: `NEXT_PUBLIC_API_URL=https://<staging-backend>`
    - Production: `NEXT_PUBLIC_API_URL=https://<prod-backend>`
- **Backend (container host)**
  - Env vars:
    - Database: `POSTGRES_*`
    - Auth: `JWT_SECRET` (+ optional `JWT_EXPIRATION`)
    - CORS: `FRONTEND_URL=https://<frontend-domain>`
  - Expose gateway port to the internet (default `3000`)

