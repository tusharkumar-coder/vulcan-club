import { demoEvents, demoProjects, demoResources, demoTeam } from "@/lib/demo-data";
import { createPublicClient, hasPublicSupabaseConfig } from "@/lib/supabase";
import type {
  DataResult,
  DomainRecord,
  EventRecord,
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

export const getEvents = () =>
  readPublished<EventRecord>("events", demoEvents, (client) =>
    client
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("starts_at", { ascending: true }),
  );
export const getProjects = () =>
  readPublished<ProjectRecord>("projects", demoProjects, (client) =>
    client
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  );
export const getResources = () =>
  readPublished<ResourceRecord>("resources", demoResources, (client) =>
    client
      .from("resources")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  );
export const getTeam = () =>
  readPublished<TeamMember>("team_members", demoTeam, (client) =>
    client
      .from("team_members")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
  );
export const getDomains = () =>
  readPublished<DomainRecord>("domains", [], (client) =>
    client
      .from("domains")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  );

export async function getEvent(slug: string) {
  const result = await getEvents();
  return result.records.find((event) => event.slug === slug) ?? null;
}

export async function getProject(slug: string) {
  const result = await getProjects();
  return result.records.find((project) => project.slug === slug) ?? null;
}
