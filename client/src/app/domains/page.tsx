import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { domains } from "@/lib/domains";
import { DataNote } from "@/components/data-note";
import { getDomains } from "@/lib/data";
import { Braces, Cpu, GitBranch, Layers3, Rocket, Terminal, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Domains",
  description: "Explore the technical domains and learning paths at Vulcan Club.",
  ...canonicalMetadata("/domains"),
};

const icons: Record<string, LucideIcon> = {
  "competitive-programming": Trophy,
  "competitive-programming-and-dsa": Trophy,
  "web-development": Braces,
  "artificial-intelligence-and-machine-learning": Cpu,
  "ai-machine-learning": Cpu,
  "open-source": GitBranch,
  "app-development": Layers3,
  "systems-developer-tools": Terminal,
  "systems-and-developer-tools": Terminal,
  "hackathons-product-building": Rocket,
  "hackathons-and-product-building": Rocket,
};
const starterPaths: Record<string, string[]> = {
  "competitive-programming": [
    "Foundations",
    "Core structures",
    "Graph thinking",
    "Patterns & proof",
  ],
  "web-development": [
    "Web foundations",
    "Interfaces & APIs",
    "Persistence",
    "Accessibility & ship",
  ],
  "ai-machine-learning": ["Python & data", "Model basics", "Evaluation", "Responsible deployment"],
  "open-source": [
    "Git & project norms",
    "Find a useful issue",
    "Patch & review",
    "Document the learning",
  ],
  "app-development": [
    "Platform foundations",
    "UI & state",
    "Device capabilities",
    "Test & release",
  ],
  "systems-developer-tools": [
    "Linux & fundamentals",
    "Explore the stack",
    "Build a small tool",
    "Measure & document",
  ],
  "hackathons-product-building": [
    "Frame the problem",
    "Prototype a slice",
    "Test with people",
    "Tell the story",
  ],
};
function roadmapLabels(roadmap: unknown[], slug: string) {
  const labels = roadmap.flatMap((item) =>
    item && typeof item === "object" && "step" in item && typeof item.step === "string"
      ? [item.step]
      : [],
  );
  return labels.length ? labels : (starterPaths[slug] ?? ["Explore", "Practice", "Build", "Share"]);
}
function domainSlug(title: string, route: string) {
  if (route === "/competitive-programming") return "competitive-programming";
  if (title.toLowerCase().includes("artificial") || title.toLowerCase().startsWith("ai "))
    return "ai-machine-learning";
  if (title.toLowerCase().includes("systems")) return "systems-developer-tools";
  if (title.toLowerCase().includes("hackathon")) return "hackathons-product-building";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function DomainsPage() {
  const result = await getDomains();
  const cards = result.records.length
    ? result.records.map((domain, index) => ({
        number: String(index + 1).padStart(2, "0"),
        title: domain.name,
        short: "A path to explore.",
        description: domain.description,
        tools: domain.technologies,
        slug: domain.slug,
        Icon: icons[domain.slug] ?? Braces,
        roadmap: roadmapLabels(domain.roadmap, domain.slug),
      }))
    : result.source === "empty"
      ? domains.map(({ number, title, short, description, tools, route, icon }) => {
          const slug = domainSlug(title, route);
          return {
            number,
            title,
            short,
            description,
            tools,
            slug,
            Icon: icon,
            roadmap: starterPaths[slug] ?? ["Explore", "Practice", "Build", "Share"],
          };
        })
      : [];
  return (
    <>
      <PageHero
        eyebrow="Explore / Domains"
        title="Follow the question that won’t leave you alone."
        description="Seven connected paths through computer science and software creation. Start with a curiosity; the roadmap can grow with you."
      />
      <section className="section">
        <div className="shell">
          <DataNote result={result} />
          <div className="data-note">
            <span className="tag tag-orange">Open invitation</span>
            <span>
              Domain interests are a starting point, not a gate. Members can explore across tracks
              and change direction as they learn.
            </span>
          </div>
          {cards.length ? (
            <div className="card-grid">
              {cards.map(({ number, title, short, description, tools, slug, Icon, roadmap }) => (
                <article className="card" key={slug}>
                  <span className="card-index">{number} / DOMAIN</span>
                  <span className="card-arrow">
                    <Icon size={18} />
                  </span>
                  <h3>{title}</h3>
                  <p>
                    <strong style={{ color: "#d9e1ec", fontWeight: 500 }}>{short}</strong>{" "}
                    {description}
                  </p>
                  <div className="micro" style={{ marginTop: 18 }}>
                    Starter progression
                  </div>
                  <div className="card-meta">
                    {roadmap.map((step, index) => (
                      <span className="tag" key={`${step}-${index}`}>
                        {step}
                      </span>
                    ))}
                  </div>
                  <div className="micro" style={{ marginTop: 18 }}>
                    Technologies & tools
                  </div>
                  <div className="card-meta">
                    {tools.map((tool) => (
                      <span className="tag" key={tool}>
                        {tool}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 24, display: "flex", gap: 18, flexWrap: "wrap" }}>
                    <Link
                      className="text-link"
                      href={
                        slug.includes("competitive-programming")
                          ? "/competitive-programming"
                          : `/projects?domain=${encodeURIComponent(title)}`
                      }
                    >
                      {slug.includes("competitive-programming")
                        ? "Explore practice path"
                        : "Related projects"}{" "}
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      className="text-link"
                      href={`/join?interest=${encodeURIComponent(title)}`}
                    >
                      Express interest <ArrowRight size={13} />
                    </Link>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Link className="text-link" href="/events">
                      Upcoming events <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No public domains are configured.</strong>An administrator can add domain
              tracks in the dashboard.
            </div>
          )}
        </div>
      </section>
      <section className="section-sm section-line">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">Share a direction</div>
            <h2 className="section-heading">What do you want to explore?</h2>
            <p className="section-copy">
              Tell us what you’re curious about, even if you don’t know the name for it yet.
            </p>
          </div>
          <Link className="button" href="/join">
            Express interest <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
