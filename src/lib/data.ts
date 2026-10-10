import { cache } from "react";
import { demoEvents, demoProjects, demoResources, demoTeam } from "@/lib/demo-data";
import { createPublicClient, hasPublicSupabaseConfig } from "@/lib/supabase";
import type {
  DataResult,
  DomainRecord,
  EventRecord,
  LeaderboardEntry,
  ProjectRecord,
  ResourceRecord,
  TeamMember,
} from "@/lib/types";

const demoEnabled = () =>
  process.env.NODE_ENV !== "production" && process.env.USE_DEMO_DATA === "true";

async function readPublished<T>(
  table: string,
  demoRecords: T[],
  query: (
    client: ReturnType<typeof createPublicClient>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<DataResult<T>> {
  if (!hasPublicSupabaseConfig())
    return demoEnabled()
      ? {
          records: demoRecords,
          source: "demo",
          message: "Preview content · fictional examples for local development",
        }
      : { records: [], source: "empty", message: "Connect Supabase to publish live club content." };
  try {
    const { data, error } = await query(createPublicClient());
    if (error)
      return { records: [], source: "error", message: `Could not load ${table}: ${error.message}` };
    return { records: (data ?? []) as T[], source: "supabase" };
  } catch (error) {
    return {
      records: [],
      source: "error",
      message: error instanceof Error ? error.message : `Could not load ${table}.`,
    };
  }
}

export const getEvents = cache(() =>
  readPublished<EventRecord>("events", demoEvents, (client) =>
    client
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("starts_at", { ascending: true }),
  ),
);

export const getProjects = cache(() =>
  readPublished<ProjectRecord>("projects", demoProjects, (client) =>
    client
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ),
);

export const getResources = cache(() =>
  readPublished<ResourceRecord>("resources", demoResources, (client) =>
    client
      .from("resources")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ),
);

export const getTeam = cache(() =>
  readPublished<TeamMember>("team_members", demoTeam, (client) =>
    client
      .from("team_members")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
  ),
);

export const getDomains = cache(() =>
  readPublished<DomainRecord>("domains", [], (client) =>
    client
      .from("domains")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ),
);

export const getLeaderboardEntries = cache(() =>
  readPublished<LeaderboardEntry>("leaderboard entries", [], (client) =>
    client
      .from("leaderboard_entries")
      .select("id, contest_name, contest_date, student_name, academic_year, points, status")
      .eq("status", "published")
      .order("contest_date", { ascending: false })
      .order("points", { ascending: false }),
  ),
);

export const getEvent = cache(async (slug: string): Promise<EventRecord | null> => {
  if (!hasPublicSupabaseConfig()) {
    return demoEnabled() ? (demoEvents.find((event) => event.slug === slug) ?? null) : null;
  }
  try {
    const { data, error } = await createPublicClient()
      .from("events")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as EventRecord;
  } catch {
    return null;
  }
});

export const getProject = cache(async (slug: string): Promise<ProjectRecord | null> => {
  if (!hasPublicSupabaseConfig()) {
    return demoEnabled() ? (demoProjects.find((project) => project.slug === slug) ?? null) : null;
  }
  try {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as ProjectRecord;
  } catch {
    return null;
  }
});

export const getTeamMember = cache(async (slug: string): Promise<TeamMember | null> => {
  if (!hasPublicSupabaseConfig()) {
    return demoEnabled() ? (demoTeam.find((member) => member.slug === slug) ?? null) : null;
  }
  try {
    const { data, error } = await createPublicClient()
      .from("team_members")
      .select("*")
      .eq("is_visible", true)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as TeamMember;
  } catch {
    return null;
  }
});
