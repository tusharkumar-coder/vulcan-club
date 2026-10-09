"use client";

import { useState, type FormEvent } from "react";

export function EventRegistration({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [state, setState] = useState<{ kind: "idle" | "success" | "error"; message: string }>({
    kind: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setState({ kind: "idle", message: "" });
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/event-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          name: form.get("name"),
          email: form.get("email"),
          website: form.get("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration could not be completed.");
      setState({
        kind: "success",
        message: "You’re registered. Check your inbox for any event updates.",
      });
      event.currentTarget.reset();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Registration could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <h2 style={{ fontSize: 25, margin: "0 0 8px" }}>Register for this session</h2>
      <p className="muted" style={{ fontSize: 12, margin: "0 0 20px" }}>
        Your information will only be used to manage your registration for {eventTitle}.
      </p>
      {state.message && (
        <div
          className={`form-status ${state.kind}`}
          role={state.kind === "error" ? "alert" : "status"}
        >
          {state.message}
        </div>
      )}
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="event-name">Full name</label>
          <input id="event-name" name="name" required maxLength={100} autoComplete="name" />
        </div>
        <div className="field full">
          <label htmlFor="event-email">Email</label>
          <input
            id="event-email"
            name="email"
            required
            type="email"
            maxLength={254}
            autoComplete="email"
          />
        </div>
        <div className="trap" aria-hidden="true">
          <label htmlFor="event-website">Leave this field empty</label>
          <input id="event-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <button className="button form-submit" disabled={loading}>
        {loading ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
