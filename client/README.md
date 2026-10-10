# Vulcan Club: client website

This folder contains the full public Next.js website. The admin website and API backend are separate sibling folders in the repository.

## Repository structure

```text
admin/    Separate organizer dashboard website
client/   Public Next.js website
backend/  Node API, Supabase migrations, and server-only credentials
```

Each folder has its own `package.json`, `.env.example`, and Render service configuration. Local `.env` files are ignored by Git.

## Run locally

Start each service in its own terminal from the repository root:

```sh
cd backend && npm install && npm run dev
cd client && npm install && npm run dev
cd admin && npm install && npm run dev
```

The API runs at `http://localhost:4000`, the client website at `http://localhost:3000`, and the admin website at `http://localhost:3002`. The client and admin frontends call the backend API. Configure the origins in `backend/.env` if you change the local ports.

## Environment setup

Copy each folder's `.env.example` to `.env` if you are setting up a fresh checkout. Add the Supabase project URL and anon key to the client, admin, and backend environments. Put `SUPABASE_SERVICE_ROLE_KEY` only in `backend/.env` and in the backend Render service settings. Never expose it through a `NEXT_PUBLIC_` variable.

Set the `API_BASE_URL` in the admin app and `NEXT_PUBLIC_API_BASE_URL` in the client to the backend URL. Locally, use `http://localhost:4000`. In production, use the deployed backend's public HTTPS URL. Set `FRONTEND_ORIGINS` in the backend to the exact public origins of both Render websites, comma separated.

## Deploy the three services on Render

The three `render.yaml` files configure independent web services. Create a Render service/Blueprint for each file, using the matching folder as its root directory: `client`, `admin`, or `backend`. The Render dashboard supports a custom Blueprint file path when creating a Blueprint. See [Render's Blueprint documentation](https://render.com/docs/infrastructure-as-code) and [monorepo root directory guide](https://render.com/docs/monorepo-support).

Deploy the backend first, then set its public URL as `NEXT_PUBLIC_API_BASE_URL` in the client and `API_BASE_URL` in the admin. Set `CLIENT_FRONTEND_URL` in the admin to the public client URL. Finally set `FRONTEND_ORIGINS` in the backend to both public website origins. Add Supabase URL and anon key to all three services and the service-role key to the backend. Redeploy after changing build-time client environment variables.

The main Render deployment does not require `vercel.json`; it remains in the client folder for optional Vercel hosting.

## Supabase setup

Apply the schema and policies in `backend/supabase/migrations` to the Supabase project. The optional seed is in `backend/supabase/seed.sql`. Create an organizer account in Supabase Auth, then insert its UUID into `public.admin_users`. The backend checks the access token and allowlist before returning private admin data or accepting changes.

The public site reads published data with the anon key and RLS. Public application and contact forms, admin dashboard data, status changes, and CSV exports go through the standalone API. Set `USE_DEMO_DATA=true` only for local preview data; it is disabled in production.

## Client website commands

```sh
npm run lint
npm run typecheck
npm run build
```
