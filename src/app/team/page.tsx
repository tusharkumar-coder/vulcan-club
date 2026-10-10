import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { DataNote } from "@/components/data-note";
import { TeamDirectory } from "@/components/team-directory";
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
            <TeamDirectory members={result.records} />
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
