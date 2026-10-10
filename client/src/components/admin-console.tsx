"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LeaderboardManager } from "@/components/admin-leaderboard-manager";
import { apiUrl } from "@/lib/api-url";
import { getApiAuthHeaders } from "@/lib/api-auth";
import type {
  DomainRecord,
  EventRecord,
  LeaderboardEntry,
  ProjectRecord,
  ResourceRecord,
  TeamMember,
} from "@/lib/types";

type AdminData = {
  events: EventRecord[];
  domains: DomainRecord[];
  projects: ProjectRecord[];
  resources: ResourceRecord[];
  team: TeamMember[];
  leaderboardEntries: LeaderboardEntry[];
  applications: Record<string, unknown>[];
  messages: Record<string, unknown>[];
  registrations: Record<string, unknown>[];
  stats: Record<string, number>;
};
type ContentType =
  "events" | "projects" | "resources" | "team_members" | "domains" | "leaderboard_entries";
type ManagedContentSection = "events" | "projects" | "resources" | "team" | "domains";
const sections = [
  "overview",
  "events",
  "leaderboard",
  "projects",
  "domains",
  "resources",
  "team",
  "applications",
  "messages",
  "registrations",
] as const;
type Section = (typeof sections)[number];
type StatusType = ContentType | "membership_applications" | "contact_messages";

export function AdminConsole({ data, email }: { data: AdminData; email?: string }) {
  const [section, setSection] = useState<Section>("overview");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();

  async function request(path: string, method: string, body?: unknown) {
    const response = await fetch(apiUrl(path), {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(await getApiAuthHeaders()) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = (await response.json()) as {
      error?: string;
      details?: {
        fieldErrors?: Record<string, string[] | undefined>;
        formErrors?: string[];
      };
    };
    if (!response.ok) {
      const fieldErrors = Object.entries(result.details?.fieldErrors ?? {}).flatMap(
        ([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`),
      );
      const details = [...fieldErrors, ...(result.details?.formErrors ?? [])].join(" ");
      throw new Error([result.error || "Action failed.", details].filter(Boolean).join(" "));
    }
    return result;
  }

  async function signOut() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) await createBrowserClient(url, key).auth.signOut();
    router.refresh();
  }

  async function deleteRecord(type: ContentType, id: string) {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setBusy(true);
    try {
      await request("/api/admin/records", "DELETE", { type, id });
      setNotice("Record deleted.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not delete record.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(type: StatusType, id: string, record: Record<string, unknown>) {
    setBusy(true);
    try {
      await request("/api/admin/records", "PATCH", { type, id, record });
      setNotice("Changes saved.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRecord(type: ContentType, form: FormData, id?: string): Promise<boolean> {
    let roadmap: unknown[] = [];
    if (type === "domains") {
      try {
        const parsed: unknown = JSON.parse(String(form.get("roadmap_json") || "[]"));
        if (!Array.isArray(parsed)) throw new Error("Roadmap must be a JSON array.");
        roadmap = parsed;
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Roadmap must be valid JSON.");
        return false;
      }
    }
    setBusy(true);
    setNotice("");
    const raw = Object.fromEntries(form.entries());
    const record = {
      ...raw,
      status: String(raw.status || "draft"),
      technologies: csv(raw.technologies),
      contributors: csv(raw.contributors),
      tags: csv(raw.tags),
      interests: csv(raw.interests),
      skills: csv(raw.skills),
      is_visible: raw.is_visible === "on",
      is_published: raw.is_published === "on",
      sort_order: Number(raw.sort_order || 0),
      roadmap,
      registration_deadline: raw.registration_deadline
        ? new Date(String(raw.registration_deadline)).toISOString()
        : null,
    };
    try {
      await request(
        "/api/admin/records",
        id ? "PATCH" : "POST",
        id ? { type, id, record } : { type, record },
      );
      setNotice(id ? "Record updated." : "Record created.");
      router.refresh();
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save record.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveLeaderboard(form: FormData, id?: string): Promise<boolean> {
    const raw = Object.fromEntries(form.entries());
    const record = {
      contest_name: String(raw.contest_name ?? "").trim(),
      contest_date: String(raw.contest_date ?? ""),
      student_name: String(raw.student_name ?? "").trim(),
      academic_year: String(raw.academic_year ?? ""),
      points: Number(raw.points),
      status: String(raw.status ?? "draft"),
    };
    setBusy(true);
    setNotice("");
    try {
      await request(
        "/api/admin/records",
        id ? "PATCH" : "POST",
        id ? { type: "leaderboard_entries", id, record } : { type: "leaderboard_entries", record },
      );
      setNotice(id ? "Leaderboard result updated." : "Leaderboard result added.");
      router.refresh();
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save leaderboard result.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const label =
    section === "leaderboard"
      ? "Leaderboards & Results"
      : section[0].toUpperCase() + section.slice(1);
  return (
    <div className="admin-layout">
      <aside className="admin-side">
        <div className="micro">Signed in as</div>
        <div style={{ fontSize: 12, marginTop: 5, overflowWrap: "anywhere" }}>{email}</div>
        <nav className="admin-tabs" aria-label="Admin sections">
          {sections.map((tab) => (
            <button
              key={tab}
              type="button"
              aria-current={section === tab ? "page" : undefined}
              onClick={() => setSection(tab)}
            >
              {tab === "leaderboard"
                ? "Leaderboards & Results"
                : tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <button
          className="text-link"
          onClick={signOut}
          style={{ marginTop: 25, background: "none", border: 0, cursor: "pointer" }}
        >
          Sign out
        </button>
      </aside>
      <div>
        <div className="card-row" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow mono">Vulcan / Admin</div>
            <h2
              style={{
                fontFamily: "Space Grotesk",
                fontWeight: 500,
                fontSize: 32,
                margin: "8px 0 22px",
              }}
            >
              {label}
            </h2>
          </div>
          <span className="tag tag-orange">Authenticated admin</span>
        </div>
        {notice && (
          <div className="form-status" role="status">
            {notice}
          </div>
        )}
        {section === "overview" && (
          <>
            <div className="admin-metrics">
              {[
                ["Applications", data.stats.applications],
                ["Pending", data.stats.pending],
                ["Published events", data.stats.events],
                ["Published projects", data.stats.projects],
                ["Unread messages", data.stats.unread],
              ].map(([name, value]) => (
                <div className="admin-metric" key={name}>
                  <strong>{value}</strong>
                  <span>{name}</span>
                </div>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 20 }}>
              Counts are calculated from Supabase records. This dashboard does not use preview
              content.
            </p>
          </>
        )}
        {(["events", "projects", "domains", "resources", "team"] as string[]).includes(section) && (
          <ContentManager
            section={section as ManagedContentSection}
            data={data}
            busy={busy}
            onSave={saveRecord}
            onDelete={deleteRecord}
            onStatus={updateStatus}
          />
        )}
        {section === "applications" && (
          <ApplicationsTable rows={data.applications} busy={busy} onUpdate={updateStatus} />
        )}
        {section === "messages" && (
          <MessagesTable rows={data.messages} busy={busy} onUpdate={updateStatus} />
        )}
        {section === "registrations" && <RegistrationTable rows={data.registrations} />}
        {section === "leaderboard" && (
          <LeaderboardManager
            entries={data.leaderboardEntries}
            busy={busy}
            onSave={saveLeaderboard}
            onDelete={deleteRecord}
            onStatus={updateStatus}
          />
        )}
      </div>
    </div>
  );
}

function CsvExport({ type, label }: { type: "applications" | "registrations"; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/admin/export?type=${type}`), {
        headers: await getApiAuthHeaders(),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Could not export this CSV.");
      }
      const fileUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `vulcan-${type}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Could not export this CSV.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
      <button className="text-link" type="button" disabled={busy} onClick={download}>
        {busy ? "Preparing CSV…" : `${label} ↓`}
      </button>
      {error && <span className="field-error">{error}</span>}
    </span>
  );
}

function csv(value: FormDataEntryValue | undefined) {
  return typeof value === "string"
    ? value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}
function localDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function ContentManager({
  section,
  data,
  busy,
  onSave,
  onDelete,
  onStatus,
}: {
  section: ManagedContentSection;
  data: AdminData;
  busy: boolean;
  onSave: (type: ContentType, form: FormData, id?: string) => Promise<boolean>;
  onDelete: (type: ContentType, id: string) => void;
  onStatus: (type: StatusType, id: string, record: Record<string, unknown>) => void;
}) {
  const [editing, setEditing] = useState<
    DomainRecord | EventRecord | ProjectRecord | ResourceRecord | TeamMember | null
  >(null);
  const [assetUrl, setAssetUrl] = useState("");
  const [assetMessage, setAssetMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const records =
    section === "events"
      ? data.events
      : section === "projects"
        ? data.projects
        : section === "domains"
          ? data.domains
          : section === "resources"
            ? data.resources
            : data.team;
  const rows = records as (
    DomainRecord | EventRecord | ProjectRecord | ResourceRecord | TeamMember
  )[];
  const title =
    section === "team"
      ? "team member"
      : section === "domains"
        ? "domain"
        : section.slice(0, -1);
  const recordType: ContentType = section === "team" ? "team_members" : section;
  const currentTitle = editing ? ("title" in editing ? editing.title : editing.name) : "";
  const currentDescription = editing
    ? "description" in editing
      ? editing.description
      : (editing.bio ?? "")
    : "";
  const currentCategory =
    editing && "category" in editing
      ? editing.category
      : editing && "domain" in editing
        ? (editing.domain ?? "")
        : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await onSave(recordType, new FormData(form), editing?.id)) {
      form.reset();
      setEditing(null);
      setAssetUrl("");
      setAssetMessage("");
    }
  }

  async function uploadAsset(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (
      !/[.](jpeg|jpg|png|webp|avif)$/i.test(file.name) ||
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
    ) {
      setAssetMessage("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAssetMessage("Images must be 5 MB or smaller.");
      return;
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setAssetMessage("Configure Supabase before uploading images.");
      return;
    }
    setUploading(true);
    setAssetMessage("Uploading image…");
    try {
      const safeName = file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .slice(0, 80);
      const path = `${section === "team" ? "team" : section}/${crypto.randomUUID()}-${safeName}`;
      const storage = createBrowserClient(url, key).storage.from("club-assets");
      const { error } = await storage.upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw new Error(error.message);
      setAssetUrl(storage.getPublicUrl(path).data.publicUrl);
      setAssetMessage("Image uploaded. Save the record to publish this URL.");
    } catch (error) {
      setAssetMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div>
      <div className="admin-panel" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 20, marginTop: 0 }}>
          {editing ? `Edit ${title}` : `Add ${title}`}
        </h3>
        {section === "team" && (
          <p className="field-hint admin-field-legend">
            Required fields must be filled in. Optional fields can be left blank.
          </p>
        )}
        <form
          key={editing?.id ?? "new-record"}
          id="record-form"
          onSubmit={submit}
          className="admin-form-grid"
        >
          <div className="field">
            <label htmlFor="record-title">
              Title / name
              {section === "team" && <span className="field-label-state required">Required</span>}
            </label>
            <input
              id="record-title"
              name={section === "team" || section === "domains" ? "name" : "title"}
              defaultValue={currentTitle}
              required
              maxLength={160}
            />
          </div>
          <div className="field">
            <label htmlFor="record-slug">
              Slug
              {section === "team" && <span className="field-label-state required">Required</span>}
            </label>
            <input
              id="record-slug"
              name="slug"
              defaultValue={editing?.slug ?? ""}
              placeholder={section === "team" ? "e.g. jane-doe" : "lowercase-words-with-hyphens"}
              required
              maxLength={180}
            />
            <span className="field-hint">
              Use lowercase letters and numbers separated by hyphens, for example: jane-doe.
            </span>
          </div>
          {section !== "team" && section !== "domains" && (
            <div className="field">
              <label htmlFor="record-domain">Category / domain</label>
              <input
                id="record-domain"
                name={section === "events" || section === "resources" ? "category" : "domain"}
                defaultValue={currentCategory}
              />
            </div>
          )}
          {section === "team" && (
            <div className="field">
              <label htmlFor="record-role">
                Role <span className="field-label-state required">Required</span>
              </label>
              <input
                id="record-role"
                name="role"
                defaultValue={editing && "role" in editing ? editing.role : ""}
                required
              />
            </div>
          )}
          {section === "events" && (
            <>
              <div className="field">
                <label htmlFor="record-start">Starts at</label>
                <input
                  id="record-start"
                  name="starts_at"
                  type="datetime-local"
                  defaultValue={
                    editing && "starts_at" in editing ? localDateTime(editing.starts_at) : ""
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="record-venue">Venue</label>
                <input
                  id="record-venue"
                  name="venue"
                  defaultValue={editing && "venue" in editing ? (editing.venue ?? "") : ""}
                />
              </div>
              <div className="field">
                <label htmlFor="record-deadline">Registration deadline</label>
                <input
                  id="record-deadline"
                  name="registration_deadline"
                  type="datetime-local"
                  defaultValue={
                    editing && "registration_deadline" in editing
                      ? localDateTime(editing.registration_deadline)
                      : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-registration-url">Registration URL (optional)</label>
                <input
                  id="record-registration-url"
                  name="registration_url"
                  type="url"
                  defaultValue={
                    editing && "registration_url" in editing ? (editing.registration_url ?? "") : ""
                  }
                />
              </div>
            </>
          )}
          {section === "projects" && (
            <>
              <div className="field">
                <label htmlFor="record-technologies">Technologies (comma separated)</label>
                <input
                  id="record-technologies"
                  name="technologies"
                  defaultValue={
                    editing && "technologies" in editing ? editing.technologies.join(", ") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-contributors">Contributors (comma separated)</label>
                <input
                  id="record-contributors"
                  name="contributors"
                  defaultValue={
                    editing && "contributors" in editing ? editing.contributors.join(", ") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-repo">Repository URL</label>
                <input
                  id="record-repo"
                  name="repository_url"
                  type="url"
                  defaultValue={
                    editing && "repository_url" in editing ? (editing.repository_url ?? "") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-demo">Demo URL</label>
                <input
                  id="record-demo"
                  name="demo_url"
                  type="url"
                  defaultValue={editing && "demo_url" in editing ? (editing.demo_url ?? "") : ""}
                />
              </div>
            </>
          )}
          {section === "resources" && (
            <>
              <div className="field">
                <label htmlFor="record-url">Resource URL</label>
                <input
                  id="record-url"
                  name="url"
                  type="url"
                  defaultValue={editing && "url" in editing ? editing.url : ""}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="record-tags">Tags (comma separated)</label>
                <input
                  id="record-tags"
                  name="tags"
                  defaultValue={editing && "tags" in editing ? editing.tags.join(", ") : ""}
                />
              </div>
            </>
          )}
          {section === "domains" && (
            <>
              <div className="field">
                <label htmlFor="record-technologies">Technologies (comma separated)</label>
                <input
                  id="record-technologies"
                  name="technologies"
                  defaultValue={
                    editing && "technologies" in editing ? editing.technologies.join(", ") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-sort">Sort order</label>
                <input
                  id="record-sort"
                  name="sort_order"
                  type="number"
                  defaultValue={
                    editing && "sort_order" in editing ? String(editing.sort_order) : "0"
                  }
                />
              </div>
              <div className="field full">
                <label htmlFor="record-roadmap">Roadmap JSON</label>
                <textarea
                  id="record-roadmap"
                  name="roadmap_json"
                  rows={5}
                  defaultValue={
                    editing && "roadmap" in editing
                      ? JSON.stringify(editing.roadmap, null, 2)
                      : "[]"
                  }
                />
                <span className="field-hint">
                  Example: [{`{"step":"Foundations","topics":["Basics","Practice"]}`}]
                </span>
              </div>
              <label className="check-line">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={
                    editing &&
                    "is_published" in editing &&
                    typeof editing.is_published === "boolean"
                      ? editing.is_published
                      : true
                  }
                />
                Published in the public directory
              </label>
            </>
          )}
          {section !== "resources" && section !== "domains" && (
            <div className="field full">
              <label htmlFor="asset-file">
                Cover / profile image
                {section === "team" && <span className="field-label-state">Optional</span>}
              </label>
              <input
                id="asset-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={uploadAsset}
              />
              <span className="field-hint">JPG, PNG, WebP, or AVIF · maximum 5 MB</span>
              {assetMessage && (
                <span className="field-hint" role="status">
                  {assetMessage}
                </span>
              )}
              <input
                aria-label="Public image URL"
                name={section === "team" ? "image_url" : "cover_image_url"}
                type="url"
                placeholder="Or paste a public image URL"
                value={assetUrl}
                onChange={(event) => setAssetUrl(event.target.value)}
              />
            </div>
          )}
          {section === "team" && (
            <>
              <div className="field">
                <label htmlFor="record-skills">
                  Skills (comma separated) <span className="field-label-state">Optional</span>
                </label>
                <input
                  id="record-skills"
                  name="skills"
                  defaultValue={
                    editing && "skills" in editing ? (editing.skills ?? []).join(", ") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-interests">
                  Interests (comma separated) <span className="field-label-state">Optional</span>
                </label>
                <input
                  id="record-interests"
                  name="interests"
                  defaultValue={
                    editing && "interests" in editing ? editing.interests.join(", ") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-github">
                  GitHub URL <span className="field-label-state">Optional</span>
                </label>
                <input
                  id="record-github"
                  name="github_url"
                  type="url"
                  defaultValue={
                    editing && "github_url" in editing ? (editing.github_url ?? "") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-linkedin">
                  LinkedIn URL <span className="field-label-state">Optional</span>
                </label>
                <input
                  id="record-linkedin"
                  name="linkedin_url"
                  type="url"
                  defaultValue={
                    editing && "linkedin_url" in editing ? (editing.linkedin_url ?? "") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-instagram">
                  Instagram URL <span className="field-label-state">Optional</span>
                </label>
                <input
                  id="record-instagram"
                  name="instagram_url"
                  type="url"
                  defaultValue={
                    editing && "instagram_url" in editing ? (editing.instagram_url ?? "") : ""
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="record-sort">
                  Sort order <span className="field-label-state">Optional</span>
                </label>
                <input
                  id="record-sort"
                  name="sort_order"
                  type="number"
                  defaultValue={
                    editing && "sort_order" in editing ? String(editing.sort_order) : "0"
                  }
                />
              </div>
              <label className="check-line">
                <input
                  type="checkbox"
                  name="is_visible"
                  defaultChecked={
                    editing && "is_visible" in editing && typeof editing.is_visible === "boolean"
                      ? editing.is_visible
                      : true
                  }
                />
                Visible on public team page <span className="field-label-state">Optional</span>
              </label>
            </>
          )}
          {section !== "team" && section !== "domains" && (
            <div className="field">
              <label htmlFor="record-status">Status</label>
              <select
                id="record-status"
                name="status"
                defaultValue={editing && "status" in editing ? editing.status : "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
          <div className="field full">
            <label htmlFor="record-description">
              Description / bio
              {section === "team" && <span className="field-label-state">Optional</span>}
            </label>
            <textarea
              id="record-description"
              name={section === "team" ? "bio" : "description"}
              defaultValue={currentDescription}
              required={section !== "team"}
              rows={3}
            />
          </div>
          <div
            className="field full"
            style={{ display: "flex", flexDirection: "row", gap: 12, flexWrap: "wrap" }}
          >
            <button className="button" disabled={busy || uploading}>
              {uploading
                ? "Uploading…"
                : busy
                  ? "Saving…"
                  : editing
                    ? `Update ${title}`
                    : `Save ${title}`}
            </button>
            {editing && (
              <button
                className="button button-secondary"
                type="button"
                disabled={uploading}
                onClick={() => {
                  setEditing(null);
                  setAssetUrl("");
                  setAssetMessage("");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="admin-panel">
        <div className="card-row">
          <h3 style={{ fontFamily: "Space Grotesk", fontSize: 19, margin: 0 }}>
            Published and draft records
          </h3>
          {section === "events" && (
            <CsvExport type="registrations" label="Export registrations" />
          )}
        </div>
        {rows.length ? (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const rowTitle = "title" in item ? item.title : item.name;
                  const status =
                    section === "team"
                      ? "is_visible" in item && item.is_visible
                        ? "visible"
                        : "hidden"
                      : section === "domains"
                        ? "is_published" in item && item.is_published
                          ? "published"
                          : "hidden"
                        : "status" in item
                          ? item.status
                          : "draft";
                  const statusPatch =
                    section === "team"
                      ? { is_visible: status !== "visible" }
                      : section === "domains"
                        ? { is_published: status !== "published" }
                        : { status: status === "published" ? "draft" : "published" };
                  return (
                    <tr key={item.id}>
                      <td>
                        {rowTitle}
                        <br />
                        <span className="muted">{item.slug}</span>
                      </td>
                      <td>
                        <span className="tag">{status}</span>
                      </td>
                      <td>
                        <button
                          className="admin-action"
                          disabled={busy}
                          onClick={() => {
                            setEditing(item);
                            setAssetUrl(
                              "cover_image_url" in item
                                ? (item.cover_image_url ?? "")
                                : "image_url" in item
                                  ? (item.image_url ?? "")
                                  : "",
                            );
                            setAssetMessage("");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-action"
                          disabled={busy}
                          onClick={() => onStatus(recordType, item.id, statusPatch)}
                        >
                          {status === "published" || status === "visible" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          className="admin-action danger"
                          disabled={busy}
                          onClick={() => onDelete(recordType, item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No records yet.</strong>Add a record above when verified content is ready to
            publish.
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationsTable({
  rows,
  busy,
  onUpdate,
}: {
  rows: Record<string, unknown>[];
  busy: boolean;
  onUpdate: (type: StatusType, id: string, record: Record<string, unknown>) => void;
}) {
  const [status, setStatus] = useState("all");
  const filteredRows = status === "all" ? rows : rows.filter((row) => row.status === status);
  return (
    <div className="admin-panel">
      <div className="card-row">
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 19, margin: 0 }}>
          Membership applications
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <label className="field" style={{ minWidth: 170 }}>
            <span className="trap">Filter applications by status</span>
            <select
              aria-label="Filter applications by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <CsvExport type="applications" label="Export CSV" />
        </div>
      </div>
      {filteredRows.length ? (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Interest</th>
                <th>Status / notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id}>
                    <td>
                      {String(row.full_name)}
                      <br />
                      <span className="muted">{String(row.email)}</span>
                    </td>
                    <td>
                      {Array.isArray(row.interests)
                        ? row.interests.join(", ")
                        : String(row.interests)}
                    </td>
                    <td>
                      <select
                        aria-label={`Status for ${String(row.full_name)}`}
                        defaultValue={String(row.status)}
                        id={`app-status-${id}`}
                      >
                        <option>pending</option>
                        <option>reviewed</option>
                        <option>accepted</option>
                        <option>rejected</option>
                      </select>
                      <input
                        id={`app-note-${id}`}
                        aria-label={`Internal note for ${String(row.full_name)}`}
                        placeholder="Internal note"
                        defaultValue={String(row.admin_notes ?? "")}
                        style={{ marginTop: 5, width: 160 }}
                      />
                    </td>
                    <td>
                      <button
                        className="admin-action"
                        disabled={busy}
                        onClick={() =>
                          onUpdate("membership_applications", id, {
                            status: (
                              document.getElementById(`app-status-${id}`) as HTMLSelectElement
                            ).value,
                            admin_notes: (
                              document.getElementById(`app-note-${id}`) as HTMLInputElement
                            ).value,
                          })
                        }
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <strong>
            {rows.length ? "No applications match this filter." : "No applications yet."}
          </strong>
          {rows.length
            ? "Choose another status to see more results."
            : "New membership interest forms will appear here."}
        </div>
      )}
    </div>
  );
}

function MessagesTable({
  rows,
  busy,
  onUpdate,
}: {
  rows: Record<string, unknown>[];
  busy: boolean;
  onUpdate: (type: StatusType, id: string, record: Record<string, unknown>) => void;
}) {
  return (
    <div className="admin-panel">
      <h3 style={{ fontFamily: "Space Grotesk", fontSize: 19, marginTop: 0 }}>Contact messages</h3>
      {rows.length ? (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id}>
                    <td>
                      {String(row.name)}
                      <br />
                      <span className="muted">{String(row.email)}</span>
                    </td>
                    <td>
                      {String(row.subject)}
                      <br />
                      <span className="muted">{String(row.message)}</span>
                    </td>
                    <td>
                      <span className="tag">{String(row.status)}</span>
                    </td>
                    <td>
                      <button
                        className="admin-action"
                        disabled={busy}
                        onClick={() =>
                          onUpdate("contact_messages", id, {
                            status: row.status === "unread" ? "read" : "resolved",
                          })
                        }
                      >
                        Mark {row.status === "unread" ? "read" : "resolved"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <strong>No messages.</strong>Contact form submissions will appear here.
        </div>
      )}
    </div>
  );
}

function RegistrationTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <div className="admin-panel">
      <div className="card-row">
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 19, margin: 0 }}>
          Event registrations
        </h3>
        <CsvExport type="registrations" label="Export CSV" />
      </div>
      {rows.length ? (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Event ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  <td>{String(row.name)}</td>
                  <td>{String(row.email)}</td>
                  <td>{String(row.event_id)}</td>
                  <td>{String(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <strong>No registrations yet.</strong>Internal registrations will appear here.
        </div>
      )}
    </div>
  );
}
