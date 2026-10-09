import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminState } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

const status = z.enum(["draft", "published", "archived"]);
const slug = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug with hyphens.");
const webUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), "Use an http or https URL.");
const optionalUrl = z
  .union([z.literal(""), webUrl])
  .optional()
  .transform((value) => value || null);
const dateString = z
  .string()
  .min(10)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time.");
const eventRecord = z.object({
  title: z.string().trim().min(2).max(180),
  slug,
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(80),
  starts_at: dateString,
  ends_at: dateString.optional().nullable(),
  venue: z.string().max(240).optional().nullable(),
  registration_deadline: dateString.optional().nullable(),
  registration_url: optionalUrl,
  cover_image_url: optionalUrl,
  status,
});
const projectRecord = z.object({
  title: z.string().trim().min(2).max(180),
  slug,
  description: z.string().trim().min(10).max(5000),
  domain: z.string().max(100).optional().nullable(),
  technologies: z.array(z.string().trim().min(1).max(60)).max(30),
  contributors: z.array(z.string().trim().min(1).max(100)).max(80),
  repository_url: optionalUrl,
  demo_url: optionalUrl,
  cover_image_url: optionalUrl,
  status,
});
const resourceRecord = z.object({
  title: z.string().trim().min(2).max(180),
  slug,
  description: z.string().trim().min(10).max(4000),
  category: z.string().trim().min(2).max(80),
  url: webUrl,
  tags: z.array(z.string().trim().min(1).max(60)).max(30),
  status,
});
const teamRecord = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  role: z.string().trim().min(2).max(120),
  bio: z.string().max(1200).optional().nullable(),
  interests: z.array(z.string().trim().min(1).max(80)).max(20),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  image_url: optionalUrl,
  is_visible: z.boolean(),
  sort_order: z.number().int().min(0).max(10000),
});
const domainRecord = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  description: z.string().trim().min(10).max(3000),
  technologies: z.array(z.string().trim().min(1).max(60)).max(30),
  roadmap: z.array(z.unknown()).max(30).default([]),
  is_published: z.boolean(),
  sort_order: z.number().int().min(0).max(10000),
});
const updateOnly = {
  events: eventRecord.partial(),
  projects: projectRecord.partial(),
  resources: resourceRecord.partial(),
  team_members: teamRecord.partial(),
  domains: domainRecord.partial(),
};

async function authorized() {
  return (await getAdminState()).status === "authorized";
}
function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!(await authorized())) return errorResponse("Administrator authentication is required.", 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.");
  }
  const envelope = z
    .object({
      type: z.enum(["events", "projects", "resources", "team_members", "domains"]),
      record: z.unknown(),
    })
    .safeParse(body);
  if (!envelope.success) return errorResponse("Choose a supported content type.");
  const schema =
    envelope.data.type === "events"
      ? eventRecord
      : envelope.data.type === "projects"
        ? projectRecord
        : envelope.data.type === "resources"
          ? resourceRecord
          : envelope.data.type === "team_members"
            ? teamRecord
            : domainRecord;
  const parsed = schema.safeParse(envelope.data.record);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the content fields and try again.", details: parsed.error.flatten() },
      { status: 400 },
    );
  const normalized = { ...parsed.data };
  if (envelope.data.type === "events") {
    const event = normalized as z.infer<typeof eventRecord>;
    event.starts_at = new Date(event.starts_at).toISOString();
    if (event.ends_at) event.ends_at = new Date(event.ends_at).toISOString();
    if (event.registration_deadline)
      event.registration_deadline = new Date(event.registration_deadline).toISOString();
  }
  const { data, error } = await createAdminClient()
    .from(envelope.data.type)
    .insert(normalized as never)
    .select("id")
    .single();
  if (error)
    return errorResponse(
      error.code === "23505"
        ? "That slug is already in use."
        : `Could not create record: ${error.message}`,
      error.code === "23505" ? 409 : 500,
    );
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await authorized())) return errorResponse("Administrator authentication is required.", 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.");
  }
  const envelope = z
    .object({
      type: z.enum([
        "events",
        "projects",
        "resources",
        "team_members",
        "domains",
        "membership_applications",
        "contact_messages",
      ]),
      id: z.string().uuid(),
      record: z.record(z.string(), z.unknown()),
    })
    .safeParse(body);
  if (!envelope.success) return errorResponse("Choose a supported record and update.");
  let values: Record<string, unknown>;
  if (envelope.data.type === "membership_applications") {
    const parsed = z
      .object({
        status: z.enum(["pending", "reviewed", "accepted", "rejected"]).optional(),
        admin_notes: z.string().max(2000).optional(),
      })
      .strict()
      .safeParse(envelope.data.record);
    if (!parsed.success) return errorResponse("Invalid application update.");
    values = parsed.data;
  } else if (envelope.data.type === "contact_messages") {
    const parsed = z
      .object({ status: z.enum(["unread", "read", "resolved"]).optional() })
      .strict()
      .safeParse(envelope.data.record);
    if (!parsed.success) return errorResponse("Invalid message update.");
    values = parsed.data;
  } else {
    const parsed = updateOnly[envelope.data.type].safeParse(envelope.data.record);
    if (!parsed.success) return errorResponse("Invalid content update.");
    values = parsed.data;
    if (envelope.data.type === "events" && typeof values.starts_at === "string")
      values.starts_at = new Date(values.starts_at).toISOString();
  }
  if (Object.keys(values).length === 0) return errorResponse("No update fields were provided.");
  const { error } = await createAdminClient()
    .from(envelope.data.type)
    .update(values)
    .eq("id", envelope.data.id);
  if (error) return errorResponse(`Could not update record: ${error.message}`, 500);
  return NextResponse.json({ message: "Updated." });
}

export async function DELETE(request: NextRequest) {
  if (!(await authorized())) return errorResponse("Administrator authentication is required.", 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.");
  }
  const envelope = z
    .object({
      type: z.enum(["events", "projects", "resources", "team_members", "domains"]),
      id: z.string().uuid(),
    })
    .safeParse(body);
  if (!envelope.success) return errorResponse("Choose a supported record.");
  const { error } = await createAdminClient()
    .from(envelope.data.type)
    .delete()
    .eq("id", envelope.data.id);
  if (error) return errorResponse(`Could not delete record: ${error.message}`, 500);
  return NextResponse.json({ message: "Deleted." });
}
