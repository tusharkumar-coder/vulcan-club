import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { DataNote } from "@/components/data-note";
import { ProjectDirectory } from "@/components/project-directory";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore software and experiments built by the Vulcan Club community.",
  ...canonicalMetadata("/projects"),
};

type Props = { searchParams: Promise<{ domain?: string }> };
export default async function ProjectsPage({ searchParams }: Props) {
  const [{ domain }, result] = await Promise.all([searchParams, getProjects()]);
  const available = result.records.some((project) => project.domain === domain);
  return (
    <>
      <PageHero
        eyebrow="Showcase / Projects"
        title="A shelf of ideas made tangible."
        description="Tools, prototypes, experiments, and open-source work from the community. Published projects link to their real code and demos."
      />
      <section className="section">
        <div className="shell">
          <DataNote result={result} />
          <ProjectDirectory
            records={result.records}
            initialDomain={available ? domain : undefined}
          />
        </div>
      </section>
      <section className="section-sm section-line">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">Have something in progress?</div>
            <h2 className="section-heading">Make the next project yours.</h2>
            <p className="section-copy">
              Share an idea, find a collaborator, or tell us what you’ve been building.
            </p>
          </div>
          <a href="/join" className="button">
            Start a conversation
          </a>
        </div>
      </section>
    </>
  );
}
