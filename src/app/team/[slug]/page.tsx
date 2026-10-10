import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Github, Instagram, Linkedin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getTeamMember } from "@/lib/data";
import { canonicalMetadata } from "@/lib/site-meta";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  return {
    title: member?.name ?? "Team profile",
    description: member?.bio ?? `${member?.role ?? "Vulcan Club team member"} at Vulcan Club.`,
    ...(member ? canonicalMetadata(`/team/${slug}`) : {}),
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  if (!member) notFound();

  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <PageHero
        eyebrow={`People / ${member.slug}`}
        title={member.name}
        description={member.role}
      />
      <section className="section team-profile-section">
        <div className="shell">
          <Link href="/team" className="text-link team-profile-back">
            <ArrowLeft size={14} /> Back to the team
          </Link>
          <div className="team-profile-layout">
            <div className="team-profile-image-frame">
              {member.image_url ? (
                <Image
                  src={member.image_url}
                  alt={`${member.name} profile`}
                  width={640}
                  height={800}
                  unoptimized
                  className="team-profile-image"
                />
              ) : (
                <span className="team-profile-avatar-fallback" aria-hidden="true">
                  {initials}
                </span>
              )}
            </div>
            <div className="team-profile-content">
              <div className="eyebrow mono">01 / About</div>
              <h2 className="section-heading">About</h2>
              <p className="section-copy team-profile-bio">
                {member.bio || "This team member’s introduction will be added soon."}
              </p>

              <div className="team-profile-skills">
                <div className="eyebrow mono">02 / Skills</div>
                <h2 className="section-heading">Skills &amp; tools</h2>
                {member.skills?.length ? (
                  <div className="team-profile-skill-list">
                    {member.skills.map((skill) => (
                      <span className="tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Skills and tools will be added soon.</p>
                )}
              </div>

              {member.interests.length > 0 && (
                <div className="team-profile-skills">
                  <div className="eyebrow mono">03 / Exploring</div>
                  <h2 className="section-heading">Areas of interest</h2>
                  <div className="team-profile-skill-list">
                    {member.interests.map((interest) => (
                      <span className="tag" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(member.github_url || member.linkedin_url || member.instagram_url) && (
                <div
                  className="team-profile-socials"
                  role="group"
                  aria-label={`${member.name} social links`}
                >
                  {member.github_url && (
                    <a
                      className="team-social-link"
                      href={member.github_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on GitHub`}
                      title="GitHub"
                    >
                      <Github size={17} />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      className="team-social-link"
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      title="LinkedIn"
                    >
                      <Linkedin size={17} />
                    </a>
                  )}
                  {member.instagram_url && (
                    <a
                      className="team-social-link"
                      href={member.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on Instagram`}
                      title="Instagram"
                    >
                      <Instagram size={17} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
