import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { DataNote } from "@/components/data-note";
import { LeaderboardDirectory } from "@/components/leaderboard-directory";
import { canonicalMetadata } from "@/lib/site-meta";
import { getLeaderboardEntries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Leaderboards & Results",
  description: "Track Vulcan Club contest results and student rankings across years.",
  ...canonicalMetadata("/leaderboards"),
};

export default async function LeaderboardsPage() {
  const result = await getLeaderboardEntries();
  return (
    <>
      <PageHero
        eyebrow="Compete / Leaderboards"
        title="Leaderboards & Results"
        description="Track performance across contests. Explore results by contest or see cumulative standings by year."
      />
      <section className="section">
        <div className="shell">
          <DataNote result={result} />
          <LeaderboardDirectory entries={result.records} />
        </div>
      </section>
    </>
  );
}
