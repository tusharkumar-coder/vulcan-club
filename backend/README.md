# Vulcan API backend

The Node API accepts public applications and messages and exposes protected organizer routes for the standalone admin frontend.

## Local setup

Copy `.env.example` to `.env` in this folder, then set the Supabase URL, anon key, and server-only service-role key. Run `npm install` and `npm run dev` from this folder; the API listens on port 4000 by default. The `FRONTEND_ORIGINS` setting must include the public origin of each browser frontend.

The `/api/admin/dashboard`, `/api/admin/records`, and `/api/admin/export` routes require a valid Supabase access token and an `admin_users` row for that user. The service-role key is used only by this backend and must never be copied to either frontend. This folder also contains the Supabase migrations and a standalone Render config; deploy the API service independently from the two websites.
