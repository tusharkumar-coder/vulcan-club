import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { JoinForm } from "@/components/join-form";

export const metadata: Metadata = {
  title: "Join Vulcan",
  description: "Share what you would like to learn or build with the Vulcan Club community.",
  ...canonicalMetadata("/join"),
};

type Props = { searchParams: Promise<{ interest?: string }> };
export default async function JoinPage({ searchParams }: Props) {
  const { interest } = await searchParams;
  const value = interest?.toLowerCase() ?? "";
  const initialInterest = value.includes("competitive")
    ? "Competitive programming & DSA"
    : value.includes("web")
      ? "Web development"
      : value.includes("intelligence") || value.includes("machine") || value.includes("ai-")
        ? "AI & machine learning"
        : value.includes("open-source")
          ? "Open source"
          : value.includes("app")
            ? "App development"
            : value.includes("systems")
              ? "Systems & developer tools"
              : value.includes("hackathon") || value.includes("product")
                ? "Hackathons & product building"
                : undefined;
  return (
    <>
      <PageHero
        eyebrow="Start here / Join Vulcan"
        title="Bring your curiosity. We’ll find a place to begin."
        description="Tell the club a little about you and the things you want to explore. You don’t need an impressive portfolio to get started."
      />
      <section className="section">
        <div className="shell form-shell">
          <aside className="form-intro">
            <div className="eyebrow mono">A few things to know</div>
            <h2 className="section-heading" style={{ fontSize: "clamp(2rem,3.4vw,3rem)" }}>
              No one starts as an expert.
            </h2>
            <p className="section-copy" style={{ fontSize: 14 }}>
              Share only what you’re comfortable sharing. Student ID is not requested. Your
              application is visible only to authorized club administrators.
            </p>
            <p className="muted" style={{ fontSize: 12 }}>
              Need a different route in?{" "}
              <a href="/contact" style={{ color: "var(--cyan)", textDecoration: "underline" }}>
                Send us a note
              </a>
              .
            </p>
          </aside>
          <div className="admin-panel">
            <JoinForm initialInterest={initialInterest} />
          </div>
        </div>
      </section>
    </>
  );
}
