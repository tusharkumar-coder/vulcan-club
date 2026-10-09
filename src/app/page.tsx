import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Code2,
  Cpu,
  GitBranch,
  Layers3,
  Terminal,
  Trophy,
} from "lucide-react";
import { ForgeExperience } from "@/components/forge-experience";
import { DataNote } from "@/components/data-note";
import { CommunityStats } from "@/components/community-stats";
import { getDomains, getEvents, getProjects, getTeam } from "@/lib/data";
import { domains } from "@/lib/domains";
import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "Build what’s next",
  description:
    "A developer community at Mirai School of Technology for problem solvers, builders, and open-source enthusiasts.",
  ...canonicalMetadata("/"),
};

const loopItems: { mark: string; Icon: typeof Trophy; text: string }[] = [
  {
    mark: "A / Solve",
    Icon: Trophy,
    text: "Train your thinking with problems that reward patience and clarity.",
  },
  {
    mark: "B / Ship",
    Icon: Code2,
    text: "Move from a rough sketch to something another person can use.",
  },
  {
    mark: "C / Share",
    Icon: GitBranch,
    text: "Make knowledge easier to find, reuse, and improve together.",
  },
];

export default async function HomePage() {
  const [events, projects, team, domainRecords] = await Promise.all([
    getEvents(),
    getProjects(),
    getTeam(),
    getDomains(),
  ]);
  const count = <T,>(result: { source: string; records: T[] }) =>
    result.source === "supabase" || result.source === "demo" ? result.records.length : "—";
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <ForgeExperience />
        <div className="shell">
          <div className="hero-content">
            <div className="eyebrow mono">
              Mirai School of Technology <span style={{ color: "#637085" }}>/</span> Developer
              community
            </div>
            <h1 className="hero-title">
              WE DON’T JUST CODE.
              <br />
              <span className="accent">WE FORGE</span>
              <br />
              WHAT’S NEXT.
            </h1>
            <p className="hero-copy">
              A community of problem solvers, builders, and open-source enthusiasts pushing the
              boundaries of technology at Mirai School of Technology.
            </p>
            <div className="hero-actions">
              <a href="#community" className="button">
                Explore Vulcan <ArrowRight size={14} />
              </a>
              <Link href="/join" className="text-link">
                Join the club <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="system-status mono">
              <span className="status-dot" /> System online{" "}
              <span style={{ color: "#586679" }}>·</span> Ready to build
            </div>
          </div>
        </div>
        <div className="shell hero-scroll">Scroll to explore</div>
      </section>

      <section className="section" id="community">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">01 / A place to make</div>
            <h2 className="section-heading">
              Curiosity is the starting point. Building is the practice.
            </h2>
            <p className="section-copy">
              Vulcan is a student-led developer community for learning by doing. We bring different
              interests together around a shared instinct: make something, understand how it works,
              and help the next person build further.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link href="/about" className="text-link">
                How we work <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div
            className="split-visual"
            aria-label="Abstract geometric illustration of intersecting engineering forms"
          >
            <div className="visual-label mono">
              <span>VULCAN / FIELD NOTES</span>
              <span>FIG. 001</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm section-line">
        <div className="shell">
          <div className="eyebrow mono">02 / Community signals</div>
          <h2 className="section-heading" style={{ fontSize: "clamp(2rem,3.4vw,3.2rem)" }}>
            Built by the people who show up.
          </h2>
          <p className="section-copy">
            Counts reflect visible team profiles and published directories. Private membership
            totals stay private; connect Supabase to show live records.
          </p>
          <CommunityStats
            items={[
              { value: count(team), label: "Visible team profiles" },
              { value: count(projects), label: "Published projects" },
              { value: count(events), label: "Published events" },
              { value: count(domainRecords), label: "Published domains" },
            ]}
          />
        </div>
      </section>

      <section className="section section-line">
        <div className="shell">
          <div className="card-row">
            <div>
              <div className="eyebrow mono">03 / What we do</div>
              <h2 className="section-heading">A community with room for every kind of builder.</h2>
              <p className="section-copy">
                Pick a thread that interests you. Follow it until you find a good problem, a
                generous collaborator, or a tool worth making.
              </p>
            </div>
            <Link href="/domains" className="text-link" style={{ marginTop: 22 }}>
              Explore all domains <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-grid">
            {domains.slice(0, 6).map((domain) => {
              const Icon = domain.icon;
              return (
                <Link className="card" href={domain.route} key={domain.number}>
                  <span className="card-index">{domain.number} / 07</span>
                  <span className="card-arrow">
                    <Icon size={17} />
                  </span>
                  <h3>{domain.title}</h3>
                  <p>
                    {domain.short} {domain.description}
                  </p>
                  <div className="card-meta">
                    {domain.tools.slice(0, 2).map((tool) => (
                      <span className="tag" key={tool}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-line">
        <div className="shell">
          <div className="card-row">
            <div>
              <div className="eyebrow mono">04 / Next on the calendar</div>
              <h2 className="section-heading">Make time to build together.</h2>
            </div>
            <Link href="/events" className="text-link" style={{ marginTop: 22 }}>
              All events <ArrowRight size={14} />
            </Link>
          </div>
          <DataNote result={events} />
          {events.records.length ? (
            <div className="card-grid">
              {events.records.slice(0, 3).map((event) => (
                <Link className="card" href={`/events/${event.slug}`} key={event.id}>
                  <div className="event-date">
                    {new Date(event.starts_at).toLocaleDateString("en", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="card-meta">
                    <span className="tag tag-orange">{event.category}</span>
                    {event.venue && <span className="tag">{event.venue}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Nothing scheduled just yet.</strong>New workshops, study groups, and build
              sessions will appear here when published.
            </div>
          )}
        </div>
      </section>

      <section className="section section-line">
        <div className="shell">
          <div className="card-row">
            <div>
              <div className="eyebrow mono">05 / Work in progress</div>
              <h2 className="section-heading">Software built by the community.</h2>
              <p className="section-copy">
                A growing shelf of experiments, useful tools, and ideas turned into code.
              </p>
            </div>
            <Link href="/projects" className="text-link" style={{ marginTop: 22 }}>
              Browse projects <ArrowRight size={14} />
            </Link>
          </div>
          <DataNote result={projects} />
          {projects.records.length ? (
            <div className="card-grid">
              {projects.records.slice(0, 3).map((project) => (
                <Link
                  className="card project-card"
                  href={`/projects/${project.slug}`}
                  key={project.id}
                >
                  {project.cover_image_url && (
                    <Image
                      src={project.cover_image_url}
                      alt=""
                      width={600}
                      height={300}
                      unoptimized
                      className="project-cover-image"
                    />
                  )}
                  <span className="tag">{project.domain || "Community project"}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="card-meta">
                    {project.technologies.slice(0, 3).map((technology) => (
                      <span className="tag" key={technology}>
                        {technology}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Projects will show up here.</strong>Published work will link to its real
              repository or demo when those details are available.
            </div>
          )}
        </div>
      </section>

      <section className="section section-line">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">06 / The loop</div>
            <h2 className="section-heading">Practice. Collaborate. Contribute. Repeat.</h2>
            <p className="section-copy">
              Solve a problem with a friend. Review a pull request. Sit down for an unfamiliar
              workshop. Share what you learned. The best progress rarely happens alone.
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 22, flexWrap: "wrap" }}>
              <Link href="/competitive-programming" className="text-link">
                Find your next problem <ArrowRight size={14} />
              </Link>
              <Link href="/resources" className="text-link">
                Open the resource shelf <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div
            style={{
              borderLeft: "1px solid var(--line)",
              paddingLeft: 26,
              display: "grid",
              gap: 25,
            }}
          >
            {loopItems.map(({ mark, Icon, text }) => (
              <div key={mark} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 16 }}>
                <span className="tag tag-orange">{mark}</span>
                <div>
                  <Icon size={17} color="var(--cyan)" />
                  <p className="muted" style={{ fontSize: 13, margin: "5px 0 0" }}>
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-line">
        <div className="shell">
          <div className="card-row">
            <div>
              <div className="eyebrow mono">07 / The people behind the work</div>
              <h2 className="section-heading">Learn with people who build alongside you.</h2>
              <p className="section-copy">
                Organizers, mentors, and contributors make the club a place to ask questions and
                keep moving.
              </p>
            </div>
            <Link href="/team" className="text-link" style={{ marginTop: 22 }}>
              Meet the team <ArrowRight size={14} />
            </Link>
          </div>
          <DataNote result={team} />
          {team.records.length ? (
            <div className="card-grid">
              {team.records.slice(0, 3).map((member) => (
                <article className="card" key={member.id}>
                  {member.image_url && (
                    <Image
                      src={member.image_url}
                      alt={`${member.name} profile`}
                      width={72}
                      height={72}
                      unoptimized
                      className="member-avatar"
                    />
                  )}
                  <span className="card-index">VULCAN / PEOPLE</span>
                  <h3>{member.name}</h3>
                  <span className="tag tag-orange">{member.role}</span>
                  {member.bio && <p style={{ marginTop: 18 }}>{member.bio}</p>}
                  <div className="card-meta">
                    {member.interests.slice(0, 3).map((interest) => (
                      <span className="tag" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Team profiles will appear here.</strong>Organizers can publish verified
              introductions from the team page.
            </div>
          )}
        </div>
      </section>

      <section className="section section-line">
        <div
          className="shell"
          style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 30, alignItems: "end" }}
        >
          <div>
            <div className="eyebrow mono">08 / Start where you are</div>
            <h2 className="section-heading" style={{ marginBottom: 10 }}>
              Bring your questions.
              <br />
              Leave with something built.
            </h2>
            <p className="section-copy">
              New to code or deep into a side project—there’s a place to begin.
            </p>
          </div>
          <Link href="/join" className="button">
            Join Vulcan <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
