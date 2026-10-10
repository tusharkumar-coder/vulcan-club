import { createServer } from "node:http";
import { URL } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
try {
  const environment = readFileSync(path.join(backendDirectory, ".env"), "utf8");
  for (const line of environment.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const value = match[2].replace(/^(?:"(.*)"|'(.*)')$/, (_whole, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
    process.env[match[1]] = value;
  }
} catch {}

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || "http://localhost:3000,http://localhost:3001,http://localhost:3002")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (process.env.NODE_ENV !== "production") {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  }
  return false;
}

const routes = [];
const app = {
  get: (path, handler) => routes.push({ method: "GET", path, handler }),
  post: (path, handler) => routes.push({ method: "POST", path, handler }),
  patch: (path, handler) => routes.push({ method: "PATCH", path, handler }),
  delete: (path, handler) => routes.push({ method: "DELETE", path, handler }),
};

const hasSupabaseConfig = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

const buckets = new Map();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit)
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function requestLimit(request, response, key, limit, windowMs, message) {
  const ip = request.ip || request.socket.remoteAddress || "unknown";
  const result = rateLimit(`${key}:${ip}`, limit, windowMs);
  if (result.allowed) return true;
  response.setHeader("Retry-After", String(result.retryAfterSeconds));
  response.status(429).json({ error: message(result.retryAfterSeconds) });
  return false;
}

const asyncRoute = (handler) => (request, response, next) =>
  Promise.resolve(handler(request, response, next)).catch(next);

const webUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), "Use an http or https URL.");
const optionalUrl = z.union([z.literal(""), webUrl]).optional();
const joinSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  academic_year: z.enum(["Year 1", "Year 2", "Year 3", "Year 4", "Other"]),
  interests: z.array(z.string().trim().min(1).max(80)).min(1).max(7),
  experience_level: z.enum(["Just starting", "Some practice", "Building projects", "Experienced"]),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  why_join: z.string().trim().min(20).max(1200),
  consent: z.boolean().refine((value) => value),
  website: z.string().max(0).optional(),
});
const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(15).max(4000),
  website: z.string().max(0).optional(),
});
const eventRegistrationSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  website: z.string().max(0).optional(),
});

const status = z.enum(["draft", "published", "archived"]);
const slug = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug with hyphens.");
const adminOptionalUrl = z
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
  registration_url: adminOptionalUrl,
  cover_image_url: adminOptionalUrl,
  status,
});
const projectRecord = z.object({
  title: z.string().trim().min(2).max(180),
  slug,
  description: z.string().trim().min(10).max(5000),
  domain: z.string().max(100).optional().nullable(),
  technologies: z.array(z.string().trim().min(1).max(60)).max(30),
  contributors: z.array(z.string().trim().min(1).max(100)).max(80),
  repository_url: adminOptionalUrl,
  demo_url: adminOptionalUrl,
  cover_image_url: adminOptionalUrl,
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
  github_url: adminOptionalUrl,
  linkedin_url: adminOptionalUrl,
  instagram_url: adminOptionalUrl,
  skills: z.array(z.string().trim().min(1).max(80)).max(30),
  image_url: adminOptionalUrl,
  is_visible: z.boolean(),
  sort_order: z.number().int().min(0).max(10000),
});
const leaderboardRecord = z.object({
  contest_name: z.string().trim().min(2).max(180),
  contest_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  student_name: z.string().trim().min(2).max(120),
  academic_year: z.enum(["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"]),
  points: z.number().min(0).max(10000000),
  status,
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
const contentSchemas = {
  events: eventRecord,
  projects: projectRecord,
  resources: resourceRecord,
  team_members: teamRecord,
  domains: domainRecord,
  leaderboard_entries: leaderboardRecord,
};
const updateSchemas = {
  events: eventRecord.partial(),
  projects: projectRecord.partial(),
  resources: resourceRecord.partial(),
  team_members: teamRecord.partial(),
  domains: domainRecord.partial(),
  leaderboard_entries: leaderboardRecord.partial(),
};

async function getAdminStatus(request) {
  if (!hasSupabaseConfig()) return { status: 503, message: "Backend Supabase credentials are not configured." };
  const token = request.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { status: 401, message: "Administrator authentication is required." };
  const {
    data: { user },
    error: authError,
  } = await createPublicClient().auth.getUser(token);
  if (authError || !user) return { status: 401, message: "Please sign in again." };
  const { data, error } = await createAdminClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return { status: 500, message: `Could not verify administrator access: ${error.message}` };
  if (!data) return { status: 403, message: "This account is not an authorized administrator." };
  return { status: 200, user };
}

async function requireAdmin(request, response) {
  const result = await getAdminStatus(request);
  if (result.status !== 200) {
    response.status(result.status).json({ error: result.message });
    return null;
  }
  return result.user;
}

function invalidBody(response, schema, body, message = "Please review the submitted fields.") {
  const parsed = schema.safeParse(body);
  if (parsed.success) return parsed.data;
  response.status(400).json({ error: message, details: parsed.error.flatten() });
  return null;
}

app.get("/api/health", (_request, response) =>
  response.json({ service: "vulcan-club-api", status: "ok", supabaseConfigured: hasSupabaseConfig() }),
);

app.get(
  "/api/admin/dashboard",
  asyncRoute(async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    if (!hasSupabaseConfig())
      return response.status(503).json({ error: "Backend Supabase credentials are not configured." });
    const client = createAdminClient();
    const [events, projects, domains, resources, team, leaderboardEntries, applications, messages, registrations] =
      await Promise.all([
        client.from("events").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("projects").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("domains").select("*").order("sort_order", { ascending: true }).limit(100),
        client.from("resources").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("team_members").select("*").order("sort_order", { ascending: true }).limit(100),
        client
          .from("leaderboard_entries")
          .select("*")
          .order("contest_date", { ascending: false })
          .order("points", { ascending: false })
          .limit(500),
        client.from("membership_applications").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("event_registrations").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
    const failed = [events, projects, domains, resources, team, leaderboardEntries, applications, messages, registrations]
      .find((result) => result.error);
    if (failed?.error)
      return response.status(500).json({ error: `Could not load admin dashboard: ${failed.error.message}` });
    return response.json({
      events: events.data ?? [],
      projects: projects.data ?? [],
      domains: domains.data ?? [],
      resources: resources.data ?? [],
      team: team.data ?? [],
      leaderboardEntries: leaderboardEntries.data ?? [],
      applications: applications.data ?? [],
      messages: messages.data ?? [],
      registrations: registrations.data ?? [],
    });
  }),
);

app.post(
  "/api/contact",
  asyncRoute(async (request, response) => {
    if (!requestLimit(request, response, "contact", 5, 10 * 60 * 1000, () => "Please wait before sending another message.")) return;
    const body = invalidBody(response, contactSchema, request.body, "Please review the fields and try again.");
    if (!body) return;
    if (body.website) return response.status(200).json({ message: "Message received." });
    if (!hasSupabaseConfig()) return response.status(503).json({ error: "Messages are not being saved yet. Configure the Supabase URL, anon key, and server-only service-role key." });
    const { error } = await createAdminClient().from("contact_messages").insert({
      name: body.name,
      email: body.email.toLowerCase(),
      subject: body.subject,
      message: body.message,
      status: "unread",
    });
    if (error) return response.status(500).json({ error: `Could not save your message. ${error.message}` });
    return response.status(201).json({ message: "Message saved." });
  }),
);

app.post(
  "/api/join",
  asyncRoute(async (request, response) => {
    if (!requestLimit(request, response, "join", 3, 10 * 60 * 1000, (seconds) => `Please wait before submitting another application. Try again in about ${Math.ceil(seconds / 60)} minute(s).`)) return;
    const body = invalidBody(response, joinSchema, request.body, "Please review the highlighted fields and try again.");
    if (!body) return;
    if (body.website) return response.status(200).json({ message: "Application received." });
    if (!hasSupabaseConfig()) return response.status(503).json({ error: "Applications are not being saved yet. Configure the Supabase URL, anon key, and server-only service-role key." });
    const { error } = await createAdminClient().from("membership_applications").insert({
      full_name: body.full_name,
      email: body.email.toLowerCase(),
      academic_year: body.academic_year,
      interests: body.interests,
      experience_level: body.experience_level,
      github_url: body.github_url || null,
      linkedin_url: body.linkedin_url || null,
      why_join: body.why_join,
      consent_at: new Date().toISOString(),
      status: "pending",
    });
    if (error?.code === "23505") return response.status(409).json({ error: "An application has already been submitted with this email address. Contact the club if you need to update it." });
    if (error) return response.status(500).json({ error: `Could not save your application. ${error.message}` });
    return response.status(201).json({ message: "Application saved." });
  }),
);

app.post(
  "/api/event-registration",
  asyncRoute(async (request, response) => {
    if (!requestLimit(request, response, "event-register", 6, 10 * 60 * 1000, () => "Please wait before trying again.")) return;
    const body = invalidBody(response, eventRegistrationSchema, request.body, "Check your name and email, then try again.");
    if (!body) return;
    if (body.website) return response.status(200).json({ message: "Registration received." });
    if (!hasSupabaseConfig()) return response.status(503).json({ error: "Event registration is not configured yet. Please contact the club organizers." });
    const client = createAdminClient();
    const { data: event, error: eventError } = await client
      .from("events")
      .select("id,registration_deadline")
      .eq("id", body.event_id)
      .eq("status", "published")
      .maybeSingle();
    if (eventError || !event) return response.status(404).json({ error: "This event is no longer accepting registrations." });
    if (event.registration_deadline && new Date(event.registration_deadline).getTime() < Date.now())
      return response.status(410).json({ error: "The registration deadline has passed." });
    const { error } = await client.from("event_registrations").insert({
      event_id: body.event_id,
      name: body.name,
      email: body.email.toLowerCase(),
      status: "registered",
    });
    if (error?.code === "23505") return response.status(409).json({ error: "This email is already registered for the event." });
    if (error) return response.status(500).json({ error: `Could not save registration. ${error.message}` });
    return response.status(201).json({ message: "Registration saved." });
  }),
);

app.post(
  "/api/admin/records",
  asyncRoute(async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const envelope = invalidBody(
      response,
      z.object({ type: z.enum(Object.keys(contentSchemas)), record: z.unknown() }),
      request.body,
      "Choose a supported content type.",
    );
    if (!envelope) return;
    const record = invalidBody(response, contentSchemas[envelope.type], envelope.record, "Check the content fields and try again.");
    if (!record) return;
    const normalized = { ...record };
    if (envelope.type === "events") {
      normalized.starts_at = new Date(normalized.starts_at).toISOString();
      if (normalized.ends_at) normalized.ends_at = new Date(normalized.ends_at).toISOString();
      if (normalized.registration_deadline) normalized.registration_deadline = new Date(normalized.registration_deadline).toISOString();
    }
    const { data, error } = await createAdminClient()
      .from(envelope.type)
      .insert(normalized)
      .select("id")
      .single();
    if (error) {
      const message = error.code === "23505"
        ? envelope.type === "leaderboard_entries"
          ? "A result for this student is already recorded for that contest and date."
          : "That slug is already in use."
        : `Could not create record: ${error.message}`;
      return response.status(error.code === "23505" ? 409 : 500).json({ error: message });
    }
    return response.status(201).json({ id: data.id });
  }),
);

app.patch(
  "/api/admin/records",
  asyncRoute(async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const envelope = invalidBody(
      response,
      z.object({
        type: z.enum([...Object.keys(contentSchemas), "membership_applications", "contact_messages"]),
        id: z.string().uuid(),
        record: z.record(z.string(), z.unknown()),
      }),
      request.body,
      "Choose a supported record and update.",
    );
    if (!envelope) return;
    let values;
    if (envelope.type === "membership_applications") {
      values = invalidBody(response, z.object({ status: z.enum(["pending", "reviewed", "accepted", "rejected"]).optional(), admin_notes: z.string().max(2000).optional() }).strict(), envelope.record, "Invalid application update.");
    } else if (envelope.type === "contact_messages") {
      values = invalidBody(response, z.object({ status: z.enum(["unread", "read", "resolved"]).optional() }).strict(), envelope.record, "Invalid message update.");
    } else {
      values = invalidBody(response, updateSchemas[envelope.type], envelope.record, "Invalid content update.");
      if (values && envelope.type === "events" && typeof values.starts_at === "string") values.starts_at = new Date(values.starts_at).toISOString();
    }
    if (!values) return;
    if (Object.keys(values).length === 0) return response.status(400).json({ error: "No update fields were provided." });
    const { error } = await createAdminClient().from(envelope.type).update(values).eq("id", envelope.id);
    if (error) return response.status(500).json({ error: `Could not update record: ${error.message}` });
    return response.json({ message: "Updated." });
  }),
);

app.delete(
  "/api/admin/records",
  asyncRoute(async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const envelope = invalidBody(
      response,
      z.object({ type: z.enum(Object.keys(contentSchemas)), id: z.string().uuid() }),
      request.body,
      "Choose a supported record.",
    );
    if (!envelope) return;
    const { error } = await createAdminClient().from(envelope.type).delete().eq("id", envelope.id);
    if (error) return response.status(500).json({ error: `Could not delete record: ${error.message}` });
    return response.json({ message: "Deleted." });
  }),
);

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

app.get(
  "/api/admin/export",
  asyncRoute(async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const type = request.query.type;
    const table = type === "applications" ? "membership_applications" : type === "registrations" ? "event_registrations" : null;
    if (!table) return response.status(400).json({ error: "Unsupported export." });
    const keys = type === "applications"
      ? ["id", "full_name", "email", "academic_year", "interests", "experience_level", "github_url", "linkedin_url", "why_join", "status", "created_at"]
      : ["id", "event_id", "name", "email", "status", "created_at"];
    const { data, error } = await createAdminClient()
      .from(table)
      .select(keys.join(","))
      .order("created_at", { ascending: false });
    if (error) return response.status(500).json({ error: `Export failed: ${error.message}` });
    const rows = data ?? [];
    const columns = rows.length ? Object.keys(rows[0]) : keys;
    const output = [columns.map(csv).join(","), ...rows.map((row) => columns.map((key) => csv(row[key])).join(","))].join("\r\n");
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="vulcan-${type}.csv"`);
    response.setHeader("Cache-Control", "no-store");
    return response.send(output);
  }),
);

async function readJsonBody(request) {
  if (!["POST", "PATCH", "DELETE"].includes(request.method)) return undefined;
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON request body."), { status: 400 });
  }
}

function responseAdapter(rawResponse) {
  return {
    status(code) {
      rawResponse.statusCode = code;
      return this;
    },
    setHeader: rawResponse.setHeader.bind(rawResponse),
    json(value) {
      if (!rawResponse.headersSent) rawResponse.setHeader("Content-Type", "application/json; charset=utf-8");
      rawResponse.end(JSON.stringify(value));
      return this;
    },
    sendStatus(code) {
      rawResponse.statusCode = code;
      rawResponse.end();
      return this;
    },
    send(value) {
      rawResponse.end(value);
      return this;
    },
  };
}

async function handleRequest(rawRequest, rawResponse) {
  const origin = rawRequest.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    rawResponse.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
    rawResponse.end(JSON.stringify({ error: "This frontend origin is not allowed." }));
    return;
  }
  if (origin) {
    rawResponse.setHeader("Access-Control-Allow-Origin", origin);
    rawResponse.setHeader("Vary", "Origin");
  }
  rawResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  rawResponse.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  if (rawRequest.method === "OPTIONS") {
    rawResponse.statusCode = 204;
    rawResponse.end();
    return;
  }

  const url = new URL(rawRequest.url || "/", `http://${rawRequest.headers.host || "localhost"}`);
  const route = routes.find((item) => item.method === rawRequest.method && item.path === url.pathname);
  const response = responseAdapter(rawResponse);
  if (!route) {
    response.status(404).json({ error: "API route not found." });
    return;
  }

  try {
    const request = {
      method: rawRequest.method,
      socket: rawRequest.socket,
      ip: rawRequest.headers["x-forwarded-for"]?.split(",")[0]?.trim() || rawRequest.socket.remoteAddress || "unknown",
      query: Object.fromEntries(url.searchParams.entries()),
      body: await readJsonBody(rawRequest),
      get(name) {
        const value = rawRequest.headers[name.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
      },
    };
    const next = (error) => {
      if (!error) return;
      console.error("API request failed:", error);
      if (!rawResponse.writableEnded)
        response.status(error.status || 500).json({
          error: error.status === 413 ? error.message : error.status === 400 ? error.message : "The API could not complete this request.",
        });
    };
    await route.handler(request, response, next);
  } catch (error) {
    console.error("API request failed:", error);
    response.status(error.status || 500).json({
      error: error.status === 413 ? error.message : error.status === 400 ? error.message : "The API could not complete this request.",
    });
  }
}

createServer(handleRequest).listen(port, "0.0.0.0", () => {
  console.log(`Vulcan Club API listening at http://localhost:${port}`);
});
