import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Cpu,
  Lightbulb,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import { CommunityStats } from "@/components/community-stats";
import { CodingPractice } from "@/components/coding-practice";
import { DataNote } from "@/components/data-note";
import { LiveCodeEditor } from "@/components/live-code-editor";
import { TechNewsFeed } from "@/components/tech-news-feed";
import { getEvents, getProjects, getResources, getTeam } from "@/lib/data";
import { domains } from "@/lib/domains";
import { canonicalMetadata } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "Vulcan Club — Build together",
  description:
    "Meet the developer community at Mirai School of Technology. Learn new skills, solve problems, and build useful things together.",
  ...canonicalMetadata("/"),
};

const initiatives = [
  {
    Icon: BookOpen,
    title: "Learn by doing",
    description: "Short workshops and guided learning paths for the tools you want to understand.",
    href: "/resources",
    link: "Explore learning resources",
  },
  {
    Icon: Code2,
    title: "Build with a team",
    description: "Turn a rough idea into a working project with people who enjoy making things.",
    href: "/projects",
    link: "Browse community projects",
  },
  {
    Icon: Cpu,
    title: "Try something challenging",
    description: "Practice algorithms, explore new technologies, and share what you discover.",
    href: "/competitive-programming",
    link: "Open practice corner",
  },
];

const quickLinks = [
  ["About the club", "/about", "Our mission, values, and ways to get involved."],
  ["Events", "/events", "Workshops, study groups, and build sessions."],
  ["Leaderboards & Results", "/leaderboards", "Follow contest standings and year-wise points."],
  ["Domains", "/domains", "Find a technical area you want to explore."],
  ["Projects", "/projects", "See what members are making."],
  ["Resources", "/resources", "A shelf of guides, notes, and useful links."],
  ["Meet the team", "/team", "Get to know the people who help run Vulcan."],
] as const;

const formatEventDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default async function HomePage() {
  const [events, projects, resources, team] = await Promise.all([
    getEvents(),
    getProjects(),
    getResources(),
    getTeam(),
  ]);
  const count = <T,>(result: { source: string; records: T[] }) =>
    result.source === "supabase" || result.source === "demo" ? result.records.length : "—";

  return (
    <div className="home-page">
      <section className="club-hero">
        <div className="club-hero-stars" aria-hidden="true" />
        <div className="shell club-hero-inner">
          <div className="club-kicker mono">
            <span className="club-kicker-mark" aria-hidden="true" />
            Mirai School of Technology
          </div>
          <h1>Vulcan Club</h1>
          <p className="club-slogan">
            <span className="club-slogan-type" aria-hidden="true">
              Build together. Grow together.
            </span>
            <span className="sr-only">Build together. Grow together.</span>
          </p>
          <div className="home-stats">
            <CommunityStats
              items={[
                { value: count(events), label: "Published events" },
                { value: count(resources), label: "Learning resources" },
                { value: count(projects), label: "Published projects" },
                { value: count(team), label: "Visible team profiles" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="home-initiatives" aria-label="What Vulcan does">
        <div className="shell home-initiative-grid">
          {initiatives.map(({ Icon, title, description, href, link }) => (
            <Link className="home-initiative" href={href} key={title}>
              <Icon className="home-initiative-icon" size={34} strokeWidth={1.8} />
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="home-initiative-link">
                {link} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-line" id="activity">
        <div className="shell home-feed-grid">
          <section className="home-feed-card" aria-labelledby="recent-activity-title">
            <div className="home-module-heading">
              <div>
                <div className="eyebrow mono">From the community / 01</div>
                <h2 className="home-module-title" id="recent-activity-title">
                  Recent Activity
                </h2>
              </div>
              <Link className="feed-heading-link" href="/events">
                All events <ArrowRight size={14} />
              </Link>
            </div>
            <p className="home-module-copy">
              Workshops, build sessions, and ideas from the Vulcan community.
            </p>
            <DataNote result={events} />
            {events.records.length ? (
              <div className="home-activity-list">
                {events.records.slice(0, 4).map((event) => (
                  <Link className="home-activity" href={`/events/${event.slug}`} key={event.id}>
                    <span className="home-activity-date">{formatEventDate(event.starts_at)}</span>
                    <span className="home-activity-main">
                      <strong>{event.title}</strong>
                      <span>{event.description}</span>
                    </span>
                    <span className="tag tag-orange">{event.category}</span>
                    <ArrowUpRight className="home-activity-arrow" size={17} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>New activities are on the way.</strong>
                Published events and workshops will appear here.
              </div>
            )}
          </section>
          <TechNewsFeed />
        </div>
      </section>

      <section className="section section-line home-build-section">
        <div className="shell">
          <div className="home-section-heading">
            <div>
              <div className="eyebrow mono">Build &amp; practice</div>
              <h2 className="section-heading">Turn curiosity into working code.</h2>
            </div>
            <Link className="text-link" href="/competitive-programming">
              More coding practice <ArrowRight size={14} />
            </Link>
          </div>
          <div className="home-build-grid">
            <LiveCodeEditor />
            <CodingPractice />
          </div>
        </div>
      </section>

      <section className="section section-line">
        <div className="shell">
          <div className="home-section-heading">
            <div>
              <div className="eyebrow mono">Good things to explore</div>
              <h2 className="section-heading">Start with a topic. See where it takes you.</h2>
            </div>
            <Link className="text-link" href="/domains">
              All learning domains <ArrowRight size={14} />
            </Link>
          </div>
          <div className="home-domain-pills">
            {domains.map((domain) => (
              <Link className="home-domain-pill" href={domain.route} key={domain.number}>
                {domain.title} <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>

          <div className="home-resource-projects">
            <div className="home-feature-column">
              <div className="home-section-heading home-section-heading-compact">
                <div>
                  <div className="eyebrow mono">Resource shelf</div>
                  <h3>Useful things to learn from</h3>
                </div>
                <Link className="text-link" href="/resources" aria-label="View all resources">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <DataNote result={resources} />
              {resources.records.length ? (
                <div className="home-resource-list">
                  {resources.records.slice(0, 3).map((resource) => (
                    <a
                      className="resource-link"
                      href={resource.url}
                      key={resource.id}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        {resource.title}
                        <small>{resource.category}</small>
                      </span>
                      <ArrowUpRight size={15} />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact-empty">
                  <strong>Resources are being collected.</strong>
                  Guides and useful links will show up here.
                </div>
              )}
            </div>

            <div className="home-feature-column">
              <div className="home-section-heading home-section-heading-compact">
                <div>
                  <div className="eyebrow mono">Member made</div>
                  <h3>Projects from the community</h3>
                </div>
                <Link className="text-link" href="/projects" aria-label="View all projects">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <DataNote result={projects} />
              {projects.records.length ? (
                <div className="home-project-list">
                  {projects.records.slice(0, 2).map((project) => (
                    <Link
                      className="home-project-card"
                      href={`/projects/${project.slug}`}
                      key={project.id}
                    >
                      {project.cover_image_url && (
                        <Image
                          src={project.cover_image_url}
                          alt=""
                          width={88}
                          height={88}
                          unoptimized
                          className="home-project-image"
                        />
                      )}
                      <span className="tag">{project.domain || "Community project"}</span>
                      <strong>{project.title}</strong>
                      <span>{project.description}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact-empty">
                  <strong>Made by Vulcan members.</strong>
                  Published projects and demos will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-line">
        <div className="shell">
          <div className="eyebrow mono">About the club</div>
          <h2 className="section-heading">A place for every curious builder.</h2>
          <p className="section-copy home-about-copy">
            Vulcan Club is a student-led developer community at Mirai School of Technology. We
            create room to learn new skills, ask better questions, and make useful things together.
          </p>
          <div className="home-about-grid">
            <article className="home-about-card">
              <Lightbulb size={24} />
              <h3>Our mission</h3>
              <p>
                Help students grow into confident engineers through practice, mentorship, and
                hands-on projects.
              </p>
            </article>
            <article className="home-about-card">
              <UsersRound size={24} />
              <h3>Our community</h3>
              <p>
                Make a welcoming place where beginners and experienced builders can learn from one
                another.
              </p>
            </article>
            <article className="home-about-card">
              <Code2 size={24} />
              <h3>Our approach</h3>
              <p>
                Learn by making, share what works, and leave the next person a clearer starting
                point.
              </p>
            </article>
          </div>
          <Link className="text-link home-about-link" href="/about">
            More about Vulcan <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="section section-line">
        <div className="shell home-links-section">
          <div>
            <div className="eyebrow mono">Quick links</div>
            <h2 className="section-heading">Pick up where your curiosity leads.</h2>
          </div>
          <div className="home-quick-links">
            {quickLinks.map(([label, href, description]) => (
              <Link href={href} key={href}>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-line home-join-section">
        <div className="shell home-join-card">
          <div>
            <div className="eyebrow mono">Make something with us</div>
            <h2>Bring a question. Leave with a next step.</h2>
            <p>Join a session, meet the team, or tell us what you’d like to build.</p>
          </div>
          <Link className="button" href="/join">
            Join Vulcan <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
