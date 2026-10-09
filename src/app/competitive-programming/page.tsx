import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getEvents } from "@/lib/data";
import { DataNote } from "@/components/data-note";

export const metadata: Metadata = {
  title: "Competitive Programming",
  description: "A practical progression for algorithmic problem solving and contest practice.",
  ...canonicalMetadata("/competitive-programming"),
};
const steps = [
  [
    "01 / Foundations",
    "Complexity, implementation fluency, sorting, binary search, prefix sums, and two pointers.",
  ],
  [
    "02 / Core structures",
    "Stacks, queues, hash maps, heaps, trees, disjoint sets, and when each structure fits.",
  ],
  [
    "03 / Graph thinking",
    "Traversal, shortest paths, topological order, spanning trees, and graph modeling.",
  ],
  [
    "04 / Patterns & proof",
    "Dynamic programming, greedy reasoning, invariants, and explaining why a solution works.",
  ],
];
const resources = [
  ["Codeforces", "Contests and problem sets", "https://codeforces.com/"],
  ["AtCoder", "Carefully designed programming contests", "https://atcoder.jp/"],
  ["CodeChef", "Practice and contest problems", "https://www.codechef.com/"],
  ["LeetCode", "Interview-style problems and practice", "https://leetcode.com/"],
  ["CP-Algorithms", "Community-maintained algorithm reference", "https://cp-algorithms.com/"],
];

export default async function CompetitiveProgrammingPage() {
  const events = await getEvents();
  const sessions = events.records.filter((event) =>
    /contest|practice|algorithm|problem|study/i.test(`${event.title} ${event.category}`),
  );
  return (
    <>
      <PageHero
        eyebrow="Practice / Competitive programming"
        title="Get comfortable with hard problems."
        description="A steady practice path for students who want to reason clearly under constraints, learn useful patterns, and enjoy the process."
      />
      <section className="section">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">A useful progression</div>
            <h2 className="section-heading">Build depth one pattern at a time.</h2>
            <p className="section-copy">
              Use this as a flexible map, not a checklist. Revisit topics, compare approaches, and
              explain your reasoning out loud.
            </p>
          </div>
          <div className="roadmap">
            {steps.map(([title, copy]) => (
              <div className="roadmap-step" key={title}>
                <span>{title.slice(0, 2)}</span>
                <div>
                  <h3>{title.slice(5)}</h3>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-sm section-line">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">Practice platforms</div>
            <h2 className="section-heading">Find a good problem. Then think.</h2>
            <p className="section-copy">
              These public platforms have practice archives and contest schedules. Vulcan Club does
              not claim a partnership with them.
            </p>
          </div>
          <div className="link-list" style={{ display: "grid" }}>
            {resources.map(([title, copy, url]) => (
              <a key={title} className="resource-link" href={url} target="_blank" rel="noreferrer">
                <span>
                  {title}
                  <small>{copy}</small>
                </span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-line">
        <div className="shell">
          <div className="eyebrow mono">Practice together</div>
          <h2 className="section-heading">Club sessions and contests</h2>
          <DataNote result={events} />
          {sessions.length ? (
            <div className="card-grid">
              {sessions.map((event) => (
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
                  <span className="tag tag-orange">{event.category}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No practice sessions published.</strong>When the club schedules a
              problem-solving session or contest, it will appear here and on the events page.
            </div>
          )}
        </div>
      </section>
      <section className="section-sm section-line">
        <div className="shell">
          <div className="eyebrow mono">A few good habits</div>
          <div className="card-grid">
            <article className="card">
              <span className="card-index">01 / ATTEMPT</span>
              <h3>Write the model first.</h3>
              <p>
                Translate the statement into inputs, outputs, constraints, and a concrete plan
                before opening the editor.
              </p>
            </article>
            <article className="card">
              <span className="card-index">02 / REVIEW</span>
              <h3>Learn from the miss.</h3>
              <p>
                After a contest, identify the idea you didn’t see and solve a similar problem while
                it’s fresh.
              </p>
            </article>
            <article className="card">
              <span className="card-index">03 / SHARE</span>
              <h3>Explain it simply.</h3>
              <p>
                Talking through a solution reveals hidden assumptions and helps someone else find
                their footing.
              </p>
            </article>
          </div>
          <div style={{ marginTop: 28 }}>
            <Link className="button" href="/join">
              Practice with Vulcan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
