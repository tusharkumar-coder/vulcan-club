import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { joinSchema } from "@/lib/schemas";
import { createAdminClient, hasServerSupabaseConfig } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`join:${ip}`, 3, 10 * 60 * 1000);
  if (!limit.allowed)
    return NextResponse.json(
      {
        error: `Please wait before submitting another application. Try again in about ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 });
  }
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Please review the highlighted fields and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  if (parsed.data.website)
    return NextResponse.json({ message: "Application received." }, { status: 200 });
  if (!hasServerSupabaseConfig())
    return NextResponse.json(
      {
        error:
          "Applications are not being saved yet. The club administrator needs to configure Supabase URL, anon key, and the server-only service role key.",
      },
      { status: 503 },
    );
  const value = parsed.data;
  const { error } = await createAdminClient()
    .from("membership_applications")
    .insert({
      full_name: value.full_name,
      email: value.email.toLowerCase(),
      academic_year: value.academic_year,
      interests: value.interests,
      experience_level: value.experience_level,
      github_url: value.github_url || null,
      linkedin_url: value.linkedin_url || null,
      why_join: value.why_join,
      consent_at: new Date().toISOString(),
      status: "pending",
    });
  if (error) {
    if (error.code === "23505")
      return NextResponse.json(
        {
          error:
            "An application has already been submitted with this email address. Contact the club if you need to update it.",
        },
        { status: 409 },
      );
    return NextResponse.json(
      { error: `Could not save your application. ${error.message}` },
      { status: 500 },
    );
  }
  return NextResponse.json({ message: "Application saved." }, { status: 201 });
}
