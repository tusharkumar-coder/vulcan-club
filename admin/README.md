# Vulcan admin frontend

This separate admin frontend signs users in with Supabase Auth, then sends the access token to the backend. The backend verifies both the Supabase user and the `admin_users` allowlist before returning private records or accepting admin changes. The Supabase anon key is public configuration; never put the service-role key in this folder.

## Run locally

Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `API_BASE_URL`, and `CLIENT_FRONTEND_URL` in `admin/.env`, then run the backend and admin app from separate terminals:

```sh
cd backend && npm run dev
cd admin && npm run dev
```

The admin frontend runs at <http://localhost:3002>. Add its deployed origin to the backend's `FRONTEND_ORIGINS`. This standalone console supports listing dashboard data, publishing or changing statuses, exporting application and registration CSV files, and reviewing submissions. Deploy it as its own Render web service from this folder's `render.yaml`.
