import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { DataNote } from "@/components/data-note";
import { getTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the organizers, mentors, and contributors who make Vulcan Club possible.",
  ...canonicalMetadata("/team"),
};

export default async function TeamPage() {
  const result = await getTeam();
  return (
    <>
      <PageHero
        eyebrow="People / Team"
        title="A community is made by the people in it."
        description="Meet the organizers, mentors, and contributors who make room for people to learn and build together."
      />
      <section className="section">
        <div className="shell">
          <DataNote result={result} />
          {result.records.length ? (
            <div className="card-grid">
              {result.records.map((member) => (
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
                    {member.interests.map((interest) => (
                      <span className="tag" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 23, display: "flex", gap: 17 }}>
                    {member.github_url && (
                      <a
                        className="text-link"
                        href={member.github_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub <ArrowUpRight size={12} />
                      </a>
                    )}
                    {member.linkedin_url && (
                      <a
                        className="text-link"
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        LinkedIn <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>The people behind the club will be introduced here.</strong>We only publish
              team profiles that the organizers have verified and chosen to share.
            </div>
          )}
        </div>
      </section>
      <section className="section-sm section-line">
        <div className="shell">
          <div className="eyebrow mono">Be part of the work</div>
          <h2 className="section-heading">The community changes with each person who joins.</h2>
          <a href="/join" className="button">
            Join Vulcan
          </a>
        </div>
      </section>
    </>
  );
}
