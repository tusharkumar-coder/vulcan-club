import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getProject } from "@/lib/data";
import { canonicalMetadata } from "@/lib/site-meta";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  return {
    title: project?.title ?? "Project",
    description: project?.description,
    ...(project ? canonicalMetadata(`/projects/${slug}`) : {}),
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return (
    <>
      <PageHero
        eyebrow={`Projects / ${project.domain ?? "Community work"}`}
        title={project.title}
        description={project.description}
      />
      <section className="section">
        <div className="shell split">
          <div>
            {project.id.startsWith("demo-") && (
              <div className="data-note">
                <span className="tag tag-orange">Preview content</span>
                <span>Fictional local example. This is not a current Vulcan Club project.</span>
              </div>
            )}
            <div className="eyebrow mono">Project notes</div>
            <h2 className="section-heading">Made by learning in public.</h2>
            <p className="section-copy">
              This project is part of the Vulcan Club community showcase. Reach out to the team if
              you’d like to contribute or learn more.
            </p>
            <div className="roadmap-step">
              <span>BY</span>
              <div>
                <h3>Contributors</h3>
                <p>
                  {project.contributors.length
                    ? project.contributors.join(" · ")
                    : "Contributor details to be added."}
                </p>
              </div>
            </div>
            <div className="roadmap-step">
              <span>IN</span>
              <div>
                <h3>Technology</h3>
                <p>{project.technologies.join(" · ") || "Details to be added."}</p>
              </div>
            </div>
            <div style={{ marginTop: 26, display: "flex", gap: 18, flexWrap: "wrap" }}>
              {project.repository_url && (
                <a
                  className="button"
                  href={project.repository_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open repository <ArrowUpRight size={14} />
                </a>
              )}
              {project.demo_url && (
                <a
                  className="button button-secondary"
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Try the demo <ArrowUpRight size={14} />
                </a>
              )}
            </div>
            <div style={{ marginTop: 25 }}>
              <Link href="/projects" className="text-link">
                <ArrowLeft size={13} /> Back to projects
              </Link>
            </div>
          </div>
          <div className="split-visual">
            {project.cover_image_url && (
              <Image
                src={project.cover_image_url}
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
                unoptimized
                className="detail-cover-image"
              />
            )}
            <div className="visual-label mono">
              <span>{project.domain ?? "VULCAN PROJECT"}</span>
              <span>WORK / {project.slug.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
