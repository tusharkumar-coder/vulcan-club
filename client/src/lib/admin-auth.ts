import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createAdminClient,
  hasPublicSupabaseConfig,
  hasServerSupabaseConfig,
} from "@/lib/supabase";

export type AdminState = {
  status: "setup" | "signed-out" | "forbidden" | "authorized";
  userId?: string;
  email?: string;
};

export async function getAdminState(): Promise<AdminState> {
  if (!hasPublicSupabaseConfig() || !hasServerSupabaseConfig()) return { status: "setup" };
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* Server components cannot write cookies; refresh route handles renewal. */
          }
        },
      },
    },
  );
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { status: "signed-out" };
  const { data, error } = await createAdminClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return { status: "forbidden", userId: user.id, email: user.email };
  return { status: "authorized", userId: user.id, email: user.email };
}

export async function isAdminRequest() {
  const state = await getAdminState();
  return state.status === "authorized";
}
