"use client";

import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key)
        throw new Error("Set the public Supabase URL and anon key before signing in.");
      const client = createBrowserClient(url, key);
      const { error } = await client.auth.signInWithPassword({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) throw new Error(error.message);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <h2 style={{ fontSize: 25, marginTop: 0 }}>Administrator sign in</h2>
      <p className="muted" style={{ fontSize: 13 }}>
        Use the Supabase Auth account associated with an authorized admin record.
      </p>
      {error && (
        <div className="form-status error" role="alert">
          {error}
        </div>
      )}
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="field full">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      </div>
      <button className="button form-submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
