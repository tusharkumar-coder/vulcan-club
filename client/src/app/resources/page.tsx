import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { DataNote } from "@/components/data-note";
import { ResourceDirectory } from "@/components/resource-directory";
import { getResources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Resources",
  description: "Notes, tutorials, guides, and tools curated by the Vulcan Club community.",
  ...canonicalMetadata("/resources"),
};

export default async function ResourcesPage() {
  const result = await getResources();
  return (
    <>
      <PageHero
        eyebrow="Library / Resources"
        title="Good notes make the next step easier."
        description="A growing shelf of learning material, project documentation, open-source guidance, and useful tools curated by the club."
      />
      <section className="section">
        <div className="shell">
          <DataNote result={result} />
          <ResourceDirectory records={result.records} />
        </div>
      </section>
    </>
  );
}
