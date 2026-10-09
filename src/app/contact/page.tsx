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
        eyebrow="Say hello / Contact"
        title="Have a question, an idea, or a useful link?"
        description="Send a note to the Vulcan Club organizers. We’ll make sure your message reaches the right people."
      />
      <section className="section">
        <div className="shell form-shell">
          <aside className="form-intro">
            <div className="eyebrow mono">Get in touch</div>
            <h2 className="section-heading" style={{ fontSize: "clamp(2rem,3.4vw,3rem)" }}>
              Let’s start with a conversation.
            </h2>
            <p className="section-copy" style={{ fontSize: 14 }}>
              Use the form to ask about events, collaboration, membership, or anything you’re
              curious about.
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
          <div className="admin-panel">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
