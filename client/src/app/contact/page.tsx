import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Vulcan Club at Mirai School of Technology.",
  ...canonicalMetadata("/contact"),
};

export default function ContactPage() {
  const links = [
    ["GitHub", process.env.NEXT_PUBLIC_GITHUB_URL],
    ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
    ["LinkedIn", process.env.NEXT_PUBLIC_LINKEDIN_URL],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  return (
    <>
      <PageHero
        eyebrow="// contact"
        title="Initialize Connection"
        description="Send a message to the Vulcan Club organizers. We’ll make sure it reaches the right people."
      />
      <section className="section">
        <div className="shell form-shell">
          <aside className="form-intro">
            <div className="eyebrow mono">const destination = &quot;Vulcan Club&quot;;</div>
            <h2 className="section-heading" style={{ fontSize: "clamp(2rem,3.4vw,3rem)" }}>
              Your next idea starts here.
            </h2>
            <p className="section-copy" style={{ fontSize: 14 }}>
              Ask about events, collaboration, membership, or anything you’re curious about. The
              club team will get back to you by email.
            </p>
            {process.env.NEXT_PUBLIC_CLUB_EMAIL && (
              <p>
                <span className="micro">Email</span>
                <br />
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_CLUB_EMAIL}`}
                  style={{ color: "var(--cyan)" }}
                >
                  {process.env.NEXT_PUBLIC_CLUB_EMAIL}
                </a>
              </p>
            )}
            {links.length > 0 && (
              <div className="link-list">
                {links.map(([name, url]) => (
                  <a className="text-link" href={url} target="_blank" rel="noreferrer" key={name}>
                    {name} <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            )}
          </aside>
          <div className="contact-console">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
