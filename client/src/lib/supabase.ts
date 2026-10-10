import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const hasPublicSupabaseConfig = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasServerSupabaseConfig = () =>
  hasPublicSupabaseConfig() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export function createPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error("Supabase is not configured. Add the public URL and anon key to .env.local.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Server Supabase access is not configured. Add the URL and service role key to server environment variables.",
    );
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
