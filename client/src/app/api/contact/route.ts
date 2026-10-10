import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { contactSchema } from "@/lib/schemas";
import { createAdminClient, hasServerSupabaseConfig } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Please wait before sending another message." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid message." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please review the fields and try again.", details: parsed.error.flatten() },
      { status: 400 },
    );
  if (parsed.data.website)
    return NextResponse.json({ message: "Message received." }, { status: 200 });
  if (!hasServerSupabaseConfig())
    return NextResponse.json(
      {
        error:
          "Messages are not being saved yet. The club administrator needs to configure Supabase URL, anon key, and the server-only service role key.",
      },
      { status: 503 },
    );
  const { error } = await createAdminClient().from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "unread",
  });
  if (error)
    return NextResponse.json(
      { error: `Could not save your message. ${error.message}` },
      { status: 500 },
    );
  return NextResponse.json({ message: "Message saved." }, { status: 201 });
}
