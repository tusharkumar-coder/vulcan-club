import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { eventRegistrationSchema } from "@/lib/schemas";
import { createAdminClient, hasServerSupabaseConfig } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`event-register:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please submit valid registration details." },
      { status: 400 },
    );
  }
  const parsed = eventRegistrationSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check your name and email, then try again.", details: parsed.error.flatten() },
      { status: 400 },
    );
  if (parsed.data.website)
    return NextResponse.json({ message: "Registration received." }, { status: 200 });
  if (!hasServerSupabaseConfig())
    return NextResponse.json(
      { error: "Event registration is not configured yet. Please contact the club organizers." },
      { status: 503 },
    );
  const client = createAdminClient();
  const { data: event, error: eventError } = await client
    .from("events")
    .select("id,registration_deadline")
    .eq("id", parsed.data.event_id)
    .eq("status", "published")
    .maybeSingle();
  if (eventError || !event)
    return NextResponse.json(
      { error: "This event is no longer accepting registrations." },
      { status: 404 },
    );
  if (event.registration_deadline && new Date(event.registration_deadline).getTime() < Date.now())
    return NextResponse.json({ error: "The registration deadline has passed." }, { status: 410 });
  const { error } = await client.from("event_registrations").insert({
    event_id: parsed.data.event_id,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    status: "registered",
  });
  if (error?.code === "23505")
    return NextResponse.json(
      { error: "This email is already registered for the event." },
      { status: 409 },
    );
  if (error)
    return NextResponse.json(
      { error: `Could not save registration. ${error.message}` },
      { status: 500 },
    );
  return NextResponse.json({ message: "Registration saved." }, { status: 201 });
}
