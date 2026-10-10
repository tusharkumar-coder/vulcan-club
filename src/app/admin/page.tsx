import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { AdminLogin } from "@/components/admin-login";
import { AdminConsole } from "@/components/admin-console";
import { getAdminState } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const state = await getAdminState();
  if (state.status === "setup")
    return (
      <>
        <PageHero
          eyebrow="Organizer tools / Setup"
          title="Admin tools are not configured."
          description="Connect Supabase and create an authorized administrator before managing club content."
        />
        <section className="section">
          <div className="shell">
            <div className="data-note">
              <span className="tag tag-orange">Setup required</span>
              <span>
                Copy <code>.env.example</code> to <code>.env.local</code>, configure the public
                Supabase URL, anon key, and server-only service role key, then apply the SQL
                migration. See the README for first-admin steps.
              </span>
            </div>
          </div>
        </section>
      </>
    );
  if (state.status === "signed-out")
    return (
      <>
        <PageHero
          eyebrow="Organizer tools / Sign in"
          title="The club, behind the scenes."
          description="Authorized organizers can manage public content and review private submissions here."
        />
        <section className="section">
          <div className="shell" style={{ maxWidth: 560 }}>
            <div className="admin-panel">
              <AdminLogin />
            </div>
          </div>
        </section>
      </>
    );
  if (state.status === "forbidden")
    return (
      <>
        <PageHero
          eyebrow="Organizer tools / Access denied"
          title="This account isn’t an administrator."
          description="The account is signed in but has no matching row in the server-verified admin_users table."
        />
        <section className="section">
          <div className="shell">
            <div className="data-note">
              <span className="tag tag-orange">Not authorized</span>
              <span>
                Ask an existing project administrator to add this authenticated user ID to{" "}
                <code>admin_users</code>. This page is not used as authorization proof.
              </span>
            </div>
          </div>
        </section>
      </>
    );
  const client = createAdminClient();
  const [
    events,
    projects,
    domains,
    resources,
    team,
    leaderboardEntries,
    applications,
    messages,
    registrations,
    applicationCount,
    pendingCount,
    eventCount,
    projectCount,
    messageCount,
  ] = await Promise.all([
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
    client
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("event_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    client.from("membership_applications").select("id", { count: "exact", head: true }),
    client
      .from("membership_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    client.from("events").select("id", { count: "exact", head: true }).eq("status", "published"),
    client.from("projects").select("id", { count: "exact", head: true }).eq("status", "published"),
    client
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "unread"),
  ]);
  const dataErrors = [
    events,
    projects,
    domains,
    resources,
    team,
    leaderboardEntries,
    applications,
    messages,
    registrations,
    applicationCount,
    pendingCount,
    eventCount,
    projectCount,
    messageCount,
  ].filter((result) => result.error);
  return (
    <>
      <PageHero
        eyebrow="Organizer tools / Admin"
        title="Keep the community moving."
        description="Manage events, projects, domains, learning resources, team visibility, applications, and messages."
      />
      <section className="section">
        <div className="shell">
          {dataErrors.length > 0 && (
            <div className="form-status error" role="alert">
              Some admin data could not be loaded:{" "}
              {dataErrors
                .map((result) => result.error?.message)
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
          <AdminConsole
            email={state.email}
            data={{
              events: events.data ?? [],
              projects: projects.data ?? [],
              domains: domains.data ?? [],
              resources: resources.data ?? [],
              team: team.data ?? [],
              leaderboardEntries: leaderboardEntries.data ?? [],
              applications: applications.data ?? [],
              messages: messages.data ?? [],
              registrations: registrations.data ?? [],
              stats: {
                applications: applicationCount.count ?? 0,
                pending: pendingCount.count ?? 0,
                events: eventCount.count ?? 0,
                projects: projectCount.count ?? 0,
                unread: messageCount.count ?? 0,
              },
            }}
          />
        </div>
      </section>
    </>
  );
}
