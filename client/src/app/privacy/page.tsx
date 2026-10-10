import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Vulcan Club handles membership interest forms and contact messages.",
  ...canonicalMetadata("/privacy"),
};
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Notices / Privacy"
        title="Your information, handled with care."
        description="This notice describes the information this site asks you to share and how the club uses it."
      />
      <section className="section">
        <div className="shell legal-copy">
          <p>
            Vulcan Club at Mirai School of Technology collects only the details submitted through
            the join, contact, and event registration forms.
          </p>
          <h2>Why information is collected</h2>
          <p>
            Membership interest details help organizers respond to your interest and plan community
            activities. Contact details are used to reply to your message. Event registration
            details are used to manage attendance and communicate session updates.
          </p>
          <h2>What is collected</h2>
          <p>
            Forms request your name, email address, and information relevant to the specific
            request. The membership form does not request a student ID. Optional profile links and
            your stated interests are used only to understand how you might like to participate.
          </p>
          <h2>Access and retention</h2>
          <p>
            Application and contact records are restricted to authorized club administrators. The
            club should remove records when they are no longer needed for the purpose for which they
            were collected. For a correction or deletion request, use the contact form and explain
            what you need.
          </p>
          <h2>Service providers</h2>
          <p>
            When configured, Supabase hosts application data and authentication. This site does not
            claim a provider has been configured until an administrator completes setup.
          </p>
          <h2>Questions</h2>
          <p>
            For privacy questions, contact the club using the{" "}
            <a href="/contact" style={{ color: "var(--cyan)", textDecoration: "underline" }}>
              contact form
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
