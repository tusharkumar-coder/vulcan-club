const config = window.VULCAN_CONFIG || {};
const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");
const tokenKey = "vulcan-admin-access-token";
const emailKey = "vulcan-admin-email";
let accessToken = sessionStorage.getItem(tokenKey) || "";
let data = null;
let section = "overview";
const sections = [
  ["overview", "Overview", "⌂"], ["events", "Events", "◷"], ["projects", "Projects", "◇"],
  ["resources", "Resources", "▤"], ["domains", "Domains", "⌘"], ["team", "Team", "◎"],
  ["leaderboardEntries", "Leaderboards", "↗"], ["applications", "Applications", "＋"],
  ["messages", "Messages", "✉"], ["registrations", "Registrations", "▣"],
];
const entityTypes = { events: "events", projects: "projects", resources: "resources", domains: "domains", team: "team_members", leaderboardEntries: "leaderboard_entries", applications: "membership_applications", messages: "contact_messages" };
const labels = { events: "Events", projects: "Projects", resources: "Resources", domains: "Domains", team: "Team members", leaderboardEntries: "Leaderboard entries", applications: "Applications", messages: "Messages", registrations: "Registrations" };
const displayFields = {
  events: ["title", "category", "starts_at", "status"], projects: ["title", "domain", "status"],
  resources: ["title", "category", "status"], domains: ["name", "sort_order", "is_published"],
  team: ["name", "role", "is_visible"], leaderboardEntries: ["contest_name", "student_name", "academic_year", "points", "status"],
  applications: ["full_name", "email", "academic_year", "status"], messages: ["name", "subject", "email", "status"],
  registrations: ["name", "email", "status", "created_at"],
};
const el = (selector) => document.querySelector(selector);

function setNotice(message, state = "") {
  const notice = el("#page-notice");
  notice.textContent = message;
  notice.dataset.state = state;
}
function showSignedOut(message = "") {
  accessToken = "";
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(emailKey);
  el("#login-panel").hidden = false;
  el("#dashboard").hidden = true;
  el("#account").replaceChildren();
  el("#login-notice").textContent = message;
}
function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value == null ? "—" : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  row.append(cell);
}
function updateButton(record, collection) {
  const editable = ["events", "projects", "resources", "domains", "team", "applications", "messages"].includes(collection);
  if (!editable) return null;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "row-action";
  const field = collection === "team" ? "is_visible" : collection === "domains" ? "is_published" : "status";
  const active = record[field] === true || record[field] === "published" || record[field] === "accepted" || record[field] === "resolved";
  button.textContent = active ? "Set draft" : "Publish / approve";
  button.addEventListener("click", () => updateRecord(record, collection, field, active));
  return button;
}
function renderTable() {
  const title = el("#section-title");
  const heading = el("#table-head");
  const body = el("#table-body");
  heading.replaceChildren();
  body.replaceChildren();
  title.textContent = section === "overview" ? "Overview" : labels[section];
  const exportButton = el("#export-button");
  exportButton.hidden = !["applications", "registrations"].includes(section);
  exportButton.textContent = `Download ${section === "applications" ? "applications" : "registrations"} CSV`;
  if (!data) return;
  const current = section === "overview" ? "events" : section;
  const fields = displayFields[current] || [];
  const headRow = document.createElement("tr");
  for (const field of [...fields, ""] ) {
    const th = document.createElement("th");
    th.textContent = field.replaceAll("_", " ").toUpperCase();
    headRow.append(th);
  }
  heading.append(headRow);
  const records = data[current] || [];
  for (const record of records) {
    const row = document.createElement("tr");
    for (const field of fields) {
      let value = record[field];
      if (["starts_at", "created_at", "contest_date"].includes(field) && value) value = new Date(value).toLocaleDateString();
      addCell(row, value);
    }
    const actionCell = document.createElement("td");
    const button = updateButton(record, current);
    if (button) actionCell.append(button);
    row.append(actionCell);
    body.append(row);
  }
  if (!records.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = fields.length + 1;
    cell.className = "empty";
    cell.textContent = "Nothing here yet. Records added to the database will appear in this table.";
    row.append(cell);
    body.append(row);
  }
}
function renderStats() {
  const stats = [["Events", data.events.length], ["Projects", data.projects.length], ["Applications", data.applications.length], ["Unread messages", data.messages.filter((item) => item.status === "unread").length]];
  const container = el("#stats");
  container.replaceChildren();
  for (const [name, count] of stats) {
    const card = document.createElement("article");
    card.className = "stat-card";
    const label = document.createElement("span"); label.textContent = name;
    const value = document.createElement("strong"); value.textContent = String(count);
    card.append(label, value); container.append(card);
  }
}
function renderNavigation() {
  const nav = el("#navigation");
  nav.replaceChildren();
  for (const [key, label, icon] of sections) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `nav-item${section === key ? " active" : ""}`;
    button.innerHTML = `<span class="nav-icon" aria-hidden="true">${icon}</span><span></span>`;
    button.querySelector("span:last-child").textContent = label;
    button.addEventListener("click", () => { section = key; renderNavigation(); renderTable(); });
    nav.append(button);
  }
}
function showDashboard() {
  el("#login-panel").hidden = true;
  el("#dashboard").hidden = false;
  const account = el("#account");
  account.replaceChildren();
  const email = document.createElement("span"); email.textContent = sessionStorage.getItem(emailKey) || "Authorized organizer";
  const signOut = document.createElement("button"); signOut.className = "ghost"; signOut.textContent = "Sign out"; signOut.addEventListener("click", signOutUser);
  account.append(email, signOut);
  renderNavigation(); renderStats(); renderTable();
}
async function api(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...options.headers },
  });
  if (response.status === 401 || response.status === 403) throw new Error("Your session is not authorized. Sign in with an administrator account.");
  const result = options.csv ? await response.text() : await response.json();
  if (!response.ok) throw new Error(result.error || "The API request failed.");
  return result;
}
async function loadDashboard() {
  if (!accessToken) return showSignedOut();
  try {
    data = await api("/api/admin/dashboard");
    showDashboard();
  } catch (error) {
    showSignedOut(error instanceof Error ? error.message : "Could not load admin data.");
  }
}
async function updateRecord(record, collection, field, active) {
  const type = entityTypes[collection];
  const value = field === "is_visible" || field === "is_published" ? !active : collection === "applications" ? (active ? "pending" : "accepted") : collection === "messages" ? (active ? "unread" : "resolved") : (active ? "draft" : "published");
  try {
    await api("/api/admin/records", { method: "PATCH", body: JSON.stringify({ type, id: record.id, record: { [field]: value } }) });
    data = await api("/api/admin/dashboard");
    renderStats(); renderTable(); setNotice("Saved changes to the backend.", "success");
  } catch (error) { setNotice(error instanceof Error ? error.message : "Could not update record.", "error"); }
}
async function signOutUser() {
  if (accessToken && config.supabaseUrl && config.supabaseAnonKey) {
    try { await fetch(`${config.supabaseUrl}/auth/v1/logout?scope=local`, { method: "POST", headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${accessToken}` } }); } catch {}
  }
  showSignedOut();
}

el("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const notice = el("#login-notice");
  notice.textContent = "Signing in…";
  const button = event.currentTarget.querySelector("button[type=submit]"); button.disabled = true;
  try {
    if (!config.supabaseUrl || !config.supabaseAnonKey) throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY in admin/.env.");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: config.supabaseAnonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg || result.message || "Sign in failed.");
    accessToken = result.access_token;
    sessionStorage.setItem(tokenKey, accessToken);
    sessionStorage.setItem(emailKey, result.user?.email || String(form.get("email")));
    notice.textContent = "Checking administrator access…";
    await loadDashboard();
  } catch (error) { notice.textContent = error instanceof Error ? error.message : "Sign in failed."; }
  finally { button.disabled = false; }
});
el("#refresh-button").addEventListener("click", loadDashboard);
el("#export-button").addEventListener("click", async () => {
  const type = section === "applications" ? "applications" : "registrations";
  try {
    const csv = await api(`/api/admin/export?type=${type}`, { csv: true });
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `vulcan-${type}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`Downloaded ${type} export.`, "success");
  } catch (error) { setNotice(error instanceof Error ? error.message : "Could not export records.", "error"); }
});
const fullAdminLink = el("#full-admin-link");
if (fullAdminLink && config.clientFrontendUrl) fullAdminLink.href = config.clientFrontendUrl.replace(/\/$/, "");
el("#connection-dot").classList.add("checking");
fetch(`${apiBaseUrl}/api/health`).then((response) => response.json()).then((health) => {
  el("#connection-dot").classList.toggle("connected", health.status === "ok");
  el("#connection-label").textContent = health.status === "ok" ? "Backend connected" : "Backend unavailable";
}).catch(() => { el("#connection-dot").classList.add("error"); el("#connection-label").textContent = "Backend unavailable"; });
renderNavigation();
if (accessToken) loadDashboard(); else showSignedOut();
