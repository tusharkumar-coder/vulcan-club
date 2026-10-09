import assert from "node:assert/strict";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const pages = [
  "/",
  "/about",
  "/domains",
  "/events",
  "/projects",
  "/competitive-programming",
  "/team",
  "/resources",
  "/join",
  "/contact",
  "/privacy",
  "/terms",
  "/admin",
  "/robots.txt",
  "/sitemap.xml",
];

for (const path of pages) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, `${path} should render`);
  const body = await response.text();
  if (path === "/") assert.match(body, /WE FORGE/);
  if (path === "/join") assert.match(body, /privacy notice/i);
  if (path === "/events") assert.match(body, /event/i);
}

async function post(path, payload) {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const invalidJoin = await post("/api/join", {
  full_name: "A",
  email: "bad",
  academic_year: "Year 1",
  interests: [],
  experience_level: "Just starting",
  why_join: "short",
  consent: false,
  website: "",
});
assert.equal(invalidJoin.status, 400, "invalid membership input should be rejected");
const invalidContact = await post("/api/contact", {
  name: "A",
  email: "bad",
  subject: "x",
  message: "short",
  website: "",
});
assert.equal(invalidContact.status, 400, "invalid contact input should be rejected");
const unauthAdmin = await fetch(`${base}/api/admin/records`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "projects", record: {} }),
});
assert.equal(unauthAdmin.status, 401, "admin mutation should reject unauthenticated requests");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const validJoin = await post("/api/join", {
    full_name: "Preview Applicant",
    email: "preview@example.invalid",
    academic_year: "Year 1",
    interests: ["Web development"],
    experience_level: "Just starting",
    why_join: "I would like to learn with the community and build a small project.",
    consent: true,
    website: "",
  });
  assert.equal(validJoin.status, 503, "valid form must report missing persistence configuration");
  const validContact = await post("/api/contact", {
    name: "Preview User",
    email: "preview@example.invalid",
    subject: "A test message",
    message: "This is a local smoke-test message, not a real contact request.",
    website: "",
  });
  assert.equal(
    validContact.status,
    503,
    "valid contact must report missing persistence configuration",
  );
}

console.log(`Smoke checks passed for ${pages.length} routes and public API guards.`);
